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
import { ebayProductCategoriesWithProductsQuery } from '../../../../../../../../../shared/api/queries/ebayProducts.js';
import { ebayChannelViewsQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import {
  createEbayProductCategoryMutation,
  deleteEbayProductCategoryMutation,
  updateEbayProductCategoryMutation,
} from '../../../../../../../../../shared/api/mutations/ebayProducts.js';
import EbayCategoryBrowser from '../../../ebay/components/EbayCategoryBrowser.vue';
import EbayCategoryDetails from '../../../ebay/components/EbayCategoryDetails.vue';
import {
  mapCategoriesConnection,
  normalizeCategoryNode,
  type EbayCategoryNode,
} from '../../../ebay/components/ebayCategoryUtils';

interface CategorySelection {
  productCategoryId: string | null;
  remoteId: string | null;
  path: string | null;
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
  productRuleValue: string | null;
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] },
);

const { t } = useI18n();

const viewColumnPrefix = 'ebay-view-';
const productRuleColumnKey = 'productRule';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const categoryMapByView = ref<Record<string, Record<string, EbayCategoryNode>>>({});
const productTypePropertyId = ref<string | null>(null);
const productTypePropertyName = ref<string | null>(null);

const ebayViews = ref<any[]>([]);
const selectedSalesChannelId = ref<string | null>(null);

const selectionModal = reactive({
  visible: false,
  rowIndex: -1,
  viewId: null as string | null,
});
const modalSelection = ref<EbayCategoryNode | null>(null);
const modalSelectionPath = ref<string | null>(null);

const previewVisible = ref(false);
const previewNode = ref<EbayCategoryNode | null>(null);
const previewRow = ref<VariationRow | null>(null);
const previewViewId = ref<string | null>(null);

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
    return ebayViews.value.some((view) => {
      const viewId = view.id;
      const currentRemoteId = row.categories[viewId]?.remoteId ?? null;
      const originalRemoteId = original.categories[viewId]?.remoteId ?? null;
      const currentCategoryId = row.categories[viewId]?.productCategoryId ?? null;
      const originalCategoryId = original.categories[viewId]?.productCategoryId ?? null;
      return currentRemoteId !== originalRemoteId || currentCategoryId !== originalCategoryId;
    });
  });
});

const hasUnsavedChanges = hasChanges;

const createEmptyCategory = (): CategorySelection => ({
  productCategoryId: null,
  remoteId: null,
  path: null,
});

const ensureCategorySelection = (row: VariationRow, viewId: string) => {
  if (!row.categories[viewId]) {
    row.categories[viewId] = createEmptyCategory();
  }
  return row.categories[viewId];
};

const getCategorySelection = (row: VariationRow, columnKey: string) => {
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return null;
  return row.categories[viewId] || null;
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

const getCategoryDisplayPath = (row: VariationRow, columnKey: string) => {
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return null;
  const selection = row.categories[viewId];
  if (!selection?.remoteId) return null;
  return selection.path || buildCategoryPath(selection.remoteId, viewId) || selection.remoteId;
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
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return null;
  const category = row.categories[viewId];
  if (!category?.remoteId) return null;
  return {
    remoteId: category.remoteId,
    path: category.path,
  };
};

const clearCategorySelection = (row: VariationRow, viewId: string) => {
  const category = ensureCategorySelection(row, viewId);
  category.remoteId = null;
  category.path = null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  const viewId = getViewIdFromColumnKey(columnKey);
  if (!viewId) return;

  if (!value) {
    clearCategorySelection(row, viewId);
    return;
  }

  const category = ensureCategorySelection(row, viewId);
  if (typeof value === 'object') {
    const remoteId = value.remoteId ?? null;
    category.remoteId = remoteId;
    category.path =
      value.path ??
      (remoteId ? buildCategoryPath(remoteId, viewId) : null) ??
      category.path;
    return;
  }

  const remoteId = String(value);
  const node = categoryMapByView.value[viewId]?.[remoteId] || null;
  category.remoteId = remoteId;
  category.path = node ? (node.fullName || node.name || remoteId) : remoteId;
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  const clonedValue = value && typeof value === 'object' ? { ...(value as Record<string, any>) } : value;
  setMatrixCellValue(toRow, columnKey, clonedValue ?? null);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
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
    return new Map<string, Map<string, { id: string; remoteId: string }>>();
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

  const categoryMap = new Map<string, Map<string, { id: string; remoteId: string }>>();
  const edges = data?.ebayProductCategories?.edges || [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const productId = node?.product?.id;
    const viewId = node?.view?.id;
    if (!productId || !viewId || !node?.remoteId) return;
    const productMap = categoryMap.get(String(productId)) || new Map<string, { id: string; remoteId: string }>();
    productMap.set(String(viewId), { id: String(node.id), remoteId: String(node.remoteId) });
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
    const [categoriesByProductId, productTypeValuesByProductId] = await Promise.all([
      fetchProductCategories(productIds, policy),
      fetchProductTypeValues(productIds, policy),
    ]);
    const remoteIdsByView: Record<string, Set<string>> = {};

    categoriesByProductId.forEach((viewMap) => {
      viewMap.forEach((entry, viewId) => {
        if (!remoteIdsByView[viewId]) {
          remoteIdsByView[viewId] = new Set<string>();
        }
        if (entry.remoteId) {
          remoteIdsByView[viewId].add(entry.remoteId);
        }
      });
    });

    categoryMapByView.value = {};
    await Promise.all(
      Object.entries(remoteIdsByView).map(([viewId, ids]) =>
        ensureCategoryMapForView(viewId, Array.from(ids), policy),
      ),
    );

    const rowsWithCategories = variationRows.map((row) => {
      const productMap = categoriesByProductId.get(row.variation.id) || new Map();
      const categories: Record<string, CategorySelection> = {};
      ebayViews.value.forEach((view) => {
        const entry = productMap.get(view.id) || null;
        const remoteId = entry?.remoteId ?? null;
        const map = categoryMapByView.value[view.id] || {};
        const node = remoteId ? map[remoteId] : null;
        categories[view.id] = {
          productCategoryId: entry?.id ?? null,
          remoteId,
          path: remoteId ? (node ? (node.fullName || node.name || remoteId) : remoteId) : null,
        };
      });
      return {
        ...row,
        categories,
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
        const originalRemoteId = originalCategory.remoteId;
        const productCategoryId = current.productCategoryId;
        const originalCategoryId = originalCategory.productCategoryId;

        if (currentRemoteId === originalRemoteId && productCategoryId === originalCategoryId) {
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
              },
            },
          });
          current.productCategoryId = data?.createEbayProductCategory?.id || null;
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

const openSelectionModal = (rowIndex: number, viewId: string | null) => {
  if (!viewId) return;
  modalSelection.value = null;
  modalSelectionPath.value = null;
  selectionModal.rowIndex = rowIndex;
  selectionModal.viewId = viewId;
  selectionModal.visible = true;
};

const closeSelectionModal = () => {
  selectionModal.visible = false;
  selectionModal.rowIndex = -1;
  selectionModal.viewId = null;
  modalSelection.value = null;
  modalSelectionPath.value = null;
};

const handleModalSelection = (payload: { node: EbayCategoryNode; path: EbayCategoryNode[] }) => {
  modalSelection.value = payload.node;
  modalSelectionPath.value =
    payload.node.fullName ||
    payload.path.map((node) => node.name).filter(Boolean).join(' > ');
  if (!selectionModal.viewId) return;
  categoryMapByView.value = {
    ...categoryMapByView.value,
    [selectionModal.viewId]: {
      ...(categoryMapByView.value[selectionModal.viewId] || {}),
      [payload.node.remoteId]: payload.node,
    },
  };
};

const applyModalSelection = () => {
  if (!modalSelection.value || selectionModal.rowIndex < 0 || !selectionModal.viewId) return;
  const row = variations.value[selectionModal.rowIndex];
  if (!row) return;
  const category = ensureCategorySelection(row, selectionModal.viewId);
  category.remoteId = modalSelection.value.remoteId;
  category.path = modalSelectionPath.value || modalSelection.value.fullName || modalSelection.value.name;
  closeSelectionModal();
};

const openPreview = async (rowIndex: number, viewId: string | null) => {
  if (!viewId) return;
  const row = variations.value[rowIndex];
  const category = row?.categories[viewId];
  if (!category?.remoteId) return;
  const remoteId = category.remoteId;
  const map = categoryMapByView.value[viewId] || {};
  let node: EbayCategoryNode | null = map[remoteId] ?? null;
  if (!node) {
    node = await fetchCategoryDetails(remoteId, viewId, 'cache-first');
    if (node) {
      categoryMapByView.value = {
        ...categoryMapByView.value,
        [viewId]: {
          ...map,
          [remoteId]: node,
        },
      };
    }
  }
  previewRow.value = row;
  previewNode.value = node;
  previewViewId.value = viewId;
  previewVisible.value = true;
};

const closePreview = () => {
  previewVisible.value = false;
  previewNode.value = null;
  previewRow.value = null;
  previewViewId.value = null;
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
        <template v-else-if="isCategoryColumn(column.key)">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div
                class="text-sm font-medium whitespace-normal break-words"
                :title="getCategoryDisplayPath(row, column.key) || t('products.products.ebay.noSelection')"
              >
                {{ getCategoryDisplayPath(row, column.key) || t('products.products.ebay.noSelection') }}
              </div>
              <div v-if="getCategorySelection(row, column.key)?.remoteId" class="text-xs text-gray-500">
                {{ t('products.products.variations.ebay.labels.categoryId', { id: getCategorySelection(row, column.key)?.remoteId }) }}
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
                v-if="getCategorySelection(row, column.key)?.remoteId"
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
              <div v-if="modalSelectionPath" class="text-xs text-gray-500 mb-2">
                {{ modalSelectionPath }}
              </div>
              <EbayCategoryDetails
                v-if="modalSelection"
                :category="modalSelection"
              />
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.ebay.noSelection') }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            class="btn btn-sm btn-primary"
            :disabled="!modalSelection"
            @click="applyModalSelection"
          >
            {{ t('products.products.variations.ebay.actions.set') }}
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
          <EbayCategoryDetails
            v-if="previewNode"
            :category="previewNode"
          />
          <div v-else class="text-sm text-gray-500">
            {{ t('products.products.ebay.noSelection') }}
          </div>
        </div>
      </Card>
    </Modal>
  </div>
</template>
