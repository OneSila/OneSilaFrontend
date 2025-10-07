<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { Product } from "../../../../../../configs";
import { ProductType } from "../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../apollo-client";
import { bundleVariationsQuery, configurableVariationsQuery } from "../../../../../../../../../shared/api/queries/products.js";
import { mediaProductThroughQuery } from "../../../../../../../../../shared/api/queries/media.js";
import { integrationsQuery } from "../../../../../../../../../shared/api/queries/integrations.js";
import {
  createMediaProductThroughsMutation,
  deleteMediaProductThroughsMutation,
  updateMediaProductThroughMutation,
} from "../../../../../../../../../shared/api/mutations/media.js";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Image as ProductImage } from "../../../../../../../../../shared/components/atoms/image";
import { Toggle } from "../../../../../../../../../shared/components/atoms/toggle";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";
import { shortenText } from "../../../../../../../../../shared/utils";
import { CreateImagesModal } from "../../../../../../../../media/files/containers/create-modals/images-modal";
import { UploadMediaModal } from "../../../media/containers/upload-media-modal";
import { IMAGE_TYPE_MOOD, IMAGE_TYPE_PACK } from "../../../../../../../../media/files/media";

interface VariationImageSlot {
  id: string | null;
  productId: string;
  mediaId: string;
  mediaUrl: string | null;
  mediaName: string | null;
  isMainImage: boolean;
  sortOrder: number | null;
  imageType?: string | null;
  uploadSource?: 'existing' | 'uploaded';
}

interface VariationRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
  };
  images: (VariationImageSlot | null)[];
}

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const WEBHOOK_CHANNEL_TYPE = 'webhook';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const uploadContext = ref<{ rowIndex: number; columnIndex: number | null } | null>(null);
const selectExistingModalVisible = ref(false);
const uploadImagesModalVisible = ref(false);
const expandedPlaceholder = ref<{ rowIndex: number; columnIndex: number } | null>(null);
const salesChannels = ref<any[]>([]);
const currentSalesChannel = ref<'default' | string>('default');
const previousSalesChannel = ref<'default' | string>('default');
const skipChannelWatch = ref(false);
const inheritedFromDefault = ref(false);

const assignedMediaIds = computed(() =>
  variations.value.flatMap((row) =>
    row.images
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

const isAlias = computed(() => props.product.type === ProductType.Alias);
const parentProduct = computed(() => (isAlias.value ? props.product.aliasParentProduct : props.product));
const parentProductType = computed(() => parentProduct.value.type);
const isChannelInherited = computed(
  () => currentSalesChannel.value !== 'default' && inheritedFromDefault.value
);

const baseColumns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
  { key: 'upload', label: t('products.products.variations.images.columns.upload'), editable: false, initialWidth: 160 },
]);

const imageColumnCount = computed(() => {
  const maxColumns = variations.value.reduce((max, row) => Math.max(max, row.images.length), 0);
  return Math.max(maxColumns, 1);
});

const imageColumns = computed<MatrixColumn[]>(() =>
  Array.from({ length: imageColumnCount.value }, (_, index) => ({
    key: `image-${index}`,
    label: t('products.products.variations.images.columns.image', { index: index + 1 }),
    editable: true,
    initialWidth: 200,
    beforeInsert: () => insertImageColumn(index),
    afterInsert: () => insertImageColumn(index + 1),
  }))
);

const columns = computed<MatrixColumn[]>(() => [
  ...baseColumns.value,
  ...imageColumns.value,
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

const parseImageColumnKey = (key: string) => {
  if (!key.startsWith('image-')) return null;
  const index = Number(key.replace('image-', ''));
  if (Number.isNaN(index)) return null;
  return index;
};

const ensureImageCapacity = (row: VariationRow, index: number) => {
  while (row.images.length <= index) {
    row.images.push(null);
  }
};

const ensureRowHasMainImage = (row: VariationRow) => {
  if (row.images.some((image) => image?.isMainImage)) {
    return;
  }
  const firstImageIndex = row.images.findIndex((image) => Boolean(image));
  if (firstImageIndex === -1) {
    return;
  }
  const firstImage = row.images[firstImageIndex];
  if (firstImage) {
    firstImage.isMainImage = true;
  }
};

const insertImageColumn = (insertIndex: number) => {
  variations.value.forEach((row) => {
    while (row.images.length < insertIndex) {
      row.images.push(null);
    }
    row.images.splice(insertIndex, 0, null);
  });
  if (expandedPlaceholder.value) {
    closePlaceholder();
  }
};

const getImageColumnIndex = (columnKey: string) => parseImageColumnKey(columnKey) ?? 0;

const normalizeImageSlot = (
  value: any,
  productId: string,
  currentSlotId?: string | null
): VariationImageSlot | null => {
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
    mediaUrl: value.mediaUrl ?? null,
    mediaName: value.mediaName ?? null,
    isMainImage: preserveId ? !!value.isMainImage : false,
    sortOrder: value.sortOrder ?? null,
    imageType: value.imageType ?? null,
    uploadSource: value.uploadSource,
  };
};

const getMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const columnIndex = parseImageColumnKey(columnKey);
  if (columnIndex === null) {
    return null;
  }
  const row = variations.value[rowIndex];
  if (!row) return null;
  const slot = row.images[columnIndex];
  return slot ? JSON.parse(JSON.stringify(slot)) : null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const columnIndex = parseImageColumnKey(columnKey);
  if (columnIndex === null) {
    return;
  }
  const row = variations.value[rowIndex];
  if (!row) return;
  ensureImageCapacity(row, columnIndex);
  const currentSlot = row.images[columnIndex];
  const slot = normalizeImageSlot(value, row.variation.id, currentSlot?.id ?? null);
  row.images.splice(columnIndex, 1, slot);
  ensureRowHasMainImage(row);
  if (slot && isPlaceholderExpanded(rowIndex, columnIndex)) {
    closePlaceholder();
  }
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  setMatrixCellValue(toRow, columnKey, value);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const columnIndex = parseImageColumnKey(columnKey);
  if (columnIndex === null) {
    return;
  }
  const row = variations.value[rowIndex];
  if (!row) return;
  if (row.images.length > columnIndex) {
    row.images.splice(columnIndex, 1, null);
  }
  ensureRowHasMainImage(row);
};

const resolveTargetIndex = (row: VariationRow, columnIndex: number | null) => {
  if (columnIndex != null) {
    ensureImageCapacity(row, columnIndex);
    return columnIndex;
  }
  const emptyIndex = row.images.findIndex((slot) => !slot);
  if (emptyIndex !== -1) {
    ensureImageCapacity(row, emptyIndex);
    return emptyIndex;
  }
  const targetIndex = row.images.length;
  ensureImageCapacity(row, targetIndex);
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
  const currentSlot = row.images[targetIndex];
  const slotValue: VariationImageSlot = {
    id: null,
    productId: row.variation.id,
    mediaId: resolvedMedia.id,
    mediaUrl:
      resolvedMedia.imageWebUrl ??
      resolvedMedia.fileUrl ??
      resolvedMedia.videoUrl ??
      resolvedMedia.mediaUrl ??
      null,
    mediaName:
      resolvedMedia.image?.name ??
      resolvedMedia.file?.name ??
      resolvedMedia.mediaName ??
      resolvedMedia.name ??
      null,
    isMainImage: currentSlot?.isMainImage ?? false,
    sortOrder: null,
    imageType: resolvedMedia.type ?? (source === 'uploaded' ? IMAGE_TYPE_PACK : null),
    uploadSource: source,
  };
  setMatrixCellValue(rowIndex, `image-${targetIndex}`, slotValue);
};

const openSelectExistingModal = (rowIndex: number, columnIndex: number | null = null) => {
  uploadContext.value = { rowIndex, columnIndex };
  selectExistingModalVisible.value = true;
};

const openUploadImagesModal = (rowIndex: number, columnIndex: number | null = null) => {
  uploadContext.value = { rowIndex, columnIndex };
  uploadImagesModalVisible.value = true;
};

const handlePlaceholderAction = (
  action: 'upload' | 'existing',
  rowIndex: number,
  columnIndex: number
) => {
  if (action === 'upload') {
    openUploadImagesModal(rowIndex, columnIndex);
  } else {
    openSelectExistingModal(rowIndex, columnIndex);
  }
  closePlaceholder();
};

const resetUploadContext = () => {
  if (!selectExistingModalVisible.value && !uploadImagesModalVisible.value) {
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

const handleImagesCreated = (images: any[]) => {
  if (!uploadContext.value) {
    uploadImagesModalVisible.value = false;
    return;
  }
  const createdImages = Array.isArray(images) ? images : images ? [images] : [];
  if (!createdImages.length) {
    uploadImagesModalVisible.value = false;
    return;
  }
  const { rowIndex, columnIndex } = uploadContext.value;
  if (columnIndex != null) {
    assignMediaToRow(rowIndex, columnIndex, createdImages[0], 'uploaded');
  } else {
    createdImages.forEach((image) => {
      assignMediaToRow(rowIndex, null, image, 'uploaded');
    });
  }
  uploadImagesModalVisible.value = false;
};

const isUnsavedSlot = (slot: VariationImageSlot | null | undefined) => !!slot && !slot.id;

const getImageTypeLabel = (slot: VariationImageSlot | null | undefined) => {
  if (!slot) {
    return null;
  }
  const type = slot.imageType;
  if (type === IMAGE_TYPE_MOOD) {
    return t('media.images.labels.moodShot');
  }
  return null;
};

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

watch(currentSalesChannel, async (newChannel) => {
  await handleSalesChannelChange(newChannel);
});
watch(selectExistingModalVisible, resetUploadContext);
watch(uploadImagesModalVisible, resetUploadContext);

const handleMainToggle = (rowIndex: number, columnIndex: number, value: boolean) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  ensureImageCapacity(row, columnIndex);
  const slot = row.images[columnIndex];
  if (!slot) return;
  if (value) {
    row.images.forEach((image, index) => {
      if (image) {
        image.isMainImage = index === columnIndex;
      }
    });
  } else {
    slot.isMainImage = false;
  }
  ensureRowHasMainImage(row);
};

const moveImage = (rowIndex: number, columnIndex: number, direction: -1 | 1) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  const targetIndex = columnIndex + direction;
  if (targetIndex < 0) {
    return;
  }
  ensureImageCapacity(row, targetIndex);
  const currentSlot = row.images[columnIndex] ?? null;
  const targetSlot = row.images[targetIndex] ?? null;
  row.images.splice(columnIndex, 1, targetSlot);
  row.images.splice(targetIndex, 1, currentSlot);
  ensureRowHasMainImage(row);
};

const handleImageCtrlArrow = (
  rowIndex: number,
  columnKey: string,
  direction: 'left' | 'right'
) => {
  const columnIndex = parseImageColumnKey(columnKey);
  if (columnIndex === null) {
    return false;
  }
  moveImage(rowIndex, columnIndex, direction === 'left' ? -1 : 1);
  return true;
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
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
      },
      images: [],
    } as VariationRow;
  });
};

const fetchVariationImages = async (
  variationIds: string[],
  salesChannelId: 'default' | string,
  policy: FetchPolicy = 'cache-first'
) => {
  if (!variationIds.length) {
    return new Map<string, VariationImageSlot[]>();
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
          media: { type: { exact: 'IMAGE' } },
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

  const map = new Map<string, VariationImageSlot[]>();
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
      mediaUrl: node.media?.imageWebUrl ?? null,
      mediaName: node.media?.image?.name ?? node.media?.file?.name ?? null,
      isMainImage: !!node.isMainImage,
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
    const variationRows = await fetchVariations(policy);
    const variationIds = variationRows.map((row) => row.variation.id);
    const selectedChannel = currentSalesChannel.value;
    const imagesMap = await fetchVariationImages(variationIds, selectedChannel, policy);
    let defaultMap: Map<string, VariationImageSlot[]> | null = null;

    if (selectedChannel !== 'default') {
      const needsDefault = variationRows.some((row) => (imagesMap.get(row.variation.id) ?? []).length === 0);
      if (needsDefault) {
        defaultMap = await fetchVariationImages(variationIds, 'default', policy);
      }
    }

    let channelInherited = false;
    variationRows.forEach((row) => {
      const entries = imagesMap.get(row.variation.id) ?? [];
      if (entries.length || selectedChannel === 'default') {
        row.images = entries.map((slot) => ({ ...slot }));
      } else {
        const fallback = defaultMap?.get(row.variation.id) ?? [];
        row.images = fallback.map((slot, index) => ({
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
      ensureRowHasMainImage(row);
    });
    variations.value = JSON.parse(JSON.stringify(variationRows));
    originalVariations.value = JSON.parse(JSON.stringify(variationRows));
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

    const toCreate: { productId: string; mediaId: string; sortOrder: number; isMainImage: boolean }[] = [];
    const toUpdate: { id: string; sortOrder: number; isMainImage: boolean }[] = [];
    const toDelete: string[] = [];

    variations.value.forEach((row) => {
      const original = originalMap.get(row.variation.id);
      const currentIds = new Set<string>();

      row.images.forEach((slot, index) => {
        if (!slot || !slot.mediaId) {
          return;
        }
        if (!slot.id) {
          toCreate.push({
            productId: row.variation.id,
            mediaId: slot.mediaId,
            sortOrder: index,
            isMainImage: !!slot.isMainImage,
          });
          return;
        }
        currentIds.add(slot.id);
        const originalSlot = original?.images.find((item) => item?.id === slot.id) ?? null;
        const originalSort = originalSlot?.sortOrder ?? null;
        const originalMain = originalSlot?.isMainImage ?? false;
        if (originalSort !== index || originalMain !== slot.isMainImage) {
          toUpdate.push({ id: slot.id, sortOrder: index, isMainImage: !!slot.isMainImage });
        }
      });

      const originalIds = new Set(
        (original?.images ?? [])
          .map((slot) => slot?.id)
          .filter((id): id is string => Boolean(id))
      );
      originalIds.forEach((id) => {
        if (!currentIds.has(id)) {
          toDelete.push(id);
        }
      });
    });

    const inputDataInput = toDelete.map(id => ({ id }));

    if (toDelete.length) {
      await apolloClient.mutate({
        mutation: deleteMediaProductThroughsMutation,
        variables: { data: inputDataInput },
      });
    }

    if (toCreate.length) {
      const payload = toCreate.map((item) => {
        const input: Record<string, any> = {
          product: { id: item.productId },
          media: { id: item.mediaId },
          sortOrder: item.sortOrder,
          isMainImage: item.isMainImage,
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
              isMainImage: item.isMainImage,
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

const removeImage = (rowIndex: number, columnIndex: number) => {
  const columnKey = `image-${columnIndex}`;
  clearMatrixCellValue(rowIndex, columnKey);
};

onMounted(async () => {
  await loadSalesChannels();
  previousSalesChannel.value = currentSalesChannel.value;
  await loadData('network-only');
});

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div
    class="relative w-full min-w-0 variations-images-bulk-edit"
    :class="{ 'variations-images-bulk-edit--inherited': isChannelInherited }"
  >
    <MatrixEditor
      ref="matrixRef"
      v-model:rows="variations"
      :columns="columns"
      :loading="loading || saving"
      :has-changes="hasChanges"
      row-key="id"
      :get-cell-value="getMatrixCellValue"
      :set-cell-value="setMatrixCellValue"
      :clone-cell-value="cloneMatrixCellValue"
      :clear-cell-value="clearMatrixCellValue"
      :on-ctrl-arrow="handleImageCtrlArrow"
      @save="save"
    >
      <template #filters>
        <div
          v-if="isChannelInherited"
          class="rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
        >
          {{ t('products.products.variations.media.messages.inheritedFromDefault') }}
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
              <span>{{ t('products.products.variations.images.buttons.openUploadMenu') }}</span>
            </Button>
            <template #content="{ close }">
              <ul class="w-48 rounded-md border border-gray-300 bg-white py-1 text-dark">
                <li>
                  <Button
                    class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                    @click="() => { openUploadImagesModal(rowIndex); close(); }"
                  >
                    <Icon name="upload" class="h-4 w-4" aria-hidden="true" />
                    {{ t('products.products.variations.images.buttons.uploadNew') }}
                  </Button>
                </li>
                <li>
                  <Button
                    class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
                    @click="() => { openSelectExistingModal(rowIndex); close(); }"
                  >
                    <Icon name="images" class="h-4 w-4" aria-hidden="true" />
                    {{ t('products.products.variations.images.buttons.addExisting') }}
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
                'border-dashed border-gray-300 bg-gray-50': !row.images[getImageColumnIndex(column.key)],
                'border-sky-200 bg-sky-50': isUnsavedSlot(row.images[getImageColumnIndex(column.key)]),
              }"
            >
              <ProductImage
                v-if="row.images[getImageColumnIndex(column.key)]"
                :source="row.images[getImageColumnIndex(column.key)]?.mediaUrl || ''"
                :alt="row.images[getImageColumnIndex(column.key)]?.mediaName || row.variation.name"
                class="h-full w-full object-contain"
              />
              <div v-else class="flex w-full flex-col items-center gap-3 px-3 py-2 text-center">
                <template v-if="!isPlaceholderExpanded(rowIndex, getImageColumnIndex(column.key))">
                  <span class="text-xs text-gray-500">
                    {{ t('products.products.variations.images.labels.noImage') }}
                  </span>
                </template>
                <Button
                  class="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-500 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  :aria-label="t('products.products.variations.images.buttons.openUploadMenu')"
                  @click.stop="togglePlaceholder(rowIndex, getImageColumnIndex(column.key))"
                >
                  <Icon name="plus" class="h-4 w-4" aria-hidden="true" />
                </Button>
                <div
                  v-if="isPlaceholderExpanded(rowIndex, getImageColumnIndex(column.key))"
                  class="flex w-full flex-col gap-2"
                >
                  <Button
                    class="flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    @click.stop="handlePlaceholderAction('upload', rowIndex, getImageColumnIndex(column.key))"
                  >
                    <Icon name="upload" class="h-3 w-3" aria-hidden="true" />
                    {{ t('products.products.variations.images.buttons.uploadNew') }}
                  </Button>
                  <Button
                    class="flex items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                    @click.stop="handlePlaceholderAction('existing', rowIndex, getImageColumnIndex(column.key))"
                  >
                    <Icon name="images" class="h-3 w-3" aria-hidden="true" />
                    {{ t('products.products.variations.images.buttons.addExisting') }}
                  </Button>
                </div>
              </div>
              <div
                v-if="getImageTypeLabel(row.images[getImageColumnIndex(column.key)])"
                class="absolute bottom-2 left-2 rounded bg-white/80 px-2 py-1 text-xs font-medium text-gray-700"
              >
                {{ getImageTypeLabel(row.images[getImageColumnIndex(column.key)]) }}
              </div>
            </div>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-gray-900 bg-opacity-60 px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100"
              :class="{ 'pointer-events-none': !row.images[getImageColumnIndex(column.key)] }"
            >
              <template v-if="row.images[getImageColumnIndex(column.key)]">
                <Toggle
                  :model-value="row.images[getImageColumnIndex(column.key)]?.isMainImage ?? false"
                  @update:model-value="(value) => handleMainToggle(rowIndex, getImageColumnIndex(column.key), value)"
                />
                <div class="flex items-center gap-2">
                  <Button
                    v-if="getImageColumnIndex(column.key) > 0"
                    class="btn btn-secondary p-2"
                    :aria-label="t('products.products.variations.images.buttons.moveLeft')"
                    :title="t('products.products.variations.images.buttons.moveLeft')"
                    @click="moveImage(rowIndex, getImageColumnIndex(column.key), -1)"
                  >
                    <Icon name="chevron-left" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    v-if="getImageColumnIndex(column.key) < imageColumnCount - 1"
                    class="btn btn-secondary p-2"
                    :aria-label="t('products.products.variations.images.buttons.moveRight')"
                    :title="t('products.products.variations.images.buttons.moveRight')"
                    @click="moveImage(rowIndex, getImageColumnIndex(column.key), 1)"
                  >
                    <Icon name="chevron-right" class="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <Button class="btn btn-secondary" @click="removeImage(rowIndex, getImageColumnIndex(column.key))">
                  {{ t('shared.button.delete') }}
                </Button>
              </template>
            </div>
          </div>
        </template>
      </template>
    </MatrixEditor>
    <UploadMediaModal
      v-model="selectExistingModalVisible"
      :product-id="uploadContext ? variations[uploadContext.rowIndex]?.variation.id : parentProduct.id"
      :ids="assignedMediaIds"
      :link-on-select="false"
      :sales-channel-id="currentSalesChannelId || undefined"
      @entries-created="handleExistingSelected"
    />
    <CreateImagesModal
      v-model="uploadImagesModalVisible"
      :single-upload="isSingleUpload"
      :sales-channel-id="currentSalesChannelId || undefined"
      @entries-created="handleImagesCreated"
    />
  </div>
</template>

<style scoped>
.variations-images-bulk-edit--inherited :deep(.overflow-x-auto) {
  opacity: 0.6;
}

.variations-images-bulk-edit .group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
