<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import type { FetchPolicy } from '@apollo/client';
import { Product } from '../../../../../../configs';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Link } from '../../../../../../../../../shared/components/atoms/link';
import { TextInput } from '../../../../../../../../../shared/components/atoms/input-text';
import { TextEditor } from '../../../../../../../../../shared/components/atoms/input-text-editor';
import { TextHtmlEditor } from '../../../../../../../../../shared/components/atoms/input-text-html-editor';
import { Selector } from '../../../../../../../../../shared/components/atoms/selector';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../../../../shared/components/atoms/card';
import MatrixEditor from '../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue';
import type { MatrixColumn, MatrixEditorExpose } from '../../../../../../../../../shared/components/organisms/matrix-editor/types';
import { AiContentGenerator } from '../../../../../../../../../shared/components/organisms/ai-content-generator';
import { AiContentTranslator } from '../../../../../../../../../shared/components/organisms/ai-content-translator';
import { AiBulletPointsGenerator } from '../../../../../../../../../shared/components/organisms/ai-bullet-points-generator';
import { AdvancedContentGenerator } from '../../../../../../../../../shared/components/organisms/advanced-content-generator';
import ProductContentPreview from '../../../content/ProductContentPreview.vue';
import { Toast } from '../../../../../../../../../shared/modules/toast';
import { processGraphQLErrors, shortenText } from '../../../../../../../../../shared/utils';
import apolloClient from '../../../../../../../../../../apollo-client';
import { BULLET_POINT_SEPARATOR, ProductType } from '../../../../../../../../../shared/utils/constants';
import {
  bundleVariationsQuery,
  configurableVariationsQuery,
  getProductContentByLanguageAndChannelQuery,
  getProductContentByLanguageAndDefaultQuery,
  productTranslationBulletPointsQuery,
} from '../../../../../../../../../shared/api/queries/products.js';
import {
  createProductTranslationMutation,
  updateProductTranslationMutation,
  createProductTranslationBulletPointsMutation,
  updateProductTranslationBulletPointMutation,
  deleteProductTranslationBulletPointsMutation,
} from '../../../../../../../../../shared/api/mutations/products.js';
import { translationLanguagesQuery } from '../../../../../../../../../shared/api/queries/languages.js';
import { integrationsQuery } from '../../../../../../../../../shared/api/queries/integrations.js';
import { getContentFieldRules, type ContentFieldLimitKey } from '../../../content/contentFieldRules';

interface VariationNode {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
  };
}

interface TranslationData {
  id: string | null;
  name: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  urlKey: string;
}

interface BulletPoint {
  id: string | null;
  text: string;
  sortOrder: number;
}

interface VariationContentRow {
  id: string;
  variation: VariationNode['variation'];
  translation: TranslationData;
  defaultTranslation: TranslationData | null;
  bulletPoints: BulletPoint[];
  defaultBulletPoints: BulletPoint[];
}

const props = defineProps<{ product: Product }>();
const { t } = useI18n();

const WEBHOOK_CHANNEL_TYPE = 'webhook';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationContentRow[]>([]);
const originalVariations = ref<VariationContentRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const languages = ref<any[]>([]);
const defaultLanguageCode = ref<string>('en');
const language = ref<string | null>(null);
const previousLanguage = ref<string | null>(null);
const salesChannels = ref<any[]>([]);
const currentSalesChannel = ref<'default' | string>('default');
const previousSalesChannel = ref<'default' | string>('default');
const skipLanguageWatch = ref(false);
const skipChannelWatch = ref(false);
const previewRow = ref<VariationContentRow | null>(null);
const previewVisible = ref(false);
const hoverTimer = ref<number | null>(null);
const hoverPreview = reactive({
  visible: false,
  content: '',
  top: 0,
  left: 0,
  width: 0,
  placement: 'above' as 'above' | 'below',
});

const aiMenuState = ref<{ rowIndex: number; key: string } | null>(null);

const variationProductIds = computed(() => {
  const ids = variations.value.map((row) => row.variation?.id).filter(Boolean);
  return Array.from(new Set(ids));
});

const htmlModal = reactive({
  visible: false,
  rowIndex: -1,
  field: '' as 'shortDescription' | 'description',
  value: '<p><br></p>',
});

const textModal = reactive({
  visible: false,
  rowIndex: -1,
  key: '' as string,
  value: '',
});

const toggleAiMenu = (rowIndex: number, key: string) => {
  if (aiMenuState.value && aiMenuState.value.rowIndex === rowIndex && aiMenuState.value.key === key) {
    aiMenuState.value = null;
  } else {
    aiMenuState.value = { rowIndex, key };
  }
};

const isAiMenuOpen = (rowIndex: number, key: string) =>
  aiMenuState.value?.rowIndex === rowIndex && aiMenuState.value?.key === key;

const closeAiMenu = () => {
  aiMenuState.value = null;
};

const copySkuToClipboard = async (sku: string) => {
  try {
    await navigator.clipboard.writeText(sku);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const applyNameTranslation = (rowIndex: number, content: string) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  row.translation.name = content || '';
  closeAiMenu();
};

const applySubtitleTranslation = (rowIndex: number, content: string) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  row.translation.subtitle = content || '';
  closeAiMenu();
};

const applyShortDescriptionContent = (rowIndex: number, content: string) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  row.translation.shortDescription = normalizedHtml(content);
  closeAiMenu();
};

const applyDescriptionContent = (rowIndex: number, content: string) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  row.translation.description = normalizedHtml(content);
  closeAiMenu();
};

const applyBulletText = (rowIndex: number, bulletIndex: number, text: string) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  const bullet = ensureBullet(row, bulletIndex);
  bullet.text = text || '';
  bullet.sortOrder = bulletIndex;
  closeAiMenu();
};

const handleGeneratedBulletPoints = (rowIndex: number, bulletIndex: number, points: any[]) => {
  const pointText = points?.[0]?.text ?? '';
  applyBulletText(rowIndex, bulletIndex, pointText);
};

const handleTranslatedBulletPoint = (rowIndex: number, bulletIndex: number, text: string) => {
  const parts = text
    ? text
        .split(BULLET_POINT_SEPARATOR)
        .map((item) => item.trim())
        .filter((item) => item)
    : [];
  applyBulletText(rowIndex, bulletIndex, parts[0] ?? '');
};

const shortDescriptionToolbarOptions = [
  ['bold', 'underline'],
  [{ list: 'bullet' }],
  ['clean'],
];

const emptyHtml = '<p><br></p>';

const createEmptyTranslation = (): TranslationData => ({
  id: null,
  name: '',
  subtitle: '',
  shortDescription: emptyHtml,
  description: emptyHtml,
  urlKey: '',
});

const normalizedHtml = (value: string | null | undefined) => {
  if (!value) return emptyHtml;
  const trimmed = value.trim();
  if (!trimmed) return emptyHtml;
  return trimmed;
};

const isAlias = computed(() => props.product.type === ProductType.Alias);
const parentProduct = computed(() => (isAlias.value ? props.product.aliasParentProduct : props.product));
const parentProductType = computed(() => parentProduct.value.type);

const contentFieldRules = computed(() => {
  if (currentSalesChannel.value === 'default') {
    return getContentFieldRules();
  }
  const selectedChannel = salesChannels.value.find((channel: any) => channel.id === currentSalesChannel.value);
  return getContentFieldRules(selectedChannel?.type);
});

const currentSalesChannelType = computed(() => {
  if (currentSalesChannel.value === 'default') {
    return 'default';
  }
  const selectedChannel = salesChannels.value.find((channel: any) => channel.id === currentSalesChannel.value);
  return selectedChannel?.type || 'default';
});

const currentSalesChannelId = computed(() => (currentSalesChannel.value === 'default' ? null : currentSalesChannel.value));

const canUseTranslator = computed(() => !!language.value && language.value !== defaultLanguageCode.value);

const matrixRefetch = async () => {
  matrixRef.value?.resetHistory(variations.value);
};

const bulletColumnCount = computed(() => {
  if (!contentFieldRules.value.bulletPoints) {
    return 0;
  }
  const maxColumns = variations.value.reduce((max, row) => Math.max(max, row.bulletPoints.length), 0);
  return Math.max(maxColumns, 1);
});

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

const baseColumns = computed<MatrixColumn[]>(() => {
  const columns: MatrixColumn[] = [
    { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
    { key: 'name', label: t('shared.labels.name'), editable: false },
    { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
    { key: 'preview', label: t('products.products.variations.content.columns.preview'), editable: false, initialWidth: 80 },
  ];

  if (contentFieldRules.value.name) {
    columns.push({
      key: 'translationName',
      label: t('products.products.variations.content.columns.productName'),
      editable: true,
      initialWidth: 336,
    });
  }

  if (contentFieldRules.value.subtitle) {
    columns.push({
      key: 'subtitle',
      label: t('products.products.variations.content.columns.subtitle'),
      editable: true,
      initialWidth: 320,
    });
  }

  if (contentFieldRules.value.shortDescription) {
    columns.push({
      key: 'shortDescription',
      label: t('products.products.variations.content.columns.shortDescription'),
      editable: true,
      initialWidth: 240,
    });
  }

  if (contentFieldRules.value.description) {
    columns.push({
      key: 'description',
      label: t('products.products.variations.content.columns.description'),
      editable: true,
      initialWidth: 240,
    });
  }

  if (contentFieldRules.value.urlKey) {
    columns.push({
      key: 'urlKey',
      label: t('products.products.variations.content.columns.urlKey'),
      editable: true,
      initialWidth: 200,
    });
  }

  return columns;
});

const bulletColumns = computed<MatrixColumn[]>(() => {
  if (!contentFieldRules.value.bulletPoints) {
    return [];
  }
  return Array.from({ length: bulletColumnCount.value }, (_, index) => ({
    key: `bullet-${index}`,
    label: t('products.products.variations.content.columns.bullet', { index: index + 1 }),
    editable: true,
    initialWidth: 220,
    beforeInsert: () => insertBulletColumn(index),
    afterInsert: () => insertBulletColumn(index + 1),
  }));
});

const columns = computed<MatrixColumn[]>(() => [...baseColumns.value, ...bulletColumns.value]);

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

const insertBulletColumn = (index: number) => {
  variations.value.forEach((row) => {
    const insertionIndex = Math.min(index + 1, row.bulletPoints.length);
    row.bulletPoints.splice(insertionIndex, 0, { id: null, text: '', sortOrder: insertionIndex });
    row.bulletPoints.forEach((bp, idx) => {
      bp.sortOrder = idx;
    });
  });
};

const fetchLanguages = async () => {
  const { data } = await apolloClient.query({ query: translationLanguagesQuery, fetchPolicy: 'cache-first' });
  languages.value = data?.translationLanguages?.languages || [];
  const defaultCode = data?.translationLanguages?.defaultLanguage?.code || null;
  defaultLanguageCode.value = defaultCode || 'en';
  if (!language.value) {
    language.value = defaultCode;
    previousLanguage.value = defaultCode;
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

const fetchBulletPoints = async (translationId: string | null, policy: FetchPolicy = 'cache-first') => {
  if (!translationId) return [] as BulletPoint[];
  const { data } = await apolloClient.query({
    query: productTranslationBulletPointsQuery,
    variables: { filter: { productTranslation: { id: { exact: translationId } } } },
    fetchPolicy: policy,
  });
  return (
    data?.productTranslationBulletPoints?.edges?.map((edge: any, idx: number) => ({
      id: edge.node.id || null,
      text: edge.node.text || '',
      sortOrder: edge.node.sortOrder ?? idx,
    })) || []
  ).sort((a, b) => a.sortOrder - b.sortOrder);
};

const fetchTranslation = async (variationId: string, policy: FetchPolicy = 'network-only') => {
  if (!language.value) {
    return {
      translation: createEmptyTranslation(),
      defaultTranslation: null,
      bulletPoints: [] as BulletPoint[],
      defaultBulletPoints: [] as BulletPoint[],
    };
  }

  const selectedChannel = currentSalesChannel.value;
  let translationNode: any = null;
  let defaultNode: any = null;

  if (selectedChannel === 'default') {
    const { data } = await apolloClient.query({
      query: getProductContentByLanguageAndDefaultQuery,
      variables: { productId: variationId, languageCode: language.value },
      fetchPolicy: 'network-only',
    });
    translationNode = data?.productTranslations?.edges?.[0]?.node || null;
  } else {
    const { data } = await apolloClient.query({
      query: getProductContentByLanguageAndChannelQuery,
      variables: {
        productId: variationId,
        languageCode: language.value,
        salesChannelId: selectedChannel,
      },
      fetchPolicy: policy,
    });
    translationNode = data?.productTranslations?.edges?.[0]?.node || null;
    const { data: defData } = await apolloClient.query({
      query: getProductContentByLanguageAndDefaultQuery,
      variables: { productId: variationId, languageCode: language.value },
      fetchPolicy: 'network-only',
    });
    defaultNode = defData?.productTranslations?.edges?.[0]?.node || null;
  }

  const translation: TranslationData = {
    id: translationNode?.id ?? null,
    name: translationNode?.name || '',
    subtitle: translationNode?.subtitle || '',
    shortDescription: normalizedHtml(translationNode?.shortDescription),
    description: normalizedHtml(translationNode?.description),
    urlKey: translationNode?.urlKey || '',
  };

  const defaultTranslation = defaultNode
    ? {
        id: defaultNode.id ?? null,
        name: defaultNode.name || '',
        subtitle: defaultNode.subtitle || '',
        shortDescription: normalizedHtml(defaultNode.shortDescription),
        description: normalizedHtml(defaultNode.description),
        urlKey: defaultNode.urlKey || '',
      }
    : null;

  const bulletPoints = await fetchBulletPoints(translation.id, policy);
  const defaultBulletPoints = selectedChannel === 'default' ? bulletPoints : await fetchBulletPoints(defaultTranslation?.id ?? null, policy);

  return {
    translation,
    defaultTranslation,
    bulletPoints,
    defaultBulletPoints,
  };
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsQuery : configurableVariationsQuery;
  const key = isBundle ? 'bundleVariations' : 'configurableVariations';
  const pageSize = 100;
  let after: string | null = null;
  const nodes: VariationNode[] = [];
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
    const edges = connection?.edges ?? [];
    edges.forEach((edge: any) => {
      nodes.push({
        id: edge.node.variation.id,
        variation: {
          id: edge.node.variation.id,
          sku: edge.node.variation.sku,
          name: edge.node.variation.name,
          active: edge.node.variation.active,
        },
      });
    });
    hasNextPage = connection?.pageInfo?.hasNextPage ?? false;
    after = connection?.pageInfo?.endCursor ?? null;
    if (!after) break;
  }

  return nodes;
};

const loadData = async (policy: FetchPolicy = 'network-only') => {
  if (!language.value) return;
  closeAiMenu();
  loading.value = true;
  try {
    const variationNodes = await fetchVariations(policy);
    const rows = await Promise.all(
      variationNodes.map(async (node) => {
        const { translation, defaultTranslation, bulletPoints, defaultBulletPoints } = await fetchTranslation(
          node.variation.id,
          policy
        );
        return {
          id: node.variation.id,
          variation: node.variation,
          translation,
          defaultTranslation,
          bulletPoints,
          defaultBulletPoints,
        } as VariationContentRow;
      })
    );
    variations.value = rows;
    originalVariations.value = JSON.parse(JSON.stringify(rows));
    await nextTick();
    matrixRefetch();
  } catch (error) {
    console.error('Failed to load variation content', error);
    Toast.error(t('shared.alert.toast.generalError'));
  } finally {
    loading.value = false;
  }
};

const getMatrixCellValue = (rowIndex: number, key: string) => {
  const row = variations.value[rowIndex];
  if (!row) return null;
  switch (key) {
    case 'sku':
      return row.variation.sku;
    case 'name':
      return row.variation.name;
    case 'active':
      return row.variation.active;
    case 'preview':
      return null;
    case 'translationName':
      return row.translation.name;
    case 'subtitle':
      return row.translation.subtitle;
    case 'shortDescription':
      return row.translation.shortDescription;
    case 'description':
      return row.translation.description;
    case 'urlKey':
      return row.translation.urlKey;
    default:
      if (key.startsWith('bullet-')) {
        const index = parseInt(key.split('-')[1], 10);
        return row.bulletPoints[index]?.text || '';
      }
  }
  return null;
};

const ensureBullet = (row: VariationContentRow, index: number) => {
  while (row.bulletPoints.length <= index) {
    row.bulletPoints.push({ id: null, text: '', sortOrder: row.bulletPoints.length });
  }
  return row.bulletPoints[index];
};

const setMatrixCellValue = (rowIndex: number, key: string, value: any) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  if (key === 'translationName') {
    row.translation.name = value ?? '';
    return;
  }
  if (key === 'subtitle') {
    row.translation.subtitle = value ?? '';
    return;
  }
  if (key === 'shortDescription') {
    row.translation.shortDescription = value ?? emptyHtml;
    return;
  }
  if (key === 'description') {
    row.translation.description = value ?? emptyHtml;
    return;
  }
  if (key === 'urlKey') {
    row.translation.urlKey = value ?? '';
    return;
  }
  if (key.startsWith('bullet-')) {
    const index = parseInt(key.split('-')[1], 10);
    const bullet = ensureBullet(row, index);
    bullet.text = value ?? '';
    bullet.sortOrder = index;
  }
};

const cloneMatrixCellValue = (from: number, to: number, key: string) => {
  const source = variations.value[from];
  const target = variations.value[to];
  if (!source || !target) return;
  if (key === 'translationName') {
    target.translation.name = source.translation.name;
    return;
  }
  if (key === 'subtitle') {
    target.translation.subtitle = source.translation.subtitle;
    return;
  }
  if (key === 'shortDescription') {
    target.translation.shortDescription = source.translation.shortDescription;
    return;
  }
  if (key === 'description') {
    target.translation.description = source.translation.description;
    return;
  }
  if (key === 'urlKey') {
    target.translation.urlKey = source.translation.urlKey;
    return;
  }
  if (key.startsWith('bullet-')) {
    const index = parseInt(key.split('-')[1], 10);
    const value = source.bulletPoints[index]?.text || '';
    const bullet = ensureBullet(target, index);
    bullet.text = value;
  }
};

const startHtmlHoverPreview = (event: MouseEvent, value: string | null | undefined) => {
  const htmlValue = normalizedHtml(value);
  if (htmlValue === emptyHtml) return;
  if (hoverTimer.value) {
    window.clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }

  hoverPreview.visible = false;

  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  if (typeof window === 'undefined') return;

  hoverTimer.value = window.setTimeout(() => {
    const rect = target.getBoundingClientRect();
    const preferredWidth = Math.max(rect.width, 400);
    const maxWidth = Math.min(preferredWidth, 640);
    let left = rect.left + rect.width / 2 - maxWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - maxWidth - 16));
    const availableTop = rect.top;
    const availableBottom = window.innerHeight - rect.bottom;
    const showBelow = availableTop < 200 && availableBottom > availableTop;

    hoverPreview.content = htmlValue;
    hoverPreview.top = showBelow ? rect.bottom : rect.top;
    hoverPreview.left = left;
    hoverPreview.width = maxWidth;
    hoverPreview.placement = showBelow ? 'below' : 'above';
    hoverPreview.visible = true;
  }, 1000);
};

const stopHtmlHoverPreview = () => {
  if (typeof window === 'undefined') return;
  if (hoverTimer.value !== null) {
    window.clearTimeout(hoverTimer.value);
    hoverTimer.value = null;
  }
  hoverPreview.visible = false;
};

const clearMatrixCellValue = (rowIndex: number, key: string) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  if (key === 'translationName') {
    row.translation.name = '';
    return;
  }
  if (key === 'subtitle') {
    row.translation.subtitle = '';
    return;
  }
  if (key === 'shortDescription') {
    row.translation.shortDescription = emptyHtml;
    return;
  }
  if (key === 'description') {
    row.translation.description = emptyHtml;
    return;
  }
  if (key === 'urlKey') {
    row.translation.urlKey = '';
    return;
  }
  if (key.startsWith('bullet-')) {
    const index = parseInt(key.split('-')[1], 10);
    if (row.bulletPoints[index]) {
      row.bulletPoints[index].text = '';
    }
  }
};

const openPreview = (row: VariationContentRow) => {
  closeAiMenu();
  previewRow.value = row;
  previewVisible.value = true;
};

const closePreview = () => {
  previewVisible.value = false;
  previewRow.value = null;
};

const openHtmlModal = (rowIndex: number, field: 'shortDescription' | 'description') => {
  stopHtmlHoverPreview();
  closeAiMenu();
  htmlModal.rowIndex = rowIndex;
  htmlModal.field = field;
  const row = variations.value[rowIndex];
  if (!row) return;
  htmlModal.value = field === 'shortDescription' ? row.translation.shortDescription : row.translation.description;
  htmlModal.visible = true;
};

const closeHtmlModal = () => {
  htmlModal.visible = false;
  htmlModal.rowIndex = -1;
  htmlModal.field = 'shortDescription';
  htmlModal.value = emptyHtml;
};

const saveHtmlModal = () => {
  if (htmlModal.rowIndex < 0) {
    closeHtmlModal();
    return;
  }
  setMatrixCellValue(htmlModal.rowIndex, htmlModal.field, htmlModal.value || emptyHtml);
  closeHtmlModal();
};

const openTextModal = (rowIndex: number, key: string) => {
  closeAiMenu();
  textModal.rowIndex = rowIndex;
  textModal.key = key;
  const row = variations.value[rowIndex];
  if (!row) {
    textModal.value = '';
    textModal.visible = true;
    return;
  }

  if (key === 'translationName') {
    textModal.value = row.translation.name || '';
  } else if (key === 'subtitle') {
    textModal.value = row.translation.subtitle || '';
  } else if (key === 'urlKey') {
    textModal.value = row.translation.urlKey || '';
  } else if (key.startsWith('bullet-')) {
    const index = parseInt(key.split('-')[1], 10);
    textModal.value = row.bulletPoints[index]?.text || '';
  } else {
    textModal.value = '';
  }

  textModal.visible = true;
};

const closeTextModal = () => {
  textModal.visible = false;
  textModal.rowIndex = -1;
  textModal.key = '';
  textModal.value = '';
};

const saveTextModal = () => {
  if (textModal.rowIndex < 0 || !textModal.key) {
    closeTextModal();
    return;
  }
  setMatrixCellValue(textModal.rowIndex, textModal.key, textModal.value ?? '');
  closeTextModal();
};

const textModalLimitField = computed<ContentFieldLimitKey | null>(() => {
  if (textModal.key === 'translationName') return 'name';
  if (textModal.key === 'subtitle') return 'subtitle';
  if (textModal.key.startsWith('bullet-')) return 'bulletPoints';
  return null;
});

const textModalLimitValue = computed(() =>
  textModalLimitField.value ? contentFieldRules.value.limits[textModalLimitField.value] : undefined,
);

const textModalCharacterCount = computed(() => (textModal.value || '').length);

const textModalLimitExceeded = computed(
  () => typeof textModalLimitValue.value === 'number' && textModalCharacterCount.value > textModalLimitValue.value,
);

const htmlModalLimitField = computed<ContentFieldLimitKey>(() => htmlModal.field);
const htmlModalLimitValue = computed(() => contentFieldRules.value.limits[htmlModalLimitField.value]);
const htmlModalCharacterCount = computed(() => (htmlModal.value || '').length);
const htmlModalLimitExceeded = computed(
  () => typeof htmlModalLimitValue.value === 'number' && htmlModalCharacterCount.value > htmlModalLimitValue.value,
);

const handleLanguageChange = async (newLang: string | null) => {
  if (skipLanguageWatch.value) return;
  if (!newLang) return;
  if (!previousLanguage.value) {
    previousLanguage.value = newLang;
    return;
  }
  if (newLang === previousLanguage.value) return;
  const proceed = await askDiscardChanges();
  if (!proceed) {
    skipLanguageWatch.value = true;
    language.value = previousLanguage.value;
    await nextTick();
    skipLanguageWatch.value = false;
    return;
  }
  previousLanguage.value = newLang;
  await loadData('network-only');
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

watch(language, async (newLang) => {
  closeAiMenu();
  await handleLanguageChange(newLang);
});
watch(currentSalesChannel, async (newChannel) => {
  closeAiMenu();
  await handleSalesChannelChange(newChannel);
});

const shouldCreateTranslation = (row: VariationContentRow) => {
  const translation = row.translation;
  const rules = contentFieldRules.value;
  const hasFields =
    (rules.name && !!translation.name) ||
    (rules.subtitle && !!translation.subtitle) ||
    (rules.shortDescription && normalizedHtml(translation.shortDescription) !== emptyHtml) ||
    (rules.description && normalizedHtml(translation.description) !== emptyHtml) ||
    (rules.urlKey && !!translation.urlKey);
  const hasBullets = rules.bulletPoints && row.bulletPoints.some((bp) => bp.text.trim());
  return hasFields || hasBullets;
};

const computeBulletChanges = (current: BulletPoint[], original: BulletPoint[]) => {
  const originalMap = new Map<string, BulletPoint>();
  original
    .filter((bp) => bp.id)
    .forEach((bp) => {
      if (bp.id) originalMap.set(bp.id, bp);
    });

  const toCreate = current
    .filter((bp) => !bp.id && bp.text.trim())
    .map((bp, index) => ({ text: bp.text, sortOrder: bp.sortOrder ?? index }));

  const toUpdate = current
    .filter((bp) => {
      if (!bp.id) return false;
      const orig = originalMap.get(bp.id);
      if (!orig) return false;
      const trimmed = bp.text.trim();
      if (!trimmed) return false;
      return trimmed !== orig.text || (bp.sortOrder ?? 0) !== (orig.sortOrder ?? 0);
    })
    .map((bp) => ({ id: bp.id!, text: bp.text, sortOrder: bp.sortOrder ?? 0 }));

  const toDeleteIds = new Set<string>();
  original
    .filter((bp) => bp.id)
    .forEach((bp) => {
      const currentMatch = current.find((item) => item.id === bp.id);
      if (!currentMatch || !currentMatch.text.trim()) {
        if (bp.id) toDeleteIds.add(bp.id);
      }
    });

  current
    .filter((bp) => bp.id && !bp.text.trim())
    .forEach((bp) => {
      if (bp.id) toDeleteIds.add(bp.id);
    });

  const toDelete = Array.from(toDeleteIds).map((id) => ({ id }));

  return { toCreate, toUpdate, toDelete };
};

const save = async () => {
  if (!hasChanges.value || saving.value) return;
  if (!language.value) return;
  saving.value = true;
  try {
    const selectedChannel = currentSalesChannel.value;
    const operations: (() => Promise<void>)[] = [];

    variations.value.forEach((row) => {
      const original = originalVariations.value.find((orig) => orig.id === row.id);
      const translationInput = {
        name: row.translation.name,
        subtitle: row.translation.subtitle,
        shortDescription: normalizedHtml(row.translation.shortDescription),
        description: normalizedHtml(row.translation.description),
        urlKey: row.translation.urlKey,
        product: { id: row.variation.id },
        language: language.value,
        salesChannel: selectedChannel === 'default' ? null : { id: selectedChannel },
      } as any;

      const translationChanged = !original ||
        row.translation.name !== original.translation.name ||
        row.translation.subtitle !== original.translation.subtitle ||
        normalizedHtml(row.translation.shortDescription) !== normalizedHtml(original.translation.shortDescription) ||
        normalizedHtml(row.translation.description) !== normalizedHtml(original.translation.description) ||
        (row.translation.urlKey || '') !== (original.translation.urlKey || '');

      let translationId = row.translation.id;

      if (translationId) {
        if (translationChanged) {
          operations.push(async () => {
            await apolloClient.mutate({
              mutation: updateProductTranslationMutation,
              variables: { data: { id: translationId, ...translationInput } },
            });
          });
        }
      } else if (shouldCreateTranslation(row)) {
        operations.push(async () => {
          const { data } = await apolloClient.mutate({
            mutation: createProductTranslationMutation,
            variables: { data: translationInput },
          });
          translationId = data?.createProductTranslation?.id ?? null;
          row.translation.id = translationId;
        });
      }

      operations.push(async () => {
        if (!translationId) return;
        const originalBullets = original?.bulletPoints ?? [];
        row.bulletPoints.forEach((bp, idx) => {
          bp.sortOrder = idx;
        });
        const { toCreate, toUpdate, toDelete } = computeBulletChanges(row.bulletPoints, originalBullets);

        if (toCreate.length) {
          await apolloClient.mutate({
            mutation: createProductTranslationBulletPointsMutation,
            variables: {
              data: toCreate.map((bp) => ({ ...bp, productTranslation: { id: translationId } })),
            },
          });
        }

        for (const updateData of toUpdate) {
          await apolloClient.mutate({
            mutation: updateProductTranslationBulletPointMutation,
            variables: { data: updateData },
          });
        }

        if (toDelete.length) {
          await apolloClient.mutate({
            mutation: deleteProductTranslationBulletPointsMutation,
            variables: { data: toDelete },
          });
        }
      });
    });

    for (const operation of operations) {
      await operation();
    }

    Toast.success(t('products.products.variations.content.toast.saveSuccess'));
    await loadData('network-only');
  } catch (error) {
    console.error('Failed to save variation content', error);
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.entries(validationErrors)
      .map(([field, message]) => {
        if (!message) return null;
        const messageText = Array.isArray(message) ? message.join(', ') : String(message);
        if (field === '__all__') {
          return messageText;
        }
          const fieldLabels: Record<string, string> = {
            name: t('shared.labels.name'),
            subtitle: t('products.translation.labels.subtitle'),
            shortDescription: t('shared.labels.shortDescription'),
            description: t('products.translation.labels.description'),
            urlKey: t('products.translation.labels.urlKey'),
            bulletPoints: t('products.translation.labels.bulletPoints'),
          };
        const label = fieldLabels[field] || field;
        return t('products.products.variations.content.validation.fieldError', {
          field: label,
          message: messageText,
        });
      })
      .filter(Boolean) as string[];
    if (messages.length) {
      Toast.error(messages.join('<br>'));
    } else {
      Toast.error(t('shared.messages.somethingWentWrong'));
    }
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', stopHtmlHoverPreview, true);
    window.addEventListener('resize', stopHtmlHoverPreview);
  }
  await Promise.all([fetchLanguages(), loadSalesChannels()]);
  previousSalesChannel.value = currentSalesChannel.value;
  if (language.value) {
    await loadData('network-only');
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', stopHtmlHoverPreview, true);
    window.removeEventListener('resize', stopHtmlHoverPreview);
  }
  stopHtmlHoverPreview();
});

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div class="relative w-full min-w-0 variations-content-bulk-edit">
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
      @save="save"
    >
      <template #toolbar-right>
        <div class="flex items-center gap-2">
          <AdvancedContentGenerator
            :product-ids="variationProductIds"
            :initial-sales-channel-ids="currentSalesChannel !== 'default' ? [currentSalesChannel] : []"
            :small="false"
            btn-class="btn-outline-primary whitespace-nowrap"
          />
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
          <Selector
            v-if="languages.length"
            v-model="language"
            :options="languages"
            class="w-40"
            :placeholder="t('products.translation.placeholders.language')"
            :removable="false"
            labelBy="name"
            valueBy="code"
            mandatory
            filterable
          />
        </div>
      </template>
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'productContent' } }"
            target="_blank"
          >
            <span class="block truncate" :title="row.variation.name">
              {{ shortenText(row.variation.name, 40) }}
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
        <template v-else-if="column.key === 'preview'">
          <Icon
            name="eye"
            class="h-5 w-5 text-gray-500 cursor-pointer"
            role="button"
            tabindex="0"
            :aria-label="t('products.products.variations.content.columns.preview')"
            @click="openPreview(row)"
            @keydown.enter.prevent="openPreview(row)"
            @keydown.space.prevent="openPreview(row)"
          />
        </template>
        <template v-else-if="column.key === 'translationName'">
          <div class="space-y-2">
            <div class="relative cursor-pointer" @dblclick="openTextModal(rowIndex, column.key)">
              <div class="flex h-8 items-center justify-between border border-gray-300 p-1">
                <div class="overflow-hidden text-ellipsis whitespace-nowrap pr-6">
                  {{ shortenText(row.translation.name || '', 40) }}
                </div>
                <Icon
                  name="maximize"
                  class="flex-shrink-0 cursor-pointer text-gray-400"
                  @click.stop="openTextModal(rowIndex, column.key)"
                />
              </div>
            </div>
            <div v-if="language && canUseTranslator" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                class="flex w-full sm:w-auto items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                @click.stop="toggleAiMenu(rowIndex, column.key)"
              >
                <Icon name="gem" class="h-3 w-3 text-gray-500" />
                <span>{{ t('shared.button.useAi') }}</span>
              </Button>
              <div v-if="isAiMenuOpen(rowIndex, column.key)" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <AiContentTranslator
                  :product="{ id: row.variation.id }"
                  product-content-type="NAME"
                  to-translate=""
                  :from-language-code="defaultLanguageCode"
                  :to-language-code="language || ''"
                  :sales-channel-id="currentSalesChannelId || undefined"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @translated="(value) => applyNameTranslation(rowIndex, value)"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'subtitle'">
          <div class="space-y-2">
            <div class="relative cursor-pointer" @dblclick="openTextModal(rowIndex, column.key)">
              <div class="flex h-8 items-center justify-between border border-gray-300 p-1">
                <div class="overflow-hidden text-ellipsis whitespace-nowrap pr-6">
                  {{ shortenText(row.translation.subtitle || '', 40) }}
                </div>
                <Icon
                  name="maximize"
                  class="flex-shrink-0 cursor-pointer text-gray-400"
                  @click.stop="openTextModal(rowIndex, column.key)"
                />
              </div>
            </div>
            <div v-if="language && canUseTranslator" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                class="flex w-full sm:w-auto items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                @click.stop="toggleAiMenu(rowIndex, column.key)"
              >
                <Icon name="gem" class="h-3 w-3 text-gray-500" />
                <span>{{ t('shared.button.useAi') }}</span>
              </Button>
              <div v-if="isAiMenuOpen(rowIndex, column.key)" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <AiContentTranslator
                  :product="{ id: row.variation.id }"
                  product-content-type="SUBTITLE"
                  to-translate=""
                  :from-language-code="defaultLanguageCode"
                  :to-language-code="language || ''"
                  :sales-channel-id="currentSalesChannelId || undefined"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @translated="(value) => applySubtitleTranslation(rowIndex, value)"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'shortDescription'">
          <div class="space-y-2">
            <div
              class="relative cursor-pointer"
              @dblclick="openHtmlModal(rowIndex, 'shortDescription')"
              @mouseenter="startHtmlHoverPreview($event, row.translation.shortDescription)"
              @mouseleave="stopHtmlHoverPreview"
            >
              <div class="flex min-h-[4rem] items-start gap-2 border border-gray-300 p-2">
                <div class="flex-1 overflow-hidden break-words whitespace-normal pr-4 text-sm leading-5">
                  {{ shortenText(row.translation.shortDescription?.replace(/<[^>]+>/g, '') || '', 48) }}
                </div>
                <div class="flex flex-shrink-0 items-center gap-2 self-center">
                  <Icon name="code" class="text-primary" />
                  <Icon
                    name="maximize"
                    class="cursor-pointer text-gray-400"
                    @click.stop="openHtmlModal(rowIndex, 'shortDescription')"
                  />
                </div>
              </div>
            </div>
            <div v-if="language" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                class="flex w-full sm:w-auto items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                @click.stop="toggleAiMenu(rowIndex, column.key)"
              >
                <Icon name="gem" class="h-3 w-3 text-gray-500" />
                <span>{{ t('shared.button.useAi') }}</span>
              </Button>
              <div v-if="isAiMenuOpen(rowIndex, column.key)" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <AiContentGenerator
                  :product-id="row.variation.id"
                  :language-code="language"
                  content-ai-generate-type="SHORT_DESCRIPTION"
                  :sales-channel-type="currentSalesChannelType"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @generated="(value) => applyShortDescriptionContent(rowIndex, value)"
                />
                <AiContentTranslator
                  v-if="canUseTranslator"
                  :product="{ id: row.variation.id }"
                  product-content-type="SHORT_DESCRIPTION"
                  to-translate=""
                  :from-language-code="defaultLanguageCode"
                  :to-language-code="language || ''"
                  :sales-channel-id="currentSalesChannelId || undefined"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @translated="(value) => applyShortDescriptionContent(rowIndex, value)"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'description'">
          <div class="space-y-2">
            <div
              class="relative cursor-pointer"
              @dblclick="openHtmlModal(rowIndex, 'description')"
              @mouseenter="startHtmlHoverPreview($event, row.translation.description)"
              @mouseleave="stopHtmlHoverPreview"
            >
              <div class="flex min-h-[4rem] items-start gap-2 border border-gray-300 p-2">
                <div class="flex-1 overflow-hidden break-words whitespace-normal pr-4 text-sm leading-5">
                  {{ shortenText(row.translation.description?.replace(/<[^>]+>/g, '') || '', 48) }}
                </div>
                <div class="flex flex-shrink-0 items-center gap-2 self-center">
                  <Icon name="code" class="text-primary" />
                  <Icon
                    name="maximize"
                    class="cursor-pointer text-gray-400"
                    @click.stop="openHtmlModal(rowIndex, 'description')"
                  />
                </div>
              </div>
            </div>
            <div v-if="language" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                class="flex w-full sm:w-auto items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                @click.stop="toggleAiMenu(rowIndex, column.key)"
              >
                <Icon name="gem" class="h-3 w-3 text-gray-500" />
                <span>{{ t('shared.button.useAi') }}</span>
              </Button>
              <div v-if="isAiMenuOpen(rowIndex, column.key)" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <AiContentGenerator
                  :product-id="row.variation.id"
                  :language-code="language"
                  content-ai-generate-type="DESCRIPTION"
                  :sales-channel-type="currentSalesChannelType"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @generated="(value) => applyDescriptionContent(rowIndex, value)"
                />
                <AiContentTranslator
                  v-if="canUseTranslator"
                  :product="{ id: row.variation.id }"
                  product-content-type="DESCRIPTION"
                  to-translate=""
                  :from-language-code="defaultLanguageCode"
                  :to-language-code="language || ''"
                  :sales-channel-id="currentSalesChannelId || undefined"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @translated="(value) => applyDescriptionContent(rowIndex, value)"
                />
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="column.key === 'urlKey'">
          <div class="relative cursor-pointer" @dblclick="openTextModal(rowIndex, column.key)">
            <div class="border border-gray-300 p-1 h-8 flex items-center justify-between">
              <div class="overflow-hidden text-ellipsis whitespace-nowrap pr-6">
                {{ shortenText(row.translation.urlKey || '', 24) }}
              </div>
              <Icon
                name="maximize"
                class="text-gray-400 cursor-pointer flex-shrink-0"
                @click.stop="openTextModal(rowIndex, column.key)"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="space-y-2">
            <div class="relative cursor-pointer" @dblclick="openTextModal(rowIndex, column.key)">
              <div class="flex h-8 items-center justify-between border border-gray-300 p-1">
                <div class="overflow-hidden text-ellipsis whitespace-nowrap pr-6">
                  {{
                    shortenText(
                      row.bulletPoints[parseInt(column.key.split('-')[1], 10)]?.text || '',
                      24
                    )
                  }}
                </div>
                <Icon
                  name="maximize"
                  class="flex-shrink-0 cursor-pointer text-gray-400"
                  @click.stop="openTextModal(rowIndex, column.key)"
                />
              </div>
            </div>
            <div v-if="language" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                class="flex w-full sm:w-auto items-center justify-center gap-2 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                @click.stop="toggleAiMenu(rowIndex, column.key)"
              >
                <Icon name="gem" class="h-3 w-3 text-gray-500" />
                <span>{{ t('shared.button.useAi') }}</span>
              </Button>
              <div v-if="isAiMenuOpen(rowIndex, column.key)" class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <AiBulletPointsGenerator
                  :product-id="row.variation.id"
                  :language-code="language"
                  :return-one="true"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  @generated="(points) =>
                    handleGeneratedBulletPoints(rowIndex, parseInt(column.key.split('-')[1], 10), points)
                  "
                />
                <AiContentTranslator
                  v-if="canUseTranslator"
                  :product="{ id: row.variation.id }"
                  product-content-type="BULLET_POINTS"
                  to-translate=""
                  :from-language-code="defaultLanguageCode"
                  :to-language-code="language || ''"
                  :sales-channel-id="currentSalesChannelId || undefined"
                  :btn-class="'btn-outline-secondary border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-700'"
                  :icon-class="'text-gray-500'"
                  :small="false"
                  :return-one-bullet-point="true"
                  :bullet-point-index="parseInt(column.key.split('-')[1], 10)"
                  @translated="(value) =>
                    handleTranslatedBulletPoint(rowIndex, parseInt(column.key.split('-')[1], 10), value)
                  "
                />
              </div>
            </div>
          </div>
        </template>
      </template>
    </MatrixEditor>

    <Teleport to="body">
      <div
        v-if="hoverPreview.visible"
        class="fixed z-50 pointer-events-none"
        :style="{
          top: hoverPreview.top + 'px',
          left: hoverPreview.left + 'px',
          width: hoverPreview.width + 'px',
        }"
      >
        <div
          class="pointer-events-auto"
          :style="{
            transform:
              hoverPreview.placement === 'above'
                ? 'translateY(calc(-100% - 12px))'
                : 'translateY(12px)',
          }"
        >
          <div class="rounded-md border border-gray-200 bg-white p-4 shadow-lg">
            <div class="text-sm leading-5" v-html="hoverPreview.content" />
          </div>
        </div>
      </div>
    </Teleport>

    <Modal v-model="previewVisible" @closed="closePreview">
      <Card class="modal-content w-3/4 max-w-5xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.variations.content.previewModal.title') }}
          </h3>
          <Button class="btn btn-outline-dark" @click="closePreview">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
        <ProductContentPreview
          v-if="previewRow"
          :content="previewRow.translation"
          :default-content="previewRow.defaultTranslation"
          :current-channel="currentSalesChannel"
          :channels="salesChannels"
          :bullet-points="(previewRow.bulletPoints.some((bp) => bp.text.trim()) ? previewRow.bulletPoints : previewRow.defaultBulletPoints).filter((bp) => bp.text.trim())"
        />
      </Card>
    </Modal>

    <Modal v-model="textModal.visible" @closed="closeTextModal">
      <Card class="modal-content w-4/5 max-w-3xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.bulkEditModal.textTitle') }}
          </h3>
          <span
            v-if="typeof textModalLimitValue === 'number'"
            class="text-xs"
            :class="textModalLimitExceeded ? 'text-red-500' : 'text-gray-400'"
          >
            {{ textModalCharacterCount }} / {{ textModalLimitValue }}
          </span>
        </div>
        <TextEditor
          v-if="textModal.key.startsWith('bullet-')"
          v-model="textModal.value"
          class="w-full min-h-[96px]"
          :scroll="true"
        />
        <TextInput v-else class="w-full" v-model="textModal.value" />
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeTextModal">{{ t('shared.button.cancel') }}</Button>
          <Button class="btn btn-primary" @click="saveTextModal">{{ t('shared.button.edit') }}</Button>
        </div>
      </Card>
    </Modal>

    <Modal v-model="htmlModal.visible" @closed="closeHtmlModal">
      <Card class="modal-content w-3/4 max-w-4xl">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-semibold">
              {{ htmlModal.field === 'shortDescription'
                ? t('products.products.variations.content.modals.shortDescriptionTitle')
                : t('products.products.variations.content.modals.descriptionTitle') }}
            </h3>
            <span
              v-if="typeof htmlModalLimitValue === 'number'"
              class="text-xs"
              :class="htmlModalLimitExceeded ? 'text-red-500' : 'text-gray-400'"
            >
              {{ htmlModalCharacterCount }} / {{ htmlModalLimitValue }}
            </span>
          </div>
          <div class="flex gap-2">
            <Button class="btn btn-outline-dark" @click="closeHtmlModal">
              {{ t('shared.button.cancel') }}
            </Button>
            <Button class="btn btn-primary" @click="saveHtmlModal">
              {{ t('shared.button.save') }}
            </Button>
          </div>
        </div>
        <TextHtmlEditor
          v-model="htmlModal.value"
          :toolbar-options="htmlModal.field === 'shortDescription' ? shortDescriptionToolbarOptions : undefined"
          class="min-h-[320px]"
        />
      </Card>
    </Modal>
  </div>
</template>

<style scoped>
.variations-content-bulk-edit :deep(.ql-editor) {
  min-height: 220px;
}
</style>
