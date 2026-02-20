<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, withDefaults } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { Product } from "../../../../../../configs";
import { ProductType } from "../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../apollo-client";
import {
  bundleVariationsQuery,
  configurableVariationsQuery,
  productsWithImagesQuery,
} from "../../../../../../../../../shared/api/queries/products.js";
import { mediaProductThroughQuery } from "../../../../../../../../../shared/api/queries/media.js";
import { integrationsQuery } from "../../../../../../../../../shared/api/queries/integrations.js";
import {
  createMediaProductThroughsMutation,
  deleteMediaProductThroughsMutation,
  updateMediaProductThroughMutation,
  updateFileMutation,
} from "../../../../../../../../../shared/api/mutations/media.js";
import { documentTypesQuerySelector } from "../../../../../../../../../shared/api/queries/documentTypes.js";
import { companyLanguagesQuery } from "../../../../../../../../../shared/api/queries/languages.js";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Card } from "../../../../../../../../../shared/components/atoms/card";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Image as ProductImage } from "../../../../../../../../../shared/components/atoms/image";
import { Modal } from "../../../../../../../../../shared/components/atoms/modal";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { TextEditor } from "../../../../../../../../../shared/components/atoms/input-text-editor";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { shortenText } from "../../../../../../../../../shared/utils";
import { CreateDocumentsModal } from "../../../../../../../../media/files/containers/create-modals/documents-modal";
import { UploadMediaModal } from "../../../media/containers/upload-media-modal";
import { TYPE_DOCUMENT } from "../../../../../../../../media/files/media";

interface VariationDocumentSlot {
  id: string | null;
  productId: string;
  mediaId: string;
  mediaProxyId: string | null;
  mediaUrl: string | null;
  mediaName: string | null;
  title?: string | null;
  description?: string | null;
  documentTypeId?: string | null;
  documentTypeName?: string | null;
  documentLanguage?: string | null;
  sortOrder: number | null;
  uploadSource?: 'existing' | 'uploaded';
}

interface VariationRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
    type?: string;
  };
  documents: (VariationDocumentSlot | null)[];
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] }
);

const { t } = useI18n();

const WEBHOOK_CHANNEL_TYPE = 'webhook';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const uploadContext = ref<{ rowIndex: number; columnIndex: number | null } | null>(null);
const selectExistingModalVisible = ref(false);
const uploadDocumentsModalVisible = ref(false);
const expandedPlaceholder = ref<{ rowIndex: number; columnIndex: number } | null>(null);
const salesChannels = ref<any[]>([]);
const currentSalesChannel = ref<'default' | string>('default');
const previousSalesChannel = ref<'default' | string>('default');
const skipChannelWatch = ref(false);
const inheritedFromDefault = ref(false);

const documentEditModalVisible = ref(false);
const documentEditContext = ref<{ rowIndex: number; columnIndex: number } | null>(null);
const editMediaId = ref<string | null>(null);
const editMediaUrl = ref<string | null>(null);
const editTitle = ref('');
const editDescription = ref('');
const editDocumentTypeId = ref<string | null>(null);
const editDocumentLanguage = ref<string | null>(null);
const syncingEditForm = ref(false);
const editedMediaIds = ref<Set<string>>(new Set());

const documentTypeOptions = ref<{ label: string; value: string }[]>([]);
const documentLanguageOptions = ref<{ label: string; value: string }[]>([]);

const assignedMediaIds = computed(() =>
  variations.value.flatMap((row) =>
    row.documents
      .map((slot) => slot?.mediaId)
      .filter((id): id is string => Boolean(id))
  )
);

const currentSalesChannelId = computed(() => (currentSalesChannel.value === 'default' ? null : currentSalesChannel.value));

const salesChannelOptions = computed(() => [
  {
    name: t('products.products.variations.content.selectors.defaultChannel'),
    value: 'default',
  },
  ...salesChannels.value.map((channel: any) => ({
    name: channel.name || channel.hostname || channel.type || '',
    value: channel.id,
  })),
]);

const isSingleUpload = computed(() => uploadContext.value?.columnIndex !== null);

const hasProductIds = computed(() => props.productIds.length > 0);
const isAlias = computed(() => props.product?.type === ProductType.Alias);
const parentProduct = computed(() => {
  if (!props.product) {
    return null;
  }
  return isAlias.value ? props.product.aliasParentProduct : props.product;
});
const parentProductType = computed(() => parentProduct.value?.type ?? null);
const isChannelInherited = computed(
  () => currentSalesChannel.value !== 'default' && inheritedFromDefault.value
);

const baseColumns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
  { key: 'upload', label: t('products.products.variations.documents.columns.upload'), editable: false, initialWidth: 160 },
]);

const documentColumnCount = computed(() => {
  const maxColumns = variations.value.reduce((max, row) => Math.max(max, row.documents.length), 0);
  return Math.max(maxColumns, 1);
});

const documentColumns = computed<MatrixColumn[]>(() =>
  Array.from({ length: documentColumnCount.value }, (_, index) => ({
    key: `document-${index}`,
    label: t('products.products.variations.documents.columns.document', { index: index + 1 }),
    editable: true,
    initialWidth: 200,
    beforeInsert: () => insertDocumentColumn(index),
    afterInsert: () => insertDocumentColumn(index + 1),
  }))
);

const columns = computed<MatrixColumn[]>(() => [
  ...baseColumns.value,
  ...documentColumns.value,
]);

const hasChanges = computed(
  () => JSON.stringify(variations.value) !== JSON.stringify(originalVariations.value)
);

const hasUnsavedChanges = hasChanges;

const askDiscardChanges = async () => {
  if (!hasChanges.value) return true;
  const res = await Swal.fire({
    icon: 'warning',
    text: t('products.products.messages.unsavedChanges'),
    showCancelButton: true,
    confirmButtonText: t('shared.button.cancel'),
    cancelButtonText: t('shared.button.leaveTab'),
  });
  return res.dismiss === Swal.DismissReason.cancel;
};

const copySkuToClipboard = async (sku: string) => {
  try {
    await navigator.clipboard.writeText(sku);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const parseDocumentColumnKey = (key: string) => {
  if (!key.startsWith('document-')) return null;
  const index = Number(key.replace('document-', ''));
  if (Number.isNaN(index)) return null;
  return index;
};

const ensureDocumentCapacity = (row: VariationRow, index: number) => {
  while (row.documents.length <= index) {
    row.documents.push(null);
  }
};

const insertDocumentColumn = (insertIndex: number) => {
  variations.value.forEach((row) => {
    while (row.documents.length < insertIndex) {
      row.documents.push(null);
    }
    row.documents.splice(insertIndex, 0, null);
  });
  if (expandedPlaceholder.value) {
    closePlaceholder();
  }
};

const getDocumentColumnIndex = (columnKey: string) => parseDocumentColumnKey(columnKey) ?? 0;

const normalizeDocumentSlot = (
  value: any,
  productId: string,
  currentSlotId?: string | null
): VariationDocumentSlot | null => {
  if (!value || !value.mediaId) {
    return null;
  }
  const preserveId =
    value.productId === productId &&
    value.id &&
    value.id === (currentSlotId ?? null);
  return {
    id: preserveId ? value.id : null,
    productId,
    mediaId: value.mediaId,
    mediaProxyId: value.mediaProxyId ?? value.proxyId ?? value.mediaId ?? null,
    mediaUrl: value.mediaUrl ?? null,
    mediaName: value.mediaName ?? null,
    title: value.title ?? null,
    description: value.description ?? null,
    documentTypeId: value.documentTypeId ?? value.documentType?.id ?? null,
    documentTypeName: value.documentTypeName ?? value.documentType?.name ?? null,
    documentLanguage: value.documentLanguage ?? null,
    sortOrder: value.sortOrder ?? null,
    uploadSource: value.uploadSource,
  };
};

const getMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const columnIndex = parseDocumentColumnKey(columnKey);
  if (columnIndex === null) {
    return null;
  }
  const row = variations.value[rowIndex];
  if (!row) return null;
  const slot = row.documents[columnIndex];
  return slot ? JSON.parse(JSON.stringify(slot)) : null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const columnIndex = parseDocumentColumnKey(columnKey);
  if (columnIndex === null) {
    return;
  }
  const row = variations.value[rowIndex];
  if (!row) return;
  ensureDocumentCapacity(row, columnIndex);
  const currentSlot = row.documents[columnIndex];
  const slot = normalizeDocumentSlot(value, row.variation.id, currentSlot?.id ?? null);
  row.documents.splice(columnIndex, 1, slot);
  if (slot && isPlaceholderExpanded(rowIndex, columnIndex)) {
    closePlaceholder();
  }
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  setMatrixCellValue(toRow, columnKey, value);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const columnIndex = parseDocumentColumnKey(columnKey);
  if (columnIndex === null) {
    return;
  }
  const row = variations.value[rowIndex];
  if (!row) return;
  if (row.documents.length > columnIndex) {
    row.documents.splice(columnIndex, 1, null);
  }
};

const resolveTargetIndex = (row: VariationRow, columnIndex: number | null) => {
  if (columnIndex != null) {
    ensureDocumentCapacity(row, columnIndex);
    return columnIndex;
  }
  const emptyIndex = row.documents.findIndex((slot) => !slot);
  if (emptyIndex !== -1) {
    ensureDocumentCapacity(row, emptyIndex);
    return emptyIndex;
  }
  const targetIndex = row.documents.length;
  ensureDocumentCapacity(row, targetIndex);
  return targetIndex;
};

const assignMediaToRow = (
  rowIndex: number,
  columnIndex: number | null,
  media: any,
  source: 'existing' | 'uploaded'
) => {
  const row = variations.value[rowIndex];
  if (!row) {
    return;
  }
  const resolvedMedia = media?.media ?? media;
  if (!resolvedMedia?.id) {
    return;
  }
  const targetIndex = resolveTargetIndex(row, columnIndex);
  const slotValue: VariationDocumentSlot = {
    id: null,
    productId: row.variation.id,
    mediaId: resolvedMedia.id,
    mediaProxyId: resolvedMedia.proxyId ?? resolvedMedia.mediaProxyId ?? resolvedMedia.id ?? null,
    mediaUrl: resolvedMedia.documentImageThumbnailUrl ?? null,
    mediaName:
      resolvedMedia.file?.name ??
      resolvedMedia.mediaName ??
      resolvedMedia.name ??
      null,
    title: resolvedMedia.title ?? null,
    description: resolvedMedia.description ?? null,
    documentTypeId: resolvedMedia.documentType?.id ?? null,
    documentTypeName: resolvedMedia.documentType?.name ?? null,
    documentLanguage: resolvedMedia.documentLanguage ?? null,
    sortOrder: null,
    uploadSource: source,
  };
  setMatrixCellValue(rowIndex, `document-${targetIndex}`, slotValue);
};

const openSelectExistingModal = (rowIndex: number, columnIndex: number | null = null) => {
  uploadContext.value = { rowIndex, columnIndex };
  selectExistingModalVisible.value = true;
};

const openUploadDocumentsModal = (rowIndex: number, columnIndex: number | null = null) => {
  uploadContext.value = { rowIndex, columnIndex };
  uploadDocumentsModalVisible.value = true;
};

const handlePlaceholderAction = (
  action: 'upload' | 'existing',
  rowIndex: number,
  columnIndex: number
) => {
  if (action === 'upload') {
    openUploadDocumentsModal(rowIndex, columnIndex);
  } else {
    openSelectExistingModal(rowIndex, columnIndex);
  }
  closePlaceholder();
};

const resetUploadContext = () => {
  if (!selectExistingModalVisible.value && !uploadDocumentsModalVisible.value) {
    uploadContext.value = null;
  }
};

const handleExistingSelected = (media: any) => {
  if (!uploadContext.value) {
    selectExistingModalVisible.value = false;
    return;
  }
  assignMediaToRow(uploadContext.value.rowIndex, uploadContext.value.columnIndex, media, 'existing');
  selectExistingModalVisible.value = false;
};

const handleDocumentsCreated = (documents: any[]) => {
  if (!uploadContext.value) {
    uploadDocumentsModalVisible.value = false;
    return;
  }
  const createdDocuments = Array.isArray(documents) ? documents : documents ? [documents] : [];
  if (!createdDocuments.length) {
    uploadDocumentsModalVisible.value = false;
    return;
  }
  const { rowIndex, columnIndex } = uploadContext.value;
  if (columnIndex != null) {
    assignMediaToRow(rowIndex, columnIndex, createdDocuments[0], 'uploaded');
  } else {
    createdDocuments.forEach((document) => {
      assignMediaToRow(rowIndex, null, document, 'uploaded');
    });
  }
  uploadDocumentsModalVisible.value = false;
};

const isUnsavedSlot = (slot: VariationDocumentSlot | null | undefined) => !!slot && !slot.id;

const isPlaceholderExpanded = (rowIndex: number, columnIndex: number) =>
  expandedPlaceholder.value?.rowIndex === rowIndex && expandedPlaceholder.value?.columnIndex === columnIndex;

const togglePlaceholder = (rowIndex: number, columnIndex: number) => {
  if (isPlaceholderExpanded(rowIndex, columnIndex)) {
    expandedPlaceholder.value = null;
    return;
  }
  expandedPlaceholder.value = { rowIndex, columnIndex };
};

const closePlaceholder = () => {
  expandedPlaceholder.value = null;
};

const normalizeTextValue = (value?: string | null) => (value ?? '').trim();

const applyEditFormFromSlot = (slot: VariationDocumentSlot) => {
  syncingEditForm.value = true;
  editTitle.value = slot.title ?? '';
  editDescription.value = slot.description ?? '';
  editDocumentTypeId.value = slot.documentTypeId ?? null;
  editDocumentLanguage.value = slot.documentLanguage ?? null;
  syncingEditForm.value = false;
};

const openDocumentEditModal = (rowIndex: number, columnIndex: number) => {
  const row = variations.value[rowIndex];
  const slot = row?.documents[columnIndex] ?? null;
  if (!slot || !slot.mediaId) {
    return;
  }
  documentEditContext.value = { rowIndex, columnIndex };
  editMediaId.value = slot.mediaId;
  editMediaUrl.value = slot.mediaUrl ?? null;
  applyEditFormFromSlot(slot);
  documentEditModalVisible.value = true;
};

const closeDocumentEditModal = () => {
  documentEditModalVisible.value = false;
  documentEditContext.value = null;
  editMediaId.value = null;
  editMediaUrl.value = null;
  editTitle.value = '';
  editDescription.value = '';
  editDocumentTypeId.value = null;
  editDocumentLanguage.value = null;
};

const applyDocumentEdits = () => {
  if (!documentEditContext.value || !editMediaId.value) {
    closeDocumentEditModal();
    return;
  }
  const updatedTitle = normalizeTextValue(editTitle.value) || null;
  const updatedDescription = normalizeTextValue(editDescription.value) || null;
  const updatedTypeId = editDocumentTypeId.value ?? null;
  const updatedTypeName = documentTypeOptions.value.find((option) => option.value === updatedTypeId)?.label ?? null;
  const updatedLanguage = editDocumentLanguage.value ?? null;

  const hasChangesForMedia = variations.value.some((row) =>
    row.documents.some((slot) => {
      if (!slot || slot.mediaId !== editMediaId.value) {
        return false;
      }
      return (
        normalizeTextValue(slot.title) !== normalizeTextValue(updatedTitle) ||
        normalizeTextValue(slot.description) !== normalizeTextValue(updatedDescription) ||
        (slot.documentTypeId ?? null) !== updatedTypeId ||
        (slot.documentLanguage ?? null) !== updatedLanguage
      );
    })
  );

  variations.value.forEach((row) => {
    row.documents.forEach((slot) => {
      if (!slot || slot.mediaId !== editMediaId.value) {
        return;
      }
      slot.title = updatedTitle;
      slot.description = updatedDescription;
      slot.documentTypeId = updatedTypeId;
      slot.documentTypeName = updatedTypeName;
      slot.documentLanguage = updatedLanguage;
    });
  });

  if (hasChangesForMedia) {
    editedMediaIds.value.add(editMediaId.value);
  }

  closeDocumentEditModal();
};

watch([editTitle, editDescription, editDocumentTypeId, editDocumentLanguage], () => {
  if (!syncingEditForm.value && editMediaId.value) {
    editedMediaIds.value.add(editMediaId.value);
  }
});

watch(currentSalesChannel, async (newChannel) => {
  await handleSalesChannelChange(newChannel);
});
watch(selectExistingModalVisible, resetUploadContext);
watch(uploadDocumentsModalVisible, resetUploadContext);

const moveDocument = (rowIndex: number, columnIndex: number, direction: -1 | 1) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  const targetIndex = columnIndex + direction;
  if (targetIndex < 0) {
    return;
  }
  ensureDocumentCapacity(row, targetIndex);
  const currentSlot = row.documents[columnIndex] ?? null;
  const targetSlot = row.documents[targetIndex] ?? null;
  row.documents.splice(columnIndex, 1, targetSlot);
  row.documents.splice(targetIndex, 1, currentSlot);
};

const handleDocumentCtrlArrow = (
  rowIndex: number,
  columnKey: string,
  direction: 'left' | 'right'
) => {
  const columnIndex = parseDocumentColumnKey(columnKey);
  if (columnIndex === null) {
    return false;
  }
  moveDocument(rowIndex, columnIndex, direction === 'left' ? -1 : 1);
  return true;
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  if (!parentProduct.value || !parentProductType.value) {
    return [];
  }
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsQuery : configurableVariationsQuery;
  const key = isBundle ? 'bundleVariations' : 'configurableVariations';
  const pageSize = 100;
  let after: string | null = null;
  const nodes: any[] = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query,
      variables: {
        first: pageSize,
        after,
        filter: { parent: { id: { exact: parentProduct.value.id } } },
      },
      fetchPolicy: policy,
    });
    const connection = data?.[key];
    if (!connection) break;
    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => nodes.push(edge.node));
    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) break;
  }

  return nodes.map((node: any) => {
    const variation = node.variation;
    return {
      id: variation.id,
      variation: {
        id: variation.id,
        sku: variation.sku,
        name: variation.name,
        active: variation.active,
        type: variation.type,
      },
      documents: [],
    } as VariationRow;
  });
};

const fetchProducts = async (policy: FetchPolicy = 'cache-first') => {
  const ids = props.productIds.filter(Boolean);
  if (!ids.length) {
    return [];
  }
  const pageSize = 100;
  let after: string | null = null;
  const nodes: any[] = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: productsWithImagesQuery,
      variables: {
        first: pageSize,
        after,
        filter: { id: { inList: ids } },
      },
      fetchPolicy: policy,
    });
    const connection = data?.products;
    if (!connection) break;
    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => nodes.push(edge.node));
    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) break;
  }

  return nodes.map((node: any) => ({
    id: node.id,
    variation: {
      id: node.id,
      sku: node.sku,
      name: node.name,
      active: node.active,
      type: node.type ?? null,
    },
    documents: [],
  })) as VariationRow[];
};

const fetchVariationDocuments = async (
  variationIds: string[],
  salesChannelId: 'default' | string,
  policy: FetchPolicy = 'cache-first'
) => {
  if (!variationIds.length) {
    return new Map<string, VariationDocumentSlot[]>();
  }
  const pageSize = 100;
  let after: string | null = null;
  const nodes: any[] = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: mediaProductThroughQuery,
      variables: {
        first: pageSize,
        after,
        filter: {
          product: { id: { inList: variationIds } },
          media: { type: { exact: 'FILE' } },
          salesChannel:
            salesChannelId === 'default'
              ? { id: { isNull: true } }
              : { id: { exact: salesChannelId } },
        },
      },
      fetchPolicy: policy,
    });
    const connection = data?.mediaProductThroughs;
    if (!connection) break;
    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => nodes.push(edge.node));
    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) break;
  }

  const map = new Map<string, VariationDocumentSlot[]>();
  nodes.forEach((node: any) => {
    const productId = node.productId ?? node.product?.id;
    const mediaId = node.media?.id;
    if (!productId || !mediaId) return;
    if (!map.has(productId)) {
      map.set(productId, []);
    }
    map.get(productId)!.push({
      id: node.id ?? null,
      productId,
      mediaId,
      mediaProxyId: node.media?.proxyId ?? mediaId,
      mediaUrl: node.media?.documentImageThumbnailUrl ?? null,
      mediaName: node.media?.file?.name ?? null,
      title: node.media?.title ?? null,
      description: node.media?.description ?? null,
      documentTypeId: node.media?.documentType?.id ?? null,
      documentTypeName: node.media?.documentType?.name ?? null,
      documentLanguage: node.media?.documentLanguage ?? null,
      sortOrder: node.sortOrder ?? null,
      uploadSource: 'existing',
    });
  });

  map.forEach((entries) => {
    entries.sort((a, b) => {
      const aOrder = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
  });

  return map;
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    let variationRows: VariationRow[] = [];
    if (hasProductIds.value) {
      variationRows = await fetchProducts(policy);
    } else if (props.product) {
      variationRows = await fetchVariations(policy);
    }
    const variationIds = variationRows.map((row) => row.variation.id);
    const selectedChannel = currentSalesChannel.value;
    const documentsMap = await fetchVariationDocuments(variationIds, selectedChannel, policy);
    let defaultMap: Map<string, VariationDocumentSlot[]> | null = null;

    if (selectedChannel !== 'default') {
      const needsDefault = variationRows.some((row) => (documentsMap.get(row.variation.id) ?? []).length === 0);
      if (needsDefault) {
        defaultMap = await fetchVariationDocuments(variationIds, 'default', policy);
      }
    }

    let channelInherited = false;
    variationRows.forEach((row) => {
      const entries = documentsMap.get(row.variation.id) ?? [];
      if (entries.length || selectedChannel === 'default') {
        row.documents = entries.map((slot) => ({ ...slot }));
      } else {
        const fallback = defaultMap?.get(row.variation.id) ?? [];
        row.documents = fallback.map((slot, index) => ({
          ...slot,
          id: null,
          productId: row.variation.id,
          sortOrder: slot.sortOrder ?? index,
          uploadSource: slot.uploadSource ?? 'existing',
        }));
        if (fallback.length) {
          channelInherited = true;
        }
      }
    });
    variations.value = JSON.parse(JSON.stringify(variationRows));
    originalVariations.value = JSON.parse(JSON.stringify(variationRows));
    editedMediaIds.value.clear();
    expandedPlaceholder.value = null;
    matrixRef.value?.resetHistory(variations.value);
    previousSalesChannel.value = currentSalesChannel.value;
    inheritedFromDefault.value = channelInherited;
  } finally {
    loading.value = false;
  }
};

const loadSalesChannels = async () => {
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'cache-first' });
    salesChannels.value =
      data?.integrations?.edges
        ?.map((edge: any) => edge.node)
        ?.filter((node: any) => node.type && node.type !== WEBHOOK_CHANNEL_TYPE) || [];
  } catch (error) {
    console.error('Failed to load sales channels', error);
    salesChannels.value = [];
  }
};

const loadSelectorOptions = async () => {
  try {
    const [{ data: documentTypesData }, { data: languagesData }] = await Promise.all([
      apolloClient.query({
        query: documentTypesQuerySelector,
        variables: { first: 100 },
        fetchPolicy: 'cache-first',
      }),
      apolloClient.query({
        query: companyLanguagesQuery,
        fetchPolicy: 'cache-first',
      }),
    ]);

    documentTypeOptions.value =
      documentTypesData?.documentTypes?.edges?.map((edge: any) => ({
        label: edge.node.name,
        value: edge.node.id,
      })) || [];

    documentLanguageOptions.value =
      languagesData?.companyLanguages?.map((language: any) => ({
        label: language.name,
        value: language.code,
      })) || [];
  } catch (error) {
    documentTypeOptions.value = [];
    documentLanguageOptions.value = [];
  }
};

const save = async () => {
  if (!hasChanges.value || saving.value) {
    return;
  }
  saving.value = true;
  try {
    const selectedChannel = currentSalesChannel.value;
    const isDefaultChannel = selectedChannel === 'default';
    const originalMap = new Map<string, VariationRow>();
    originalVariations.value.forEach((row) => {
      originalMap.set(row.variation.id, row);
    });

    const toCreate: { productId: string; mediaId: string; sortOrder: number }[] = [];
    const toUpdate: { id: string; sortOrder: number }[] = [];
    const toDelete: string[] = [];
    const fileUpdates = new Map<string, {
      title: string | null;
      description: string | null;
      documentTypeId: string | null;
      documentLanguage: string | null;
      mediaProxyId: string | null;
      mediaId: string;
    }>();

    const originalMediaMap = new Map<string, {
      title: string | null;
      description: string | null;
      documentTypeId: string | null;
      documentLanguage: string | null;
    }>();

    originalVariations.value.forEach((row) => {
      row.documents.forEach((slot) => {
        if (!slot?.mediaId || originalMediaMap.has(slot.mediaId)) {
          return;
        }
        originalMediaMap.set(slot.mediaId, {
          title: normalizeTextValue(slot.title) || null,
          description: normalizeTextValue(slot.description) || null,
          documentTypeId: slot.documentTypeId ?? null,
          documentLanguage: slot.documentLanguage ?? null,
        });
      });
    });

    variations.value.forEach((row) => {
      const original = originalMap.get(row.variation.id);
      const currentIds = new Set<string>();

      row.documents.forEach((slot, index) => {
        if (!slot || !slot.mediaId) {
          return;
        }
        if (!fileUpdates.has(slot.mediaId)) {
          fileUpdates.set(slot.mediaId, {
            title: normalizeTextValue(slot.title) || null,
            description: normalizeTextValue(slot.description) || null,
            documentTypeId: slot.documentTypeId ?? null,
            documentLanguage: slot.documentLanguage ?? null,
            mediaProxyId: slot.mediaProxyId ?? slot.mediaId ?? null,
            mediaId: slot.mediaId,
          });
        }
        if (!slot.id) {
          toCreate.push({
            productId: row.variation.id,
            mediaId: slot.mediaId,
            sortOrder: index,
          });
          return;
        }
        currentIds.add(slot.id);
        const originalSlot = original?.documents.find((item) => item?.id === slot.id) ?? null;
        const originalSort = originalSlot?.sortOrder ?? null;
        if (originalSort !== index) {
          toUpdate.push({ id: slot.id, sortOrder: index });
        }
      });

      const originalIds = new Set(
        (original?.documents ?? [])
          .map((slot) => slot?.id)
          .filter((id): id is string => Boolean(id))
      );
      originalIds.forEach((id) => {
        if (!currentIds.has(id)) {
          toDelete.push(id);
        }
      });
    });

    if (toDelete.length) {
      await apolloClient.mutate({
        mutation: deleteMediaProductThroughsMutation,
        variables: { data: toDelete.map((id) => ({ id })) },
      });
    }

    if (toCreate.length) {
      const payload = toCreate.map((item) => {
        const input: Record<string, any> = {
          product: { id: item.productId },
          media: { id: item.mediaId },
          sortOrder: item.sortOrder,
        };
        if (!isDefaultChannel) {
          input.salesChannel = { id: selectedChannel };
        }
        return input;
      });
      await apolloClient.mutate({
        mutation: createMediaProductThroughsMutation,
        variables: { data: payload },
      });
    }

    if (toUpdate.length) {
      for (const item of toUpdate) {
        await apolloClient.mutate({
          mutation: updateMediaProductThroughMutation,
          variables: {
            data: {
              id: item.id,
              sortOrder: item.sortOrder,
            },
          },
        });
      }
    }

    const filesToUpdate = Array.from(fileUpdates.entries())
      .filter(([mediaId, current]) => {
        const original = originalMediaMap.get(mediaId);
        if (!original) {
          return editedMediaIds.value.has(mediaId);
        }
        return (
          current.title !== original.title ||
          current.description !== original.description ||
          current.documentTypeId !== original.documentTypeId ||
          current.documentLanguage !== original.documentLanguage
        );
      })
      .map(([, current]) => current);

    if (filesToUpdate.length) {
      for (const item of filesToUpdate) {
        const updateId = item.mediaProxyId || item.mediaId;
        if (!updateId) {
          continue;
        }
        await apolloClient.mutate({
          mutation: updateFileMutation,
          variables: {
            data: {
              id: updateId,
              title: item.title,
              description: item.description,
              documentType: item.documentTypeId ? { id: item.documentTypeId } : null,
              documentLanguage: item.documentLanguage,
            },
          },
        });
      }
    }

    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    await loadData('network-only');
  } catch (error) {
    Toast.error(t('shared.alert.toast.generalError'));
    throw error;
  } finally {
    saving.value = false;
  }
};

const handleSalesChannelChange = async (newChannel: 'default' | string) => {
  if (skipChannelWatch.value) return;
  if (!previousSalesChannel.value) {
    previousSalesChannel.value = newChannel;
    return;
  }
  if (newChannel === previousSalesChannel.value) return;
  const proceed = await askDiscardChanges();
  if (!proceed) {
    skipChannelWatch.value = true;
    currentSalesChannel.value = previousSalesChannel.value;
    await nextTick();
    skipChannelWatch.value = false;
    return;
  }
  previousSalesChannel.value = newChannel;
  await loadData('network-only');
};

const removeDocument = (rowIndex: number, columnIndex: number) => {
  const columnKey = `document-${columnIndex}`;
  clearMatrixCellValue(rowIndex, columnKey);
};

onMounted(async () => {
  await Promise.all([loadSalesChannels(), loadSelectorOptions()]);
  previousSalesChannel.value = currentSalesChannel.value;
  await loadData('network-only');
});

watch(
  () => [props.product?.id ?? null, props.productIds.join(',')],
  async () => {
    await loadData('network-only');
  }
);

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div
    class="relative w-full min-w-0 variations-documents-bulk-edit"
    :class="{ 'variations-documents-bulk-edit--inherited': isChannelInherited }"
  >
    <MatrixEditor
      ref="matrixRef"
      v-model:rows="variations"
      :columns="columns"
      :loading="loading"
      :saving="saving"
      :has-changes="hasChanges"
      row-key="id"
      :get-cell-value="getMatrixCellValue"
      :set-cell-value="setMatrixCellValue"
      :clone-cell-value="cloneMatrixCellValue"
      :clear-cell-value="clearMatrixCellValue"
      :on-ctrl-arrow="handleDocumentCtrlArrow"
      @save="save"
    >
      <template #filters>
        <div
          v-if="isChannelInherited"
          class="rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
        >
          {{ t('products.products.variations.documents.messages.inheritedFromDefault') }}
        </div>
      </template>
      <template #toolbar-right>
        <div class="flex items-center gap-2">
          <Selector
            v-if="salesChannelOptions.length"
            v-model="currentSalesChannel"
            :options="salesChannelOptions"
            class="w-48"
            :placeholder="t('products.products.variations.content.selectors.salesChannel')"
            :removable="false"
            labelBy="name"
            valueBy="value"
            filterable
          />
        </div>
      </template>
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'media' } }"
            target="_blank"
          >
            <span class="block truncate" :title="row.variation.name">
              {{ shortenText(row.variation.name, 32) }}
            </span>
          </Link>
        </template>
        <template v-else-if="column.key === 'sku'">
          <div class="flex items-center gap-1">
            <span class="block truncate" :title="row.variation.sku">
              {{ row.variation.sku }}
            </span>
            <Button class="p-0" @click="copySkuToClipboard(row.variation.sku)">
              <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
            </Button>
          </div>
        </template>
        <template v-else-if="column.key === 'active'">
          <Icon v-if="row.variation.active" name="check-circle" class="text-green-500" />
          <Icon v-else name="times-circle" class="text-red-500" />
        </template>
        <template v-else-if="column.key === 'upload'">
          <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
            <Button
              class="btn btn-secondary flex w-full items-center justify-center gap-2 px-3 py-1.5 text-sm"
            >
              <Icon name="cloud-upload" class="h-3 w-3" aria-hidden="true" />
              <span>{{ t('products.products.variations.documents.buttons.openUploadMenu') }}</span>
            </Button>
            <template #content="{ close }">
              <ul class="w-48 rounded-md border border-gray-300 bg-white py-1 text-dark">
                <li>
                  <Button
                    class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                    @click="() => { openUploadDocumentsModal(rowIndex); close(); }"
                  >
                    <Icon name="upload" class="h-4 w-4" aria-hidden="true" />
                    {{ t('products.products.variations.documents.buttons.uploadNew') }}
                  </Button>
                </li>
                <li>
                  <Button
                    class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                    @click="() => { openSelectExistingModal(rowIndex); close(); }"
                  >
                    <Icon name="images" class="h-4 w-4" aria-hidden="true" />
                    {{ t('products.products.variations.documents.buttons.addExisting') }}
                  </Button>
                </li>
              </ul>
            </template>
          </Popper>
        </template>
        <template v-else>
          <div class="group relative flex items-center justify-center">
            <div
              class="relative flex h-36 w-36 flex-col items-center justify-center overflow-hidden rounded-md border bg-white p-2 md:h-40 md:w-40"
              :class="{
                'border-dashed border-gray-300 bg-gray-50': !row.documents[getDocumentColumnIndex(column.key)],
                'border-sky-200 bg-sky-50': isUnsavedSlot(row.documents[getDocumentColumnIndex(column.key)]),
              }"
            >
              <ProductImage
                v-if="row.documents[getDocumentColumnIndex(column.key)]?.mediaUrl"
                :source="row.documents[getDocumentColumnIndex(column.key)]?.mediaUrl || ''"
                :alt="row.documents[getDocumentColumnIndex(column.key)]?.mediaName || row.variation.name"
                class="h-full w-full object-contain"
              />
              <div
                v-else-if="row.documents[getDocumentColumnIndex(column.key)]"
                class="flex h-full w-full items-center justify-center rounded-md bg-gray-100"
              >
                <Icon name="file-text" class="h-10 w-10 text-gray-500" aria-hidden="true" />
              </div>
              <div v-else class="flex w-full flex-col items-center gap-3 px-3 py-2 text-center">
                <template v-if="!isPlaceholderExpanded(rowIndex, getDocumentColumnIndex(column.key))">
                  <span class="text-xs text-gray-500">
                    {{ t('products.products.variations.documents.labels.noDocument') }}
                  </span>
                </template>
                <Button
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  :aria-label="t('products.products.variations.documents.buttons.openUploadMenu')"
                  @click.stop="togglePlaceholder(rowIndex, getDocumentColumnIndex(column.key))"
                >
                  <Icon name="plus" class="h-4 w-4" aria-hidden="true" />
                </Button>
                <div
                  v-if="isPlaceholderExpanded(rowIndex, getDocumentColumnIndex(column.key))"
                  class="flex w-full flex-col gap-2"
                >
                  <Button
                    class="flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    @click.stop="handlePlaceholderAction('upload', rowIndex, getDocumentColumnIndex(column.key))"
                  >
                    <Icon name="upload" class="h-3 w-3" aria-hidden="true" />
                    {{ t('products.products.variations.documents.buttons.uploadNew') }}
                  </Button>
                  <Button
                    class="flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    @click.stop="handlePlaceholderAction('existing', rowIndex, getDocumentColumnIndex(column.key))"
                  >
                    <Icon name="images" class="h-3 w-3" aria-hidden="true" />
                    {{ t('products.products.variations.documents.buttons.addExisting') }}
                  </Button>
                </div>
              </div>
            </div>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-gray-900 bg-opacity-60 px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100"
              :class="{ 'pointer-events-none': !row.documents[getDocumentColumnIndex(column.key)] }"
            >
              <template v-if="row.documents[getDocumentColumnIndex(column.key)]">
                <div class="flex items-center gap-2">
                  <Button
                    v-if="getDocumentColumnIndex(column.key) > 0"
                    class="btn btn-secondary p-2"
                    :aria-label="t('products.products.variations.documents.buttons.moveLeft')"
                    :title="t('products.products.variations.documents.buttons.moveLeft')"
                    @click="moveDocument(rowIndex, getDocumentColumnIndex(column.key), -1)"
                  >
                    <Icon name="chevron-left" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    v-if="getDocumentColumnIndex(column.key) < documentColumnCount - 1"
                    class="btn btn-secondary p-2"
                    :aria-label="t('products.products.variations.documents.buttons.moveRight')"
                    :title="t('products.products.variations.documents.buttons.moveRight')"
                    @click="moveDocument(rowIndex, getDocumentColumnIndex(column.key), 1)"
                  >
                    <Icon name="chevron-right" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <div class="flex items-center gap-2">
                  <Button
                    class="rounded bg-white/80 p-2 text-primary hover:bg-white"
                    :title="t('shared.button.edit')"
                    :aria-label="t('shared.button.edit')"
                    @click.stop="openDocumentEditModal(rowIndex, getDocumentColumnIndex(column.key))"
                  >
                    <Icon name="edit" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    class="rounded bg-white/80 p-2 text-red-600 hover:bg-white"
                    :title="t('shared.button.delete')"
                    :aria-label="t('shared.button.delete')"
                    @click.stop="removeDocument(rowIndex, getDocumentColumnIndex(column.key))"
                  >
                    <Icon name="trash" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </template>
            </div>
          </div>
        </template>
      </template>
    </MatrixEditor>
    <Modal v-model="documentEditModalVisible" @closed="closeDocumentEditModal">
      <Card class="modal-content w-11/12 max-w-5xl">
        <div class="mb-4">
          <h3 class="text-xl font-semibold">{{ t('media.documents.show.title') }}</h3>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <ProductImage
              v-if="editMediaUrl"
              :source="editMediaUrl"
              :alt="t('media.documents.title')"
              class="w-full max-w-[35rem] rounded-md"
            />
            <div
              v-else
              class="flex h-64 items-center justify-center rounded-md border border-gray-200 bg-gray-100"
            >
              <Icon name="file-text" class="h-14 w-14 text-gray-500" aria-hidden="true" />
            </div>
          </div>
          <div class="mt-1">
            <Flex vertical>
              <FlexCell>
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.title') }}</label>
                <TextInput
                  v-model="editTitle"
                  class="w-full"
                  :placeholder="t('media.documents.placeholders.title')"
                />
              </FlexCell>
              <FlexCell class="mt-4">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.description') }}</label>
                <TextEditor
                  class="h-32"
                  v-model="editDescription"
                  :placeholder="t('media.documents.placeholders.description')"
                />
              </FlexCell>
              <FlexCell class="mt-4">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.filters.documentType') }}</label>
                <Selector
                  v-model="editDocumentTypeId"
                  :options="documentTypeOptions"
                  class="w-full"
                  :removable="false"
                  :filterable="true"
                  :label-by="'label'"
                  :value-by="'value'"
                  :placeholder="t('media.documents.placeholders.documentType')"
                  :dropdown-position="'bottom'"
                />
              </FlexCell>
              <FlexCell class="mt-4">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.language') }}</label>
                <Selector
                  v-model="editDocumentLanguage"
                  :options="documentLanguageOptions"
                  class="w-full"
                  :removable="false"
                  :filterable="true"
                  :label-by="'label'"
                  :value-by="'value'"
                  :placeholder="t('media.documents.placeholders.documentLanguage')"
                  :dropdown-position="'bottom'"
                />
              </FlexCell>
              <FlexCell class="mt-6 flex justify-end gap-3">
                <Button class="btn btn-outline-dark" @click="closeDocumentEditModal">
                  {{ t('shared.button.cancel') }}
                </Button>
                <Button class="btn btn-primary" @click="applyDocumentEdits">
                  {{ t('shared.button.save') }}
                </Button>
              </FlexCell>
            </Flex>
          </div>
        </div>
      </Card>
    </Modal>
    <UploadMediaModal
      v-model="selectExistingModalVisible"
      :product-id="uploadContext ? variations[uploadContext.rowIndex]?.variation.id : parentProduct?.id"
      :ids="assignedMediaIds"
      :link-on-select="false"
      :media-type="TYPE_DOCUMENT"
      :sales-channel-id="currentSalesChannelId || undefined"
      @entries-created="handleExistingSelected"
    />
    <CreateDocumentsModal
      v-model="uploadDocumentsModalVisible"
      :single-upload="isSingleUpload"
      :sales-channel-id="currentSalesChannelId || undefined"
      @entries-created="handleDocumentsCreated"
    />
  </div>
</template>

<style scoped>
.variations-documents-bulk-edit--inherited :deep(.overflow-x-auto) {
  opacity: 0.6;
}

.variations-documents-bulk-edit .group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
