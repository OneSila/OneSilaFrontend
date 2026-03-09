<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, withDefaults } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import MatrixEditor from '../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue';
import type { MatrixColumn, MatrixEditorExpose } from '../../../../../../../../../shared/components/organisms/matrix-editor/types';
import { Product } from '../../../../../../configs';
import { ProductType } from '../../../../../../../../../shared/utils/constants';
import apolloClient from '../../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Card } from '../../../../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import { Link } from '../../../../../../../../../shared/components/atoms/link';
import { Selector } from '../../../../../../../../../shared/components/atoms/selector';
import { Toast } from '../../../../../../../../../shared/modules/toast';
import { displayApolloError, shortenText } from '../../../../../../../../../shared/utils';
import {
  bundleVariationsWithEbayQuery,
  configurableVariationsWithEbayQuery,
  productsWithEbayQuery,
} from '../../../../../../../../../shared/api/queries/products.js';
import { propertiesQuerySelector, productTypePropertyValuesQuery } from '../../../../../../../../../shared/api/queries/properties.js';
import { ebayCategoriesQuery } from '../../../../../../../../../shared/api/queries/ebayCategories.js';
import { ebayStoreCategoriesQuery } from '../../../../../../../../../shared/api/queries/ebayStoreCategories.js';
import {
  ebayProductCategoriesWithProductsQuery,
  ebayProductStoreCategoriesWithProductsQuery,
} from '../../../../../../../../../shared/api/queries/ebayProducts.js';
import { ebayChannelViewsQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import {
  createEbayProductCategoryMutation,
  createEbayProductStoreCategoryMutation,
  deleteEbayProductCategoryMutation,
  deleteEbayProductStoreCategoryMutation,
  updateEbayProductCategoryMutation,
  updateEbayProductStoreCategoryMutation,
} from '../../../../../../../../../shared/api/mutations/ebayProducts.js';
import EbayCategoryBrowser from '../../../ebay/components/EbayCategoryBrowser.vue';
import EbayCategoryDualSelectionPreview from '../../../ebay/components/EbayCategoryDualSelectionPreview.vue';
import EbayCategoryDetails from '../../../ebay/components/EbayCategoryDetails.vue';
import EbayStoreCategoryBrowser from '../../../ebay/components/EbayStoreCategoryBrowser.vue';
import EbayStoreCategoryDetails from '../../../ebay/components/EbayStoreCategoryDetails.vue';
import {
  mapCategoriesConnection,
  normalizeCategoryNode,
  resolveDefaultCategoryTarget,
  type EbayCategoryNode,
  type EbayCategoryTarget,
} from '../../../ebay/components/ebayCategoryUtils';
import {
  mapStoreCategoriesConnection,
  normalizeStoreCategoryNode,
  type EbayStoreCategoryNode,
} from '../../../ebay/components/ebayStoreCategoryUtils';

interface CategorySelection {
  productCategoryId: string | null;
  remoteId: string | null;
  secondaryCategoryId: string | null;
  path: string | null;
  secondaryPath: string | null;
}

interface StoreCategorySelection {
  productStoreCategoryId: string | null;
  primaryRemoteId: string | null;
  secondaryRemoteId: string | null;
  primaryPath: string | null;
  secondaryPath: string | null;
  primaryCategoryNodeId: string | null;
  secondaryCategoryNodeId: string | null;
}

interface VariationRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
  };
  categories: Record<string, CategorySelection>;
  storeCategories: Record<string, StoreCategorySelection>;
  productRuleValue: string | null;
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] },
);

const { t } = useI18n();

const viewColumnPrefix = 'ebay-view-';
const productRuleColumnKey = 'productRule';
const storeCategoryColumnKey = 'ebay-store-category';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const categoryMapByView = ref<Record<string, Record<string, EbayCategoryNode>>>({});
const storeCategoryMapBySalesChannel = ref<Record<string, Record<string, EbayStoreCategoryNode>>>({});
const productTypePropertyId = ref<string | null>(null);
const productTypePropertyName = ref<string | null>(null);

const ebayViews = ref<any[]>([]);
const selectedSalesChannelId = ref<string | null>(null);

const selectionModal = reactive({
  visible: false,
  rowIndex: -1,
  viewId: null as string | null,
  target: 'main' as EbayCategoryTarget,
});
const modalMainNode = ref<EbayCategoryNode | null>(null);
const modalSecondaryNode = ref<EbayCategoryNode | null>(null);
const modalOriginalMainNode = ref<EbayCategoryNode | null>(null);
const modalOriginalSecondaryNode = ref<EbayCategoryNode | null>(null);
const modalSlotErrors = ref<{ main: string | null; secondary: string | null }>({
  main: null,
  secondary: null,
});

const previewVisible = ref(false);
const previewMainNode = ref<EbayCategoryNode | null>(null);
const previewSecondaryNode = ref<EbayCategoryNode | null>(null);
const previewRow = ref<VariationRow | null>(null);

const storeSelectionModal = reactive({
  visible: false,
  rowIndex: -1,
  salesChannelId: null as string | null,
  target: 'main' as EbayCategoryTarget,
});
const modalStoreMainNode = ref<EbayStoreCategoryNode | null>(null);
const modalStoreSecondaryNode = ref<EbayStoreCategoryNode | null>(null);
const modalStoreOriginalMainNode = ref<EbayStoreCategoryNode | null>(null);
const modalStoreOriginalSecondaryNode = ref<EbayStoreCategoryNode | null>(null);
const modalStoreSlotErrors = ref<{ main: string | null; secondary: string | null }>({
  main: null,
  secondary: null,
});

const storePreviewVisible = ref(false);
const previewStoreMainNode = ref<EbayStoreCategoryNode | null>(null);
const previewStoreSecondaryNode = ref<EbayStoreCategoryNode | null>(null);
const previewStoreRow = ref<VariationRow | null>(null);

const duplicateCategoryErrorText = computed(
  () => t('products.products.ebay.selectionSlots.sameCategoryError'),
);
const modalHasDuplicateCategorySelection = computed(
  () => Boolean(
    modalMainNode.value?.remoteId &&
    modalSecondaryNode.value?.remoteId &&
    modalMainNode.value.remoteId === modalSecondaryNode.value.remoteId,
  ),
);
const modalMainError = computed(
  () => modalSlotErrors.value.main || (modalHasDuplicateCategorySelection.value ? duplicateCategoryErrorText.value : null),
);
const modalSecondaryError = computed(
  () => modalSlotErrors.value.secondary || (modalHasDuplicateCategorySelection.value ? duplicateCategoryErrorText.value : null),
);
const modalStoreHasDuplicateCategorySelection = computed(
  () => Boolean(
    modalStoreMainNode.value?.remoteId &&
    modalStoreSecondaryNode.value?.remoteId &&
    modalStoreMainNode.value.remoteId === modalStoreSecondaryNode.value.remoteId,
  ),
);
const modalStoreMainError = computed(
  () => modalStoreSlotErrors.value.main || (modalStoreHasDuplicateCategorySelection.value ? duplicateCategoryErrorText.value : null),
);
const modalStoreSecondaryError = computed(
  () => modalStoreSlotErrors.value.secondary || (modalStoreHasDuplicateCategorySelection.value ? duplicateCategoryErrorText.value : null),
);

const hasProductIds = computed(() => props.productIds.length > 0);
const isAlias = computed(() => props.product?.type === ProductType.Alias);
const parentProduct = computed(() => {
  if (!props.product) {
    return null;
  }
  return isAlias.value ? props.product.aliasParentProduct : props.product;
});
const parentProductType = computed(() => parentProduct.value?.type ?? null);

const viewById = computed(() =>
  ebayViews.value.reduce<Record<string, any>>((acc, view) => {
    acc[view.id] = view;
    return acc;
  }, {}),
);

const viewsBySalesChannel = computed(() => {
  const grouped: Record<string, any[]> = {};
  ebayViews.value.forEach((view) => {
    const channelId = view?.salesChannel?.id;
    if (!channelId) return;
    if (!grouped[channelId]) grouped[channelId] = [];
    grouped[channelId].push(view);
  });
  Object.values(grouped).forEach((list) => {
    list.sort((a: any, b: any) => {
      if (a.isDefault === b.isDefault) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return a.isDefault ? -1 : 1;
    });
  });
  return grouped;
});

const salesChannelOptions = computed(() => {
  const map = new Map<string, { id: string; name: string }>();
  ebayViews.value.forEach((view) => {
    const channel = view?.salesChannel;
    if (!channel?.id) return;
    if (!map.has(channel.id)) {
      map.set(channel.id, { id: channel.id, name: channel.hostname || '-' });
    }
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
});

const selectedViews = computed(() =>
  selectedSalesChannelId.value ? viewsBySalesChannel.value[selectedSalesChannelId.value] || [] : [],
);

const selectionModalView = computed(() =>
  selectionModal.viewId ? viewById.value[selectionModal.viewId] : null,
);
const storeSelectionModalSalesChannel = computed(() =>
  storeSelectionModal.salesChannelId
    ? salesChannelOptions.value.find((option) => option.id === storeSelectionModal.salesChannelId) || null
    : null,
);

const buildViewColumnKey = (viewId: string) => `${viewColumnPrefix}${viewId}`;

const getViewIdFromColumnKey = (columnKey: string) =>
  columnKey.startsWith(viewColumnPrefix)
    ? columnKey.slice(viewColumnPrefix.length)
    : null;

const isCategoryColumn = (columnKey: string) =>
  columnKey.startsWith(viewColumnPrefix);

const getViewValueType = (viewId: string) => `ebay-category-${viewId}`;

const columns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false, initialWidth: 160 },
  {
    key: productRuleColumnKey,
    label: productTypePropertyName.value || t('products.products.variations.bulkEdit.labels.productRule'),
    sticky: true,
    editable: false,
    initialWidth: 220,
  },
  { key: 'name', label: t('shared.labels.name'), editable: false, initialWidth: 280 },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 80 },
  ...(selectedSalesChannelId.value ? [{
    key: storeCategoryColumnKey,
    label: t('products.products.variations.ebay.columns.storeCategory'),
    editable: true,
    initialWidth: 560,
    valueType: 'ebay-store-category',
  }] : []),
  ...selectedViews.value.map((view) => ({
    key: buildViewColumnKey(view.id),
    label: view.name || view.remoteId || '-',
    editable: true,
    initialWidth: 560,
    valueType: getViewValueType(view.id),
  })),
]);

const hasChanges = computed(() => {
  if (variations.value.length !== originalVariations.value.length) {
    return true;
  }
  const originalMap = new Map<string, VariationRow>();
  originalVariations.value.forEach((row) => {
    originalMap.set(row.id, row);
  });
  return variations.value.some((row) => {
    const original = originalMap.get(row.id);
    if (!original) return true;
    const categoryChanged = ebayViews.value.some((view) => {
      const viewId = view.id;
      const currentRemoteId = row.categories[viewId]?.remoteId ?? null;
      const originalRemoteId = original.categories[viewId]?.remoteId ?? null;
      const currentSecondaryCategoryId = row.categories[viewId]?.secondaryCategoryId ?? null;
      const originalSecondaryCategoryId = original.categories[viewId]?.secondaryCategoryId ?? null;
      const currentCategoryId = row.categories[viewId]?.productCategoryId ?? null;
      const originalCategoryId = original.categories[viewId]?.productCategoryId ?? null;
      return (
        currentRemoteId !== originalRemoteId ||
        currentSecondaryCategoryId !== originalSecondaryCategoryId ||
        currentCategoryId !== originalCategoryId
      );
    });
    if (categoryChanged) {
      return true;
    }
    const storeSalesChannelIds = new Set([
      ...Object.keys(row.storeCategories || {}),
      ...Object.keys(original.storeCategories || {}),
    ]);
    return Array.from(storeSalesChannelIds).some((salesChannelId) => {
      const current = row.storeCategories[salesChannelId] || null;
      const previous = original.storeCategories[salesChannelId] || null;
      return (
        (current?.productStoreCategoryId ?? null) !== (previous?.productStoreCategoryId ?? null) ||
        (current?.primaryRemoteId ?? null) !== (previous?.primaryRemoteId ?? null) ||
        (current?.secondaryRemoteId ?? null) !== (previous?.secondaryRemoteId ?? null)
      );
    });
  });
});

const hasUnsavedChanges = hasChanges;

const createEmptyCategory = (): CategorySelection => ({
  productCategoryId: null,
  remoteId: null,
  secondaryCategoryId: null,
  path: null,
  secondaryPath: null,
});

const createEmptyStoreCategory = (): StoreCategorySelection => ({
  productStoreCategoryId: null,
  primaryRemoteId: null,
  secondaryRemoteId: null,
  primaryPath: null,
  secondaryPath: null,
  primaryCategoryNodeId: null,
  secondaryCategoryNodeId: null,
});

const ensureCategorySelection = (row: VariationRow, viewId: string) => {
  if (!row.categories[viewId]) {
    row.categories[viewId] = createEmptyCategory();
  }
  return row.categories[viewId];
};

const ensureStoreCategorySelection = (row: VariationRow, salesChannelId: string) => {
  if (!row.storeCategories[salesChannelId]) {
    row.storeCategories[salesChannelId] = createEmptyStoreCategory();
  }
  return row.storeCategories[salesChannelId];
};

const getCategorySelection = (row: VariationRow, columnKey: string) => {
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return null;
  return row.categories[viewId] || null;
};

const getStoreCategorySelection = (row: VariationRow) => {
  if (!selectedSalesChannelId.value) return null;
  return row.storeCategories[selectedSalesChannelId.value] || null;
};

const buildCategoryPath = (remoteId: string, viewId: string) => {
  const map = categoryMapByView.value[viewId] || {};
  const node = map[remoteId];
  if (!node) return null;
  if (node.fullName) return node.fullName;
  const parts: string[] = [];
  let current: EbayCategoryNode | undefined = node;
  const visited = new Set<string>();
  while (current && !visited.has(current.remoteId)) {
    parts.unshift(current.name || current.remoteId);
    visited.add(current.remoteId);
    const parentId = current.parentNode?.remoteId;
    if (!parentId) break;
    current = map[parentId];
  }
  return parts.length ? parts.join(' > ') : null;
};

const getCategoryDisplayPath = (
  row: VariationRow,
  columnKey: string,
  target: EbayCategoryTarget,
) => {
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return null;
  const selection = row.categories[viewId];
  const remoteId = target === 'secondary' ? selection?.secondaryCategoryId : selection?.remoteId;
  if (!remoteId) return null;
  const savedPath = target === 'secondary' ? selection?.secondaryPath : selection?.path;
  return savedPath || buildCategoryPath(remoteId, viewId) || remoteId;
};

const buildStoreCategoryPath = (remoteId: string, salesChannelId: string) => {
  const map = storeCategoryMapBySalesChannel.value[salesChannelId] || {};
  const node = map[remoteId];
  if (!node) return null;
  return node.fullPath || node.name || remoteId;
};

const getStoreCategoryDisplayPath = (row: VariationRow, target: EbayCategoryTarget) => {
  const salesChannelId = selectedSalesChannelId.value;
  if (!salesChannelId) return null;
  const selection = row.storeCategories[salesChannelId];
  const remoteId = target === 'secondary' ? selection?.secondaryRemoteId : selection?.primaryRemoteId;
  if (!remoteId) return null;
  const savedPath = target === 'secondary' ? selection?.secondaryPath : selection?.primaryPath;
  return savedPath || buildStoreCategoryPath(remoteId, salesChannelId) || remoteId;
};

const copySkuToClipboard = async (sku: string) => {
  try {
    await navigator.clipboard.writeText(sku);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const getMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  if (!row) return null;
  if (columnKey === 'sku') return row.variation.sku;
  if (columnKey === productRuleColumnKey) return row.productRuleValue;
  if (columnKey === 'name') return row.variation.name;
  if (columnKey === 'active') return row.variation.active;
  if (columnKey === storeCategoryColumnKey) {
    const salesChannelId = selectedSalesChannelId.value;
    if (!salesChannelId) return null;
    const category = row.storeCategories[salesChannelId];
    if (!category?.primaryRemoteId) return null;
    return {
      primaryRemoteId: category.primaryRemoteId,
      secondaryRemoteId: category.secondaryRemoteId,
      primaryPath: category.primaryPath,
      secondaryPath: category.secondaryPath,
      primaryCategoryNodeId: category.primaryCategoryNodeId,
      secondaryCategoryNodeId: category.secondaryCategoryNodeId,
    };
  }
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return null;
  const category = row.categories[viewId];
  if (!category?.remoteId) return null;
  return {
    remoteId: category.remoteId,
    secondaryCategoryId: category.secondaryCategoryId,
    path: category.path,
    secondaryPath: category.secondaryPath,
  };
};

const clearCategorySelection = (row: VariationRow, viewId: string) => {
  const category = ensureCategorySelection(row, viewId);
  category.remoteId = null;
  category.secondaryCategoryId = null;
  category.path = null;
  category.secondaryPath = null;
};

const clearStoreCategorySelection = (row: VariationRow, salesChannelId: string) => {
  const category = ensureStoreCategorySelection(row, salesChannelId);
  category.primaryRemoteId = null;
  category.secondaryRemoteId = null;
  category.primaryPath = null;
  category.secondaryPath = null;
  category.primaryCategoryNodeId = null;
  category.secondaryCategoryNodeId = null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  if (columnKey === storeCategoryColumnKey) {
    const salesChannelId = selectedSalesChannelId.value;
    if (!salesChannelId) return;
    if (!value) {
      clearStoreCategorySelection(row, salesChannelId);
      return;
    }
    const category = ensureStoreCategorySelection(row, salesChannelId);
    if (typeof value === 'object') {
      const primaryRemoteId = value.primaryRemoteId ?? null;
      const secondaryRemoteId = value.secondaryRemoteId ?? null;
      category.primaryRemoteId = primaryRemoteId;
      category.secondaryRemoteId = primaryRemoteId ? secondaryRemoteId : null;
      category.primaryPath = value.primaryPath ?? (primaryRemoteId ? buildStoreCategoryPath(primaryRemoteId, salesChannelId) : null) ?? category.primaryPath;
      category.secondaryPath =
        value.secondaryPath ??
        (category.secondaryRemoteId ? buildStoreCategoryPath(category.secondaryRemoteId, salesChannelId) : null) ??
        category.secondaryPath;
      category.primaryCategoryNodeId = value.primaryCategoryNodeId ?? category.primaryCategoryNodeId;
      category.secondaryCategoryNodeId = value.secondaryCategoryNodeId ?? category.secondaryCategoryNodeId;
      return;
    }

    const primaryRemoteId = String(value);
    const node = storeCategoryMapBySalesChannel.value[salesChannelId]?.[primaryRemoteId] || null;
    category.primaryRemoteId = primaryRemoteId;
    category.secondaryRemoteId = null;
    category.primaryPath = node ? (node.fullPath || node.name || primaryRemoteId) : primaryRemoteId;
    category.secondaryPath = null;
    category.primaryCategoryNodeId = node?.id || null;
    category.secondaryCategoryNodeId = null;
    return;
  }

  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return;

  if (!value) {
    clearCategorySelection(row, viewId);
    return;
  }

  const category = ensureCategorySelection(row, viewId);
  if (typeof value === 'object') {
    const remoteId = value.remoteId ?? null;
    const secondaryCategoryId = value.secondaryCategoryId ?? null;
    category.remoteId = remoteId;
    category.secondaryCategoryId = remoteId ? secondaryCategoryId : null;
    category.path =
      value.path ??
      (remoteId ? buildCategoryPath(remoteId, viewId) : null) ??
      category.path;
    category.secondaryPath =
      value.secondaryPath ??
      (category.secondaryCategoryId ? buildCategoryPath(category.secondaryCategoryId, viewId) : null) ??
      category.secondaryPath;
    return;
  }

  const remoteId = String(value);
  const node = categoryMapByView.value[viewId]?.[remoteId] || null;
  category.remoteId = remoteId;
  category.secondaryCategoryId = null;
  category.path = node ? (node.fullName || node.name || remoteId) : remoteId;
  category.secondaryPath = null;
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  const clonedValue = value && typeof value === 'object' ? { ...(value as Record<string, any>) } : value;
  setMatrixCellValue(toRow, columnKey, clonedValue ?? null);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  if (columnKey === storeCategoryColumnKey) {
    const salesChannelId = selectedSalesChannelId.value;
    if (!row || !salesChannelId) return;
    clearStoreCategorySelection(row, salesChannelId);
    return;
  }
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!row || !viewId) return;
  clearCategorySelection(row, viewId);
};

const ensureCategoryMapForView = async (
  viewId: string,
  remoteIds: string[],
  policy: FetchPolicy,
) => {
  const view = viewById.value[viewId];
  if (!view?.defaultCategoryTreeId || !remoteIds.length) return;
  const map = { ...(categoryMapByView.value[viewId] || {}) };
  const pending = new Set<string>(remoteIds.filter((id) => id && !map[id]));
  const processed = new Set<string>(Object.keys(map));

  while (pending.size) {
    const batch = Array.from(pending).slice(0, 50);
    batch.forEach((id) => pending.delete(id));
    const { data } = await apolloClient.query({
      query: ebayCategoriesQuery,
      variables: {
        first: batch.length,
        filter: {
          marketplaceDefaultTreeId: { exact: view.defaultCategoryTreeId },
          remoteId: { inList: batch },
        },
      },
      fetchPolicy: policy,
    });
    const nodes = mapCategoriesConnection(data?.ebayCategories);
    nodes.forEach((node) => {
      map[node.remoteId] = node;
      processed.add(node.remoteId);
    });
    nodes.forEach((node) => {
      const parentId = node.parentNode?.remoteId;
      if (parentId && !map[parentId] && !processed.has(parentId)) {
        pending.add(parentId);
      }
    });
  }

  categoryMapByView.value = {
    ...categoryMapByView.value,
    [viewId]: map,
  };
};

const ensureStoreCategoryMapForSalesChannel = async (
  salesChannelId: string,
  remoteIds: string[],
  policy: FetchPolicy,
) => {
  if (!salesChannelId || !remoteIds.length) return;
  const map = { ...(storeCategoryMapBySalesChannel.value[salesChannelId] || {}) };
  const pendingIds = remoteIds.filter((id) => id && !map[id]);
  while (pendingIds.length) {
    const batch = pendingIds.splice(0, 50);
    const { data } = await apolloClient.query({
      query: ebayStoreCategoriesQuery,
      variables: {
        first: batch.length,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          remoteId: { inList: batch },
        },
      },
      fetchPolicy: policy,
    });
    const nodes = mapStoreCategoriesConnection(data?.ebayStoreCategories);
    nodes.forEach((node) => {
      map[node.remoteId] = node;
    });
  }

  storeCategoryMapBySalesChannel.value = {
    ...storeCategoryMapBySalesChannel.value,
    [salesChannelId]: map,
  };
};

const fetchCategoryDetails = async (
  remoteId: string,
  viewId: string,
  policy: FetchPolicy,
) => {
  const view = viewById.value[viewId];
  if (!view?.defaultCategoryTreeId) return null;
  try {
    const { data } = await apolloClient.query({
      query: ebayCategoriesQuery,
      variables: {
        first: 1,
        filter: {
          marketplaceDefaultTreeId: { exact: view.defaultCategoryTreeId },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: policy,
    });
    const node = data?.ebayCategories?.edges?.[0]?.node;
    return node ? normalizeCategoryNode(node) : null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const fetchStoreCategoryDetails = async (
  remoteId: string,
  salesChannelId: string,
  policy: FetchPolicy,
) => {
  if (!salesChannelId || !remoteId) return null;
  try {
    const { data } = await apolloClient.query({
      query: ebayStoreCategoriesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: policy,
    });
    const node = data?.ebayStoreCategories?.edges?.[0]?.node;
    return node ? normalizeStoreCategoryNode(node) : null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const fetchEbayViews = async () => {
  try {
    const { data } = await apolloClient.query({
      query: ebayChannelViewsQuery,
      fetchPolicy: 'cache-first',
    });
    const list = data?.ebaySalesChannelViews?.edges?.map((edge: any) => edge.node) || [];
    ebayViews.value = list.sort((a: any, b: any) => {
      const aHost = a.salesChannel?.hostname || '';
      const bHost = b.salesChannel?.hostname || '';
      if (aHost !== bHost) {
        return aHost.localeCompare(bHost);
      }
      if (a.isDefault === b.isDefault) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return a.isDefault ? -1 : 1;
    });
  } catch (error) {
    ebayViews.value = [];
    displayApolloError(error);
  }
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  if (!parentProduct.value || !parentProductType.value) {
    return [];
  }
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsWithEbayQuery : configurableVariationsWithEbayQuery;
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
    const variationProduct = node.variation;
    return {
      id: variationProduct.id,
      variation: {
        id: variationProduct.id,
        sku: variationProduct.sku,
        name: variationProduct.name,
        active: Boolean(variationProduct.active),
      },
      categories: {},
      storeCategories: {},
      productRuleValue: null,
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
      query: productsWithEbayQuery,
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
      active: Boolean(node.active),
    },
    categories: {},
    storeCategories: {},
    productRuleValue: null,
  })) as VariationRow[];
};

const fetchProductTypeProperty = async (policy: FetchPolicy) => {
  if (productTypePropertyId.value) {
    return productTypePropertyId.value;
  }
  try {
    const { data } = await apolloClient.query({
      query: propertiesQuerySelector,
      variables: { first: 1, filter: { isProductType: { exact: true } } },
      fetchPolicy: policy,
    });
    const node = data?.properties?.edges?.[0]?.node;
    productTypePropertyId.value = node?.id ?? null;
    productTypePropertyName.value = node?.name ?? null;
    return productTypePropertyId.value;
  } catch (error) {
    displayApolloError(error);
    productTypePropertyId.value = null;
    productTypePropertyName.value = null;
    return null;
  }
};

const fetchProductTypeValues = async (productIds: string[], policy: FetchPolicy) => {
  const valuesByProductId = new Map<string, string | null>();
  if (!productIds.length) {
    return valuesByProductId;
  }
  const propertyId = await fetchProductTypeProperty(policy);
  if (!propertyId) {
    return valuesByProductId;
  }
  const pageSize = 100;
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: productTypePropertyValuesQuery,
      variables: {
        first: pageSize,
        after,
        filter: {
          product: { id: { inList: productIds } },
          property: { id: { exact: propertyId } },
        },
      },
      fetchPolicy: policy,
    });
    const edges = data?.productProperties?.edges ?? [];
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const productId = node?.product?.id;
      if (!productId) return;
      valuesByProductId.set(String(productId), node?.valueSelect?.value ?? null);
    });
    const pageInfo = data?.productProperties?.pageInfo;
    hasNextPage = Boolean(pageInfo?.hasNextPage && pageInfo?.endCursor);
    after = pageInfo?.endCursor ?? null;
  }

  return valuesByProductId;
};

const fetchProductCategories = async (productIds: string[], policy: FetchPolicy) => {
  if (!productIds.length) {
    return new Map<string, Map<string, {
      id: string;
      remoteId: string | null;
      secondaryCategoryId: string | null;
    }>>();
  }
  const { data } = await apolloClient.query({
    query: ebayProductCategoriesWithProductsQuery,
    variables: {
      filter: {
        product: { id: { inList: productIds } },
      },
    },
    fetchPolicy: policy,
  });

  const categoryMap = new Map<string, Map<string, {
    id: string;
    remoteId: string | null;
    secondaryCategoryId: string | null;
  }>>();
  const edges = data?.ebayProductCategories?.edges || [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const productId = node?.product?.id;
    const viewId = node?.view?.id;
    if (!productId || !viewId || !node?.id) return;
    const productMap = categoryMap.get(String(productId)) || new Map<string, {
      id: string;
      remoteId: string | null;
      secondaryCategoryId: string | null;
    }>();
    productMap.set(String(viewId), {
      id: String(node.id),
      remoteId: node?.remoteId ? String(node.remoteId) : null,
      secondaryCategoryId: node?.secondaryCategoryId ? String(node.secondaryCategoryId) : null,
    });
    categoryMap.set(String(productId), productMap);
  });
  return categoryMap;
};

const fetchProductStoreCategories = async (productIds: string[], policy: FetchPolicy) => {
  if (!productIds.length) {
    return new Map<string, Map<string, {
      id: string;
      primaryRemoteId: string | null;
      secondaryRemoteId: string | null;
      primaryCategoryNodeId: string | null;
      secondaryCategoryNodeId: string | null;
    }>>();
  }

  const { data } = await apolloClient.query({
    query: ebayProductStoreCategoriesWithProductsQuery,
    variables: {
      filter: {
        product: { id: { inList: productIds } },
      },
    },
    fetchPolicy: policy,
  });

  const categoryMap = new Map<string, Map<string, {
    id: string;
    primaryRemoteId: string | null;
    secondaryRemoteId: string | null;
    primaryCategoryNodeId: string | null;
    secondaryCategoryNodeId: string | null;
  }>>();
  const edges = data?.ebayProductStoreCategories?.edges || [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const productId = node?.product?.id;
    const salesChannelId = node?.primaryStoreCategory?.salesChannel?.id;
    if (!productId || !salesChannelId || !node?.id) return;
    const productMap = categoryMap.get(String(productId)) || new Map<string, {
      id: string;
      primaryRemoteId: string | null;
      secondaryRemoteId: string | null;
      primaryCategoryNodeId: string | null;
      secondaryCategoryNodeId: string | null;
    }>();
    productMap.set(String(salesChannelId), {
      id: String(node.id),
      primaryRemoteId: node?.primaryStoreCategory?.remoteId ? String(node.primaryStoreCategory.remoteId) : null,
      secondaryRemoteId: node?.secondaryStoreCategory?.remoteId ? String(node.secondaryStoreCategory.remoteId) : null,
      primaryCategoryNodeId: node?.primaryStoreCategory?.id ? String(node.primaryStoreCategory.id) : null,
      secondaryCategoryNodeId: node?.secondaryStoreCategory?.id ? String(node.secondaryStoreCategory.id) : null,
    });
    categoryMap.set(String(productId), productMap);
  });

  return categoryMap;
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    if (!ebayViews.value.length) {
      await fetchEbayViews();
    }
    let variationRows: VariationRow[] = [];
    if (hasProductIds.value) {
      variationRows = await fetchProducts(policy);
    } else if (props.product) {
      variationRows = await fetchVariations(policy);
    }

    const productIds = variationRows.map((row) => row.variation.id).filter(Boolean);
    const [categoriesByProductId, storeCategoriesByProductId, productTypeValuesByProductId] = await Promise.all([
      fetchProductCategories(productIds, policy),
      fetchProductStoreCategories(productIds, policy),
      fetchProductTypeValues(productIds, policy),
    ]);
    const remoteIdsByView: Record<string, Set<string>> = {};
    const remoteIdsBySalesChannel: Record<string, Set<string>> = {};

    categoriesByProductId.forEach((viewMap) => {
      viewMap.forEach((entry, viewId) => {
        if (!remoteIdsByView[viewId]) {
          remoteIdsByView[viewId] = new Set<string>();
        }
        if (entry.remoteId) {
          remoteIdsByView[viewId].add(entry.remoteId);
        }
        if (entry.secondaryCategoryId) {
          remoteIdsByView[viewId].add(entry.secondaryCategoryId);
        }
      });
    });

    storeCategoriesByProductId.forEach((salesChannelMap) => {
      salesChannelMap.forEach((entry, salesChannelId) => {
        if (!remoteIdsBySalesChannel[salesChannelId]) {
          remoteIdsBySalesChannel[salesChannelId] = new Set<string>();
        }
        if (entry.primaryRemoteId) {
          remoteIdsBySalesChannel[salesChannelId].add(entry.primaryRemoteId);
        }
        if (entry.secondaryRemoteId) {
          remoteIdsBySalesChannel[salesChannelId].add(entry.secondaryRemoteId);
        }
      });
    });

    categoryMapByView.value = {};
    storeCategoryMapBySalesChannel.value = {};
    await Promise.all(
      Object.entries(remoteIdsByView).map(([viewId, ids]) =>
        ensureCategoryMapForView(viewId, Array.from(ids), policy),
      ),
    );
    await Promise.all(
      Object.entries(remoteIdsBySalesChannel).map(([salesChannelId, ids]) =>
        ensureStoreCategoryMapForSalesChannel(salesChannelId, Array.from(ids), policy),
      ),
    );

    const rowsWithCategories = variationRows.map((row) => {
      const productMap = categoriesByProductId.get(row.variation.id) || new Map();
      const productStoreMap = storeCategoriesByProductId.get(row.variation.id) || new Map();
      const categories: Record<string, CategorySelection> = {};
      const storeCategories: Record<string, StoreCategorySelection> = {};
      ebayViews.value.forEach((view) => {
        const entry = productMap.get(view.id) || null;
        const remoteId = entry?.remoteId ?? null;
        const secondaryCategoryId = entry?.secondaryCategoryId ?? null;
        const map = categoryMapByView.value[view.id] || {};
        const node = remoteId ? map[remoteId] : null;
        const secondaryNode = secondaryCategoryId ? map[secondaryCategoryId] : null;
        categories[view.id] = {
          productCategoryId: entry?.id ?? null,
          remoteId,
          secondaryCategoryId,
          path: remoteId ? (node ? (node.fullName || node.name || remoteId) : remoteId) : null,
          secondaryPath: secondaryCategoryId
            ? (secondaryNode ? (secondaryNode.fullName || secondaryNode.name || secondaryCategoryId) : secondaryCategoryId)
            : null,
        };
      });

      const salesChannelIds = new Set<string>(salesChannelOptions.value.map((option) => option.id));
      productStoreMap.forEach((_entry, salesChannelId) => salesChannelIds.add(salesChannelId));
      Array.from(salesChannelIds).forEach((salesChannelId) => {
        const entry = productStoreMap.get(salesChannelId) || null;
        const primaryRemoteId = entry?.primaryRemoteId ?? null;
        const secondaryRemoteId = entry?.secondaryRemoteId ?? null;
        const map = storeCategoryMapBySalesChannel.value[salesChannelId] || {};
        const primaryNode = primaryRemoteId ? map[primaryRemoteId] : null;
        const secondaryNode = secondaryRemoteId ? map[secondaryRemoteId] : null;
        storeCategories[salesChannelId] = {
          productStoreCategoryId: entry?.id ?? null,
          primaryRemoteId,
          secondaryRemoteId,
          primaryPath: primaryRemoteId ? (primaryNode ? (primaryNode.fullPath || primaryNode.name || primaryRemoteId) : primaryRemoteId) : null,
          secondaryPath: secondaryRemoteId
            ? (secondaryNode ? (secondaryNode.fullPath || secondaryNode.name || secondaryRemoteId) : secondaryRemoteId)
            : null,
          primaryCategoryNodeId: entry?.primaryCategoryNodeId ?? (primaryNode?.id || null),
          secondaryCategoryNodeId: entry?.secondaryCategoryNodeId ?? (secondaryNode?.id || null),
        };
      });

      return {
        ...row,
        categories,
        storeCategories,
        productRuleValue: productTypeValuesByProductId.get(row.variation.id) ?? null,
      };
    });

    variations.value = rowsWithCategories;
    originalVariations.value = JSON.parse(JSON.stringify(rowsWithCategories));
    matrixRef.value?.resetHistory(rowsWithCategories);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!hasChanges.value || saving.value) return;
  if (!ebayViews.value.length) {
    Toast.error(t('products.products.ebay.noViews'));
    return;
  }
  saving.value = true;
  try {
    const originalMap = new Map<string, VariationRow>();
    originalVariations.value.forEach((row) => {
      originalMap.set(row.id, row);
    });

    for (const row of variations.value) {
      const original = originalMap.get(row.id);
      for (const view of ebayViews.value) {
        const viewId = view.id;
        const current = row.categories[viewId] || createEmptyCategory();
        const originalCategory = original?.categories[viewId] || createEmptyCategory();
        const currentRemoteId = current.remoteId;
        const currentSecondaryCategoryId = current.secondaryCategoryId;
        const originalRemoteId = originalCategory.remoteId;
        const originalSecondaryCategoryId = originalCategory.secondaryCategoryId;
        const productCategoryId = current.productCategoryId;
        const originalCategoryId = originalCategory.productCategoryId;

        if (
          currentRemoteId === originalRemoteId &&
          currentSecondaryCategoryId === originalSecondaryCategoryId &&
          productCategoryId === originalCategoryId
        ) {
          continue;
        }

        if (!currentRemoteId) {
          if (productCategoryId) {
            await apolloClient.mutate({
              mutation: deleteEbayProductCategoryMutation,
              variables: { data: { id: productCategoryId } },
            });
            current.productCategoryId = null;
          }
          continue;
        }

        if (productCategoryId) {
          await apolloClient.mutate({
            mutation: updateEbayProductCategoryMutation,
            variables: {
              data: {
                id: productCategoryId,
                remoteId: currentRemoteId,
                secondaryCategoryId: currentSecondaryCategoryId || null,
              },
            },
          });
        } else if (view?.salesChannel?.id) {
          const { data } = await apolloClient.mutate({
            mutation: createEbayProductCategoryMutation,
            variables: {
              data: {
                product: { id: row.variation.id },
                salesChannel: { id: view.salesChannel.id },
                view: { id: viewId },
                remoteId: currentRemoteId,
                secondaryCategoryId: currentSecondaryCategoryId || null,
              },
            },
          });
          current.productCategoryId = data?.createEbayProductCategory?.id || null;
        }
      }

      const storeSalesChannelIds = new Set([
        ...Object.keys(row.storeCategories || {}),
        ...Object.keys(original?.storeCategories || {}),
      ]);
      for (const salesChannelId of Array.from(storeSalesChannelIds)) {
        const current = row.storeCategories[salesChannelId] || createEmptyStoreCategory();
        const originalStoreCategory = original?.storeCategories[salesChannelId] || createEmptyStoreCategory();

        if (
          current.productStoreCategoryId === originalStoreCategory.productStoreCategoryId &&
          current.primaryRemoteId === originalStoreCategory.primaryRemoteId &&
          current.secondaryRemoteId === originalStoreCategory.secondaryRemoteId
        ) {
          continue;
        }

        if (!current.primaryRemoteId) {
          if (current.productStoreCategoryId) {
            await apolloClient.mutate({
              mutation: deleteEbayProductStoreCategoryMutation,
              variables: { data: { id: current.productStoreCategoryId } },
            });
            current.productStoreCategoryId = null;
          }
          current.secondaryRemoteId = null;
          current.primaryPath = null;
          current.secondaryPath = null;
          current.primaryCategoryNodeId = null;
          current.secondaryCategoryNodeId = null;
          continue;
        }

        if (
          current.primaryRemoteId &&
          current.secondaryRemoteId &&
          current.primaryRemoteId === current.secondaryRemoteId
        ) {
          Toast.error(duplicateCategoryErrorText.value);
          continue;
        }

        let primaryCategoryNodeId = current.primaryCategoryNodeId;
        if (!primaryCategoryNodeId && current.primaryRemoteId) {
          const primaryNode = await fetchStoreCategoryDetails(current.primaryRemoteId, salesChannelId, 'network-only');
          primaryCategoryNodeId = primaryNode?.id || null;
          current.primaryPath = primaryNode?.fullPath || current.primaryPath;
          current.primaryCategoryNodeId = primaryCategoryNodeId;
          if (primaryNode) {
            storeCategoryMapBySalesChannel.value = {
              ...storeCategoryMapBySalesChannel.value,
              [salesChannelId]: {
                ...(storeCategoryMapBySalesChannel.value[salesChannelId] || {}),
                [primaryNode.remoteId]: primaryNode,
              },
            };
          }
        }
        if (!primaryCategoryNodeId) {
          Toast.error(t('products.products.variations.ebay.toast.storeCategoryNotAvailable', { id: current.primaryRemoteId }));
          continue;
        }

        let secondaryCategoryNodeId = current.secondaryCategoryNodeId;
        if (current.secondaryRemoteId && !secondaryCategoryNodeId) {
          const secondaryNode = await fetchStoreCategoryDetails(current.secondaryRemoteId, salesChannelId, 'network-only');
          secondaryCategoryNodeId = secondaryNode?.id || null;
          current.secondaryPath = secondaryNode?.fullPath || current.secondaryPath;
          current.secondaryCategoryNodeId = secondaryCategoryNodeId;
          if (secondaryNode) {
            storeCategoryMapBySalesChannel.value = {
              ...storeCategoryMapBySalesChannel.value,
              [salesChannelId]: {
                ...(storeCategoryMapBySalesChannel.value[salesChannelId] || {}),
                [secondaryNode.remoteId]: secondaryNode,
              },
            };
          }
        }

        if (current.productStoreCategoryId) {
          await apolloClient.mutate({
            mutation: updateEbayProductStoreCategoryMutation,
            variables: {
              data: {
                id: current.productStoreCategoryId,
                primaryStoreCategory: { id: primaryCategoryNodeId },
                secondaryStoreCategory: secondaryCategoryNodeId ? { id: secondaryCategoryNodeId } : null,
              },
            },
          });
        } else {
          const { data } = await apolloClient.mutate({
            mutation: createEbayProductStoreCategoryMutation,
            variables: {
              data: {
                product: { id: row.variation.id },
                salesChannel: { id: salesChannelId },
                primaryStoreCategory: { id: primaryCategoryNodeId },
                secondaryStoreCategory: secondaryCategoryNodeId ? { id: secondaryCategoryNodeId } : null,
              },
            },
          });
          current.productStoreCategoryId = data?.createEbayProductStoreCategory?.id || null;
        }
      }
    }

    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    await loadData('network-only');
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const createFallbackNode = (remoteId: string, path: string | null) => ({
  remoteId,
  name: path || remoteId,
  fullName: path || remoteId,
  hasChildren: false,
  parentNode: null,
  configuratorProperties: [],
} as EbayCategoryNode);

const resolveNodeFromSelection = async (
  viewId: string,
  remoteId: string | null,
  path: string | null,
) => {
  if (!remoteId) return null;
  const map = categoryMapByView.value[viewId] || {};
  if (map[remoteId]) {
    return map[remoteId];
  }
  const fetched = await fetchCategoryDetails(remoteId, viewId, 'cache-first');
  if (!fetched) {
    return createFallbackNode(remoteId, path);
  }
  categoryMapByView.value = {
    ...categoryMapByView.value,
    [viewId]: {
      ...map,
      [remoteId]: fetched,
    },
  };
  return fetched;
};

const openSelectionModal = async (rowIndex: number, viewId: string | null) => {
  if (!viewId) return;
  const row = variations.value[rowIndex];
  const selection = row?.categories[viewId] || null;
  selectionModal.rowIndex = rowIndex;
  selectionModal.viewId = viewId;
  modalMainNode.value = await resolveNodeFromSelection(viewId, selection?.remoteId || null, selection?.path || null);
  modalSecondaryNode.value = await resolveNodeFromSelection(
    viewId,
    selection?.secondaryCategoryId || null,
    selection?.secondaryPath || null,
  );
  modalOriginalMainNode.value = modalMainNode.value;
  modalOriginalSecondaryNode.value = modalSecondaryNode.value;
  modalSlotErrors.value = { main: null, secondary: null };
  selectionModal.target = resolveDefaultCategoryTarget(
    modalMainNode.value?.remoteId || null,
    modalSecondaryNode.value?.remoteId || null,
  );
  selectionModal.visible = true;
};

const closeSelectionModal = () => {
  selectionModal.visible = false;
  selectionModal.rowIndex = -1;
  selectionModal.viewId = null;
  selectionModal.target = 'main';
  modalMainNode.value = null;
  modalSecondaryNode.value = null;
  modalOriginalMainNode.value = null;
  modalOriginalSecondaryNode.value = null;
  modalSlotErrors.value = { main: null, secondary: null };
};

const setModalTarget = (target: EbayCategoryTarget) => {
  modalSlotErrors.value = { main: null, secondary: null };
  if (target === 'secondary' && !modalMainNode.value?.remoteId) {
    return;
  }
  selectionModal.target = target;
};

const clearModalSecondary = () => {
  modalSlotErrors.value = { main: null, secondary: null };
  modalSecondaryNode.value = null;
};

const handleModalSelection = (payload: { node: EbayCategoryNode; path: EbayCategoryNode[] }) => {
  if (!selectionModal.viewId) return;
  modalSlotErrors.value = { main: null, secondary: null };
  const selectedNode = {
    ...payload.node,
    fullName: payload.node.fullName || payload.path.map((node) => node.name).filter(Boolean).join(' > '),
  };

  categoryMapByView.value = {
    ...categoryMapByView.value,
    [selectionModal.viewId]: {
      ...(categoryMapByView.value[selectionModal.viewId] || {}),
      [payload.node.remoteId]: selectedNode,
    },
  };

  if (selectionModal.target === 'secondary') {
    if (!modalMainNode.value?.remoteId) {
      modalMainNode.value = selectedNode;
      selectionModal.target = 'secondary';
      return;
    }
    modalSecondaryNode.value = selectedNode;
    return;
  }

  const hadMainSelection = Boolean(modalMainNode.value?.remoteId);
  const hadSecondarySelection = Boolean(modalSecondaryNode.value?.remoteId);
  modalMainNode.value = selectedNode;
  if (!hadMainSelection && !hadSecondarySelection) {
    selectionModal.target = 'secondary';
  }
};

const applyModalSelection = () => {
  if (selectionModal.rowIndex < 0 || !selectionModal.viewId) return;
  if (modalHasDuplicateCategorySelection.value) {
    modalSlotErrors.value = {
      main: duplicateCategoryErrorText.value,
      secondary: duplicateCategoryErrorText.value,
    };
    return;
  }
  const row = variations.value[selectionModal.rowIndex];
  if (!row) return;
  const category = ensureCategorySelection(row, selectionModal.viewId);
  category.remoteId = modalMainNode.value?.remoteId || null;
  category.path = modalMainNode.value?.fullName || modalMainNode.value?.name || modalMainNode.value?.remoteId || null;
  category.secondaryCategoryId = modalMainNode.value?.remoteId ? (modalSecondaryNode.value?.remoteId || null) : null;
  category.secondaryPath = category.secondaryCategoryId
    ? (modalSecondaryNode.value?.fullName || modalSecondaryNode.value?.name || modalSecondaryNode.value?.remoteId || null)
    : null;
  closeSelectionModal();
};

const openPreview = async (rowIndex: number, viewId: string | null) => {
  if (!viewId) return;
  const row = variations.value[rowIndex];
  const category = row?.categories[viewId];
  if (!category?.remoteId) return;
  previewRow.value = row;
  previewMainNode.value = await resolveNodeFromSelection(viewId, category.remoteId, category.path);
  previewSecondaryNode.value = await resolveNodeFromSelection(
    viewId,
    category.secondaryCategoryId,
    category.secondaryPath,
  );
  previewVisible.value = true;
};

const closePreview = () => {
  previewVisible.value = false;
  previewMainNode.value = null;
  previewSecondaryNode.value = null;
  previewRow.value = null;
};

const createFallbackStoreNode = (remoteId: string, fullPath: string | null, salesChannelId: string) => ({
  id: '',
  remoteId,
  name: fullPath || remoteId,
  fullPath: fullPath || `/${remoteId}`,
  order: 0,
  level: 1,
  isLeaf: true,
  parent: null,
  salesChannel: salesChannelId ? { id: salesChannelId } : null,
} as EbayStoreCategoryNode);

const resolveStoreNodeFromSelection = async (
  salesChannelId: string,
  remoteId: string | null,
  fullPath: string | null,
) => {
  if (!remoteId) return null;
  const map = storeCategoryMapBySalesChannel.value[salesChannelId] || {};
  if (map[remoteId]) {
    return map[remoteId];
  }
  const fetched = await fetchStoreCategoryDetails(remoteId, salesChannelId, 'cache-first');
  if (!fetched) {
    return createFallbackStoreNode(remoteId, fullPath, salesChannelId);
  }
  storeCategoryMapBySalesChannel.value = {
    ...storeCategoryMapBySalesChannel.value,
    [salesChannelId]: {
      ...map,
      [remoteId]: fetched,
    },
  };
  return fetched;
};

const openStoreSelectionModal = async (rowIndex: number) => {
  if (!selectedSalesChannelId.value) return;
  const salesChannelId = selectedSalesChannelId.value;
  const row = variations.value[rowIndex];
  const selection = row?.storeCategories[salesChannelId] || null;
  storeSelectionModal.rowIndex = rowIndex;
  storeSelectionModal.salesChannelId = salesChannelId;
  modalStoreMainNode.value = await resolveStoreNodeFromSelection(
    salesChannelId,
    selection?.primaryRemoteId || null,
    selection?.primaryPath || null,
  );
  modalStoreSecondaryNode.value = await resolveStoreNodeFromSelection(
    salesChannelId,
    selection?.secondaryRemoteId || null,
    selection?.secondaryPath || null,
  );
  modalStoreOriginalMainNode.value = modalStoreMainNode.value;
  modalStoreOriginalSecondaryNode.value = modalStoreSecondaryNode.value;
  modalStoreSlotErrors.value = { main: null, secondary: null };
  storeSelectionModal.target = resolveDefaultCategoryTarget(
    modalStoreMainNode.value?.remoteId || null,
    modalStoreSecondaryNode.value?.remoteId || null,
  );
  storeSelectionModal.visible = true;
};

const closeStoreSelectionModal = () => {
  storeSelectionModal.visible = false;
  storeSelectionModal.rowIndex = -1;
  storeSelectionModal.salesChannelId = null;
  storeSelectionModal.target = 'main';
  modalStoreMainNode.value = null;
  modalStoreSecondaryNode.value = null;
  modalStoreOriginalMainNode.value = null;
  modalStoreOriginalSecondaryNode.value = null;
  modalStoreSlotErrors.value = { main: null, secondary: null };
};

const setStoreModalTarget = (target: EbayCategoryTarget) => {
  modalStoreSlotErrors.value = { main: null, secondary: null };
  if (target === 'secondary' && !modalStoreMainNode.value?.remoteId) {
    return;
  }
  storeSelectionModal.target = target;
};

const clearStoreModalSecondary = () => {
  modalStoreSlotErrors.value = { main: null, secondary: null };
  modalStoreSecondaryNode.value = null;
};

const handleStoreModalSelection = (payload: { node: EbayStoreCategoryNode; path: EbayStoreCategoryNode[] }) => {
  const salesChannelId = storeSelectionModal.salesChannelId;
  if (!salesChannelId) return;
  modalStoreSlotErrors.value = { main: null, secondary: null };
  const selectedNode = {
    ...payload.node,
    fullPath: payload.node.fullPath || `/${payload.path.map((node) => node.name).filter(Boolean).join('/')}`,
  };

  storeCategoryMapBySalesChannel.value = {
    ...storeCategoryMapBySalesChannel.value,
    [salesChannelId]: {
      ...(storeCategoryMapBySalesChannel.value[salesChannelId] || {}),
      [payload.node.remoteId]: selectedNode,
    },
  };

  if (storeSelectionModal.target === 'secondary') {
    if (!modalStoreMainNode.value?.remoteId) {
      modalStoreMainNode.value = selectedNode;
      storeSelectionModal.target = 'secondary';
      return;
    }
    modalStoreSecondaryNode.value = selectedNode;
    return;
  }

  const hadMainSelection = Boolean(modalStoreMainNode.value?.remoteId);
  const hadSecondarySelection = Boolean(modalStoreSecondaryNode.value?.remoteId);
  modalStoreMainNode.value = selectedNode;
  if (!hadMainSelection && !hadSecondarySelection) {
    storeSelectionModal.target = 'secondary';
  }
};

const applyStoreModalSelection = () => {
  if (storeSelectionModal.rowIndex < 0 || !storeSelectionModal.salesChannelId) return;
  if (modalStoreHasDuplicateCategorySelection.value) {
    modalStoreSlotErrors.value = {
      main: duplicateCategoryErrorText.value,
      secondary: duplicateCategoryErrorText.value,
    };
    return;
  }
  const row = variations.value[storeSelectionModal.rowIndex];
  if (!row) return;
  const category = ensureStoreCategorySelection(row, storeSelectionModal.salesChannelId);
  category.primaryRemoteId = modalStoreMainNode.value?.remoteId || null;
  category.primaryPath = modalStoreMainNode.value?.fullPath || modalStoreMainNode.value?.name || modalStoreMainNode.value?.remoteId || null;
  category.secondaryRemoteId = category.primaryRemoteId ? (modalStoreSecondaryNode.value?.remoteId || null) : null;
  category.secondaryPath = category.secondaryRemoteId
    ? (modalStoreSecondaryNode.value?.fullPath || modalStoreSecondaryNode.value?.name || modalStoreSecondaryNode.value?.remoteId || null)
    : null;
  category.primaryCategoryNodeId = modalStoreMainNode.value?.id || null;
  category.secondaryCategoryNodeId = category.secondaryRemoteId ? (modalStoreSecondaryNode.value?.id || null) : null;
  closeStoreSelectionModal();
};

const openStorePreview = async (rowIndex: number) => {
  if (!selectedSalesChannelId.value) return;
  const salesChannelId = selectedSalesChannelId.value;
  const row = variations.value[rowIndex];
  const category = row?.storeCategories[salesChannelId];
  if (!category?.primaryRemoteId) return;
  previewStoreRow.value = row;
  previewStoreMainNode.value = await resolveStoreNodeFromSelection(salesChannelId, category.primaryRemoteId, category.primaryPath);
  previewStoreSecondaryNode.value = await resolveStoreNodeFromSelection(
    salesChannelId,
    category.secondaryRemoteId,
    category.secondaryPath,
  );
  storePreviewVisible.value = true;
};

const closeStorePreview = () => {
  storePreviewVisible.value = false;
  previewStoreMainNode.value = null;
  previewStoreSecondaryNode.value = null;
  previewStoreRow.value = null;
};

watch(
  salesChannelOptions,
  (options) => {
    if (!options.length) {
      selectedSalesChannelId.value = null;
      return;
    }
    if (selectedSalesChannelId.value && options.some((opt) => opt.id === selectedSalesChannelId.value)) {
      return;
    }
    selectedSalesChannelId.value = options[0].id;
  },
  { immediate: true },
);

watch(
  selectedSalesChannelId,
  () => {
    closeStoreSelectionModal();
    closeStorePreview();
  },
);

onMounted(async () => {
  await fetchEbayViews();
  await loadData('network-only');
});

watch(
  () => [props.product?.id ?? null, props.productIds.join(',')],
  async () => {
    await loadData('network-only');
  },
);

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div class="relative w-full min-w-0">
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
      @save="save"
    >
      <template #filters>
        <div class="flex flex-wrap items-center gap-3">
          <Selector
            v-if="salesChannelOptions.length"
            v-model="selectedSalesChannelId"
            :options="salesChannelOptions"
            class="w-64"
            :placeholder="t('products.products.variations.ebay.selectors.salesChannel')"
            :removable="false"
            labelBy="name"
            valueBy="id"
            filterable
          />
          <div
            v-else
            class="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            {{ t('products.products.ebay.noViews') }}
          </div>
        </div>
      </template>
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === productRuleColumnKey">
          <span class="block truncate" :title="row.productRuleValue || ''">
            {{ row.productRuleValue || '-' }}
          </span>
        </template>
        <template v-else-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'ebay' } }"
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
        <template v-else-if="column.key === storeCategoryColumnKey">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {{ t('products.products.ebay.selectionSlots.mainTitle') }}
              </div>
              <div
                class="text-sm font-medium whitespace-normal break-words"
                :title="getStoreCategoryDisplayPath(row, 'main') || t('products.products.ebay.noSelection')"
              >
                {{ getStoreCategoryDisplayPath(row, 'main') || t('products.products.ebay.noSelection') }}
              </div>
              <div v-if="getStoreCategorySelection(row)?.primaryRemoteId" class="text-xs text-gray-500">
                {{ t('products.products.variations.ebay.labels.categoryId', { id: getStoreCategorySelection(row)?.primaryRemoteId }) }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide mt-2 mb-1">
                {{ t('products.products.ebay.selectionSlots.secondaryTitle') }}
              </div>
              <div
                class="text-sm whitespace-normal break-words"
                :title="getStoreCategoryDisplayPath(row, 'secondary') || t('products.products.ebay.noSelection')"
              >
                {{ getStoreCategoryDisplayPath(row, 'secondary') || t('products.products.ebay.noSelection') }}
              </div>
              <div v-if="getStoreCategorySelection(row)?.secondaryRemoteId" class="text-xs text-gray-500">
                {{ t('products.products.variations.ebay.labels.categoryId', { id: getStoreCategorySelection(row)?.secondaryRemoteId }) }}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                class="p-2 text-primary hover:bg-blue-50 rounded"
                :title="t('products.products.variations.ebay.actions.setStoreCategory')"
                :aria-label="t('products.products.variations.ebay.actions.setStoreCategory')"
                :disabled="saving || !selectedSalesChannelId"
                @click="openStoreSelectionModal(rowIndex)"
              >
                <Icon name="edit" class="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                v-if="getStoreCategorySelection(row)?.primaryRemoteId || getStoreCategorySelection(row)?.secondaryRemoteId"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded"
                :title="t('products.products.variations.ebay.actions.previewStoreCategory')"
                :aria-label="t('products.products.variations.ebay.actions.previewStoreCategory')"
                :disabled="saving || !selectedSalesChannelId"
                @click="openStorePreview(rowIndex)"
              >
                <Icon name="eye" class="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </template>
        <template v-else-if="isCategoryColumn(column.key)">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="text-xs text-gray-500 uppercase tracking-wide mb-1">
                {{ t('products.products.ebay.selectionSlots.mainTitle') }}
              </div>
              <div
                class="text-sm font-medium whitespace-normal break-words"
                :title="getCategoryDisplayPath(row, column.key, 'main') || t('products.products.ebay.noSelection')"
              >
                {{ getCategoryDisplayPath(row, column.key, 'main') || t('products.products.ebay.noSelection') }}
              </div>
              <div v-if="getCategorySelection(row, column.key)?.remoteId" class="text-xs text-gray-500">
                {{ t('products.products.variations.ebay.labels.categoryId', { id: getCategorySelection(row, column.key)?.remoteId }) }}
              </div>
              <div class="text-xs text-gray-500 uppercase tracking-wide mt-2 mb-1">
                {{ t('products.products.ebay.selectionSlots.secondaryTitle') }}
              </div>
              <div
                class="text-sm whitespace-normal break-words"
                :title="getCategoryDisplayPath(row, column.key, 'secondary') || t('products.products.ebay.noSelection')"
              >
                {{ getCategoryDisplayPath(row, column.key, 'secondary') || t('products.products.ebay.noSelection') }}
              </div>
              <div v-if="getCategorySelection(row, column.key)?.secondaryCategoryId" class="text-xs text-gray-500">
                {{ t('products.products.variations.ebay.labels.categoryId', { id: getCategorySelection(row, column.key)?.secondaryCategoryId }) }}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                class="p-2 text-primary hover:bg-blue-50 rounded"
                :title="t('products.products.variations.ebay.actions.set')"
                :aria-label="t('products.products.variations.ebay.actions.set')"
                :disabled="saving"
                @click="openSelectionModal(rowIndex, getViewIdFromColumnKey(column.key))"
              >
                <Icon name="edit" class="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                v-if="getCategorySelection(row, column.key)?.remoteId || getCategorySelection(row, column.key)?.secondaryCategoryId"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded"
                :title="t('products.products.variations.ebay.actions.preview')"
                :aria-label="t('products.products.variations.ebay.actions.preview')"
                :disabled="saving"
                @click="openPreview(rowIndex, getViewIdFromColumnKey(column.key))"
              >
                <Icon name="eye" class="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </template>
      </template>
    </MatrixEditor>

    <Modal v-model="selectionModal.visible" @closed="closeSelectionModal">
      <Card class="modal-content w-11/12 max-w-6xl max-h-[85vh] flex flex-col min-h-0 overflow-hidden">
        <div class="mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.variations.ebay.modal.title') }}
          </h3>
          <div v-if="selectionModalView?.name || selectionModalView?.salesChannel?.hostname" class="text-xs text-gray-500 mt-1">
            <span v-if="selectionModalView?.name">{{ selectionModalView.name }}</span>
            <span v-if="selectionModalView?.name && selectionModalView?.salesChannel?.hostname" class="mx-1">•</span>
            <span v-if="selectionModalView?.salesChannel?.hostname">{{ selectionModalView.salesChannel.hostname }}</span>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <div class="grid gap-4 lg:grid-cols-2 h-full min-h-0">
            <div class="rounded border bg-white p-4 min-h-0 h-full max-h-[65vh] overflow-hidden flex flex-col">
              <EbayCategoryBrowser
                :default-category-tree-id="selectionModalView?.defaultCategoryTreeId || null"
                @selected="handleModalSelection"
              />
            </div>
            <div class="rounded border bg-white p-4 overflow-y-auto min-h-0 h-full max-h-[65vh]">
              <EbayCategoryDualSelectionPreview
                :main-category="modalMainNode"
                :secondary-category="modalSecondaryNode"
                :previous-main-category="modalOriginalMainNode"
                :previous-secondary-category="modalOriginalSecondaryNode"
                :main-error="modalMainError"
                :secondary-error="modalSecondaryError"
                :selected-target="selectionModal.target"
                :secondary-disabled="!modalMainNode?.remoteId"
                @target-change="setModalTarget"
                @clear-secondary="clearModalSecondary"
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            class="btn btn-sm btn-primary"
            :disabled="!modalMainNode?.remoteId"
            @click="applyModalSelection"
          >
            {{ t('shared.button.save') }}
          </Button>
          <Button class="btn btn-sm btn-outline-dark" @click="closeSelectionModal">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
      </Card>
    </Modal>

    <Modal v-model="previewVisible" @closed="closePreview">
      <Card class="modal-content w-4/5 max-w-5xl max-h-[85vh] flex flex-col min-h-0 overflow-hidden">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-xl font-semibold">
              {{ t('products.products.variations.ebay.modal.previewTitle') }}
            </h3>
            <div v-if="previewRow" class="text-xs text-gray-500 mt-1">
              {{ previewRow.variation.sku }}
            </div>
          </div>
          <Button class="btn btn-outline-dark" @click="closePreview">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto max-h-[75vh]">
          <EbayCategoryDualSelectionPreview
            :main-category="previewMainNode"
            :secondary-category="previewSecondaryNode"
            :selected-target="'main'"
            :secondary-disabled="!previewMainNode?.remoteId"
            :read-only="true"
          />
          <div class="mt-4 space-y-3">
            <div class="rounded border bg-white p-3">
              <h6 class="font-semibold text-sm mb-2">
                {{ t('products.products.ebay.selectionSlots.mainTitle') }}
              </h6>
              <EbayCategoryDetails
                v-if="previewMainNode"
                :category="previewMainNode"
              />
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.ebay.noSelection') }}
              </div>
            </div>
            <div class="rounded border bg-white p-3">
              <h6 class="font-semibold text-sm mb-2">
                {{ t('products.products.ebay.selectionSlots.secondaryTitle') }}
              </h6>
              <EbayCategoryDetails
                v-if="previewSecondaryNode"
                :category="previewSecondaryNode"
              />
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.ebay.noSelection') }}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Modal>

    <Modal v-model="storeSelectionModal.visible" @closed="closeStoreSelectionModal">
      <Card class="modal-content w-11/12 max-w-6xl max-h-[85vh] flex flex-col min-h-0 overflow-hidden">
        <div class="mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.variations.ebay.modal.storeTitle') }}
          </h3>
          <div v-if="storeSelectionModalSalesChannel?.name" class="text-xs text-gray-500 mt-1">
            {{ storeSelectionModalSalesChannel.name }}
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <div class="grid gap-4 lg:grid-cols-2 h-full min-h-0">
            <div class="rounded border bg-white p-4 min-h-0 h-full max-h-[65vh] overflow-hidden flex flex-col">
              <EbayStoreCategoryBrowser
                :sales-channel-id="storeSelectionModal.salesChannelId"
                @selected="handleStoreModalSelection"
              />
            </div>
            <div class="rounded border bg-white p-4 overflow-y-auto min-h-0 h-full max-h-[65vh]">
              <EbayCategoryDualSelectionPreview
                :main-category="modalStoreMainNode"
                :secondary-category="modalStoreSecondaryNode"
                :previous-main-category="modalStoreOriginalMainNode"
                :previous-secondary-category="modalStoreOriginalSecondaryNode"
                :main-error="modalStoreMainError"
                :secondary-error="modalStoreSecondaryError"
                :selected-target="storeSelectionModal.target"
                :secondary-disabled="!modalStoreMainNode?.remoteId"
                @target-change="setStoreModalTarget"
                @clear-secondary="clearStoreModalSecondary"
              />
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            class="btn btn-sm btn-primary"
            :disabled="!modalStoreMainNode?.remoteId"
            @click="applyStoreModalSelection"
          >
            {{ t('shared.button.save') }}
          </Button>
          <Button class="btn btn-sm btn-outline-dark" @click="closeStoreSelectionModal">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
      </Card>
    </Modal>

    <Modal v-model="storePreviewVisible" @closed="closeStorePreview">
      <Card class="modal-content w-4/5 max-w-5xl max-h-[85vh] flex flex-col min-h-0 overflow-hidden">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-xl font-semibold">
              {{ t('products.products.variations.ebay.modal.storePreviewTitle') }}
            </h3>
            <div v-if="previewStoreRow" class="text-xs text-gray-500 mt-1">
              {{ previewStoreRow.variation.sku }}
            </div>
          </div>
          <Button class="btn btn-outline-dark" @click="closeStorePreview">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
        <div class="flex-1 min-h-0 overflow-y-auto max-h-[75vh]">
          <EbayCategoryDualSelectionPreview
            :main-category="previewStoreMainNode"
            :secondary-category="previewStoreSecondaryNode"
            :selected-target="'main'"
            :secondary-disabled="!previewStoreMainNode?.remoteId"
            :read-only="true"
          />
          <div class="mt-4 space-y-3">
            <div class="rounded border bg-white p-3">
              <h6 class="font-semibold text-sm mb-2">
                {{ t('products.products.ebay.selectionSlots.mainTitle') }}
              </h6>
              <EbayStoreCategoryDetails
                v-if="previewStoreMainNode"
                :category="previewStoreMainNode"
              />
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.ebay.noSelection') }}
              </div>
            </div>
            <div class="rounded border bg-white p-3">
              <h6 class="font-semibold text-sm mb-2">
                {{ t('products.products.ebay.selectionSlots.secondaryTitle') }}
              </h6>
              <EbayStoreCategoryDetails
                v-if="previewStoreSecondaryNode"
                :category="previewStoreSecondaryNode"
              />
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.ebay.noSelection') }}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Modal>
  </div>
</template>
