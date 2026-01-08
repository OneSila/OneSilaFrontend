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
import { Toast } from '../../../../../../../../../shared/modules/toast';
import { displayApolloError, shortenText } from '../../../../../../../../../shared/utils';
import {
  bundleVariationsWithSheinQuery,
  configurableVariationsWithSheinQuery,
  productsWithSheinQuery,
} from '../../../../../../../../../shared/api/queries/products.js';
import { sheinCategoriesQuery } from '../../../../../../../../../shared/api/queries/sheinCategories.js';
import { sheinProductCategoriesWithProductsQuery } from '../../../../../../../../../shared/api/queries/sheinProducts.js';
import { sheinChannelsQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import {
  createSheinProductCategoryMutation,
  deleteSheinProductCategoryMutation,
  updateSheinProductCategoryMutation,
} from '../../../../../../../../../shared/api/mutations/sheinProducts.js';
import SheinCategoryBrowser from '../../../shein/components/SheinCategoryBrowser.vue';
import SheinCategoryDetails from '../../../shein/components/SheinCategoryDetails.vue';
import {
  mapCategoriesConnection,
  normalizeCategoryNode,
  type SheinCategoryNode,
} from '../../../shein/components/sheinCategoryUtils';

interface CategorySelection {
  productCategoryId: string | null;
  remoteId: string | null;
  productTypeRemoteId: string | null;
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
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] },
);

const { t } = useI18n();

const channelColumnPrefix = 'shein-channel-';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const categoryMapByChannel = ref<Record<string, Record<string, SheinCategoryNode>>>({});

const sheinChannels = ref<any[]>([]);

const selectionModal = reactive({
  visible: false,
  rowIndex: -1,
  channelId: null as string | null,
});
const modalSelection = ref<SheinCategoryNode | null>(null);
const modalSelectionPath = ref<string | null>(null);

const previewVisible = ref(false);
const previewNode = ref<SheinCategoryNode | null>(null);
const previewRow = ref<VariationRow | null>(null);
const previewChannelId = ref<string | null>(null);

const hasProductIds = computed(() => props.productIds.length > 0);
const isAlias = computed(() => props.product?.type === ProductType.Alias);
const parentProduct = computed(() => {
  if (!props.product) {
    return null;
  }
  return isAlias.value ? props.product.aliasParentProduct : props.product;
});
const parentProductType = computed(() => parentProduct.value?.type ?? null);

const channelById = computed(() =>
  sheinChannels.value.reduce<Record<string, any>>((acc, channel) => {
    acc[channel.id] = channel;
    return acc;
  }, {}),
);

const selectionModalChannel = computed(() =>
  selectionModal.channelId ? channelById.value[selectionModal.channelId] : null,
);

const previewChannel = computed(() =>
  previewChannelId.value ? channelById.value[previewChannelId.value] : null,
);

const buildChannelColumnKey = (channelId: string) => `${channelColumnPrefix}${channelId}`;

const getChannelIdFromColumnKey = (columnKey: string) =>
  columnKey.startsWith(channelColumnPrefix)
    ? columnKey.slice(channelColumnPrefix.length)
    : null;

const isCategoryColumn = (columnKey: string) =>
  columnKey.startsWith(channelColumnPrefix);

const getChannelValueType = (channelId: string) => `shein-category-${channelId}`;

const columns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false, initialWidth: 160 },
  { key: 'name', label: t('shared.labels.name'), editable: false, initialWidth: 280 },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 80 },
  ...sheinChannels.value.map((channel) => ({
    key: buildChannelColumnKey(channel.id),
    label: channel.hostname || '-',
    editable: true,
    initialWidth: 600,
    valueType: getChannelValueType(channel.id),
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
    return sheinChannels.value.some((channel) => {
      const channelId = channel.id;
      const currentRemoteId = row.categories[channelId]?.remoteId ?? null;
      const originalRemoteId = original.categories[channelId]?.remoteId ?? null;
      return currentRemoteId !== originalRemoteId;
    });
  });
});

const hasUnsavedChanges = hasChanges;

const createEmptyCategory = (): CategorySelection => ({
  productCategoryId: null,
  remoteId: null,
  productTypeRemoteId: null,
  path: null,
});

const ensureCategorySelection = (row: VariationRow, channelId: string) => {
  if (!row.categories[channelId]) {
    row.categories[channelId] = createEmptyCategory();
  }
  return row.categories[channelId];
};

const getCategorySelection = (row: VariationRow, columnKey: string) => {
  const channelId = getChannelIdFromColumnKey(columnKey);
  if (!channelId) return null;
  return row.categories[channelId] || null;
};

const getCategoryDisplayPath = (row: VariationRow, columnKey: string) => {
  const channelId = getChannelIdFromColumnKey(columnKey);
  if (!channelId) return null;
  const selection = row.categories[channelId];
  if (!selection?.remoteId) return null;
  return selection.path || buildCategoryPath(selection.remoteId, channelId) || selection.remoteId;
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
  if (columnKey === 'name') return row.variation.name;
  if (columnKey === 'active') return row.variation.active;
  const channelId = getChannelIdFromColumnKey(columnKey);
  if (!channelId) return null;
  const category = row.categories[channelId];
  if (!category?.remoteId) return null;
  return {
    remoteId: category.remoteId,
    productTypeRemoteId: category.productTypeRemoteId,
    path: category.path,
  };
};

const clearCategorySelection = (row: VariationRow, channelId: string) => {
  const category = ensureCategorySelection(row, channelId);
  category.remoteId = null;
  category.productTypeRemoteId = null;
  category.path = null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  const channelId = getChannelIdFromColumnKey(columnKey);
  if (!channelId) return;

  if (!value) {
    clearCategorySelection(row, channelId);
    return;
  }

  const category = ensureCategorySelection(row, channelId);
  if (typeof value === 'object') {
    const remoteId = value.remoteId ?? null;
    category.remoteId = remoteId;
    category.productTypeRemoteId = value.productTypeRemoteId ?? category.productTypeRemoteId ?? null;
    category.path =
      value.path ??
      (remoteId ? buildCategoryPath(remoteId, channelId) : null) ??
      category.path;
    return;
  }

  const remoteId = String(value);
  const node = categoryMapByChannel.value[channelId]?.[remoteId] || null;
  category.remoteId = remoteId;
  category.productTypeRemoteId = node?.productTypeRemoteId ?? null;
  category.path = node ? buildCategoryPath(remoteId, channelId) : remoteId;
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  const clonedValue = value && typeof value === 'object' ? { ...(value as Record<string, any>) } : value;
  setMatrixCellValue(toRow, columnKey, clonedValue ?? null);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  const channelId = getChannelIdFromColumnKey(columnKey);
  if (!row || !channelId) return;
  clearCategorySelection(row, channelId);
};

const buildCategoryPath = (remoteId: string, channelId: string) => {
  const map = categoryMapByChannel.value[channelId] || {};
  const parts: string[] = [];
  let current = map[remoteId];
  const visited = new Set<string>();
  while (current && !visited.has(current.remoteId)) {
    parts.unshift(current.name || current.remoteId);
    visited.add(current.remoteId);
    if (!current.parentRemoteId) break;
    current = map[current.parentRemoteId];
  }
  return parts.length ? parts.join(' > ') : null;
};

const ensureCategoryMapForChannel = async (
  channelId: string,
  remoteIds: string[],
  policy: FetchPolicy,
) => {
  if (!channelId || !remoteIds.length) return;
  const map = { ...(categoryMapByChannel.value[channelId] || {}) };
  const pending = new Set<string>(remoteIds.filter((id) => id && !map[id]));
  const processed = new Set<string>(Object.keys(map));

  while (pending.size) {
    const batch = Array.from(pending).slice(0, 50);
    batch.forEach((id) => pending.delete(id));
    const { data } = await apolloClient.query({
      query: sheinCategoriesQuery,
      variables: {
        first: batch.length,
        filter: {
          salesChannel: { id: { exact: channelId } },
          remoteId: { inList: batch },
        },
      },
      fetchPolicy: policy,
    });
    const nodes = mapCategoriesConnection(data?.sheinCategories);
    nodes.forEach((node) => {
      map[node.remoteId] = node;
      processed.add(node.remoteId);
    });
    nodes.forEach((node) => {
      if (node.parentRemoteId && !map[node.parentRemoteId] && !processed.has(node.parentRemoteId)) {
        pending.add(node.parentRemoteId);
      }
    });
  }

  categoryMapByChannel.value = {
    ...categoryMapByChannel.value,
    [channelId]: map,
  };
};

const fetchCategoryDetails = async (
  remoteId: string,
  channelId: string,
  policy: FetchPolicy,
) => {
  try {
    const { data } = await apolloClient.query({
      query: sheinCategoriesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: channelId } },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: policy,
    });
    const node = data?.sheinCategories?.edges?.[0]?.node;
    return node ? normalizeCategoryNode(node) : null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const fetchSheinChannels = async () => {
  try {
    const { data } = await apolloClient.query({
      query: sheinChannelsQuery,
      fetchPolicy: 'cache-first',
    });
    const list = data?.sheinChannels?.edges?.map((edge: any) => edge.node) || [];
    sheinChannels.value = list.sort((a: any, b: any) => (a.hostname || '').localeCompare(b.hostname || ''));
  } catch (error) {
    sheinChannels.value = [];
    displayApolloError(error);
  }
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  if (!parentProduct.value || !parentProductType.value) {
    return [];
  }
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsWithSheinQuery : configurableVariationsWithSheinQuery;
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
      query: productsWithSheinQuery,
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
  })) as VariationRow[];
};

const fetchProductCategories = async (productIds: string[], policy: FetchPolicy) => {
  if (!productIds.length) {
    return new Map<string, Map<string, { id: string; remoteId: string }>>();
  }
  const { data } = await apolloClient.query({
    query: sheinProductCategoriesWithProductsQuery,
    variables: {
      filter: {
        product: { id: { inList: productIds } },
      },
    },
    fetchPolicy: policy,
  });

  const categoryMap = new Map<string, Map<string, { id: string; remoteId: string }>>();
  const edges = data?.sheinProductCategories?.edges || [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const productId = node?.product?.id;
    const channelId = node?.salesChannel?.id;
    if (!productId || !channelId || !node?.remoteId) return;
    const productMap = categoryMap.get(String(productId)) || new Map<string, { id: string; remoteId: string }>();
    productMap.set(String(channelId), { id: String(node.id), remoteId: String(node.remoteId) });
    categoryMap.set(String(productId), productMap);
  });
  return categoryMap;
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    if (!sheinChannels.value.length) {
      await fetchSheinChannels();
    }
    let variationRows: VariationRow[] = [];
    if (hasProductIds.value) {
      variationRows = await fetchProducts(policy);
    } else if (props.product) {
      variationRows = await fetchVariations(policy);
    }

    const productIds = variationRows.map((row) => row.variation.id).filter(Boolean);
    const categoriesByProductId = await fetchProductCategories(productIds, policy);
    const remoteIdsByChannel: Record<string, Set<string>> = {};

    categoriesByProductId.forEach((channelMap) => {
      channelMap.forEach((entry, channelId) => {
        if (!remoteIdsByChannel[channelId]) {
          remoteIdsByChannel[channelId] = new Set<string>();
        }
        if (entry.remoteId) {
          remoteIdsByChannel[channelId].add(entry.remoteId);
        }
      });
    });

    categoryMapByChannel.value = {};
    await Promise.all(
      Object.entries(remoteIdsByChannel).map(([channelId, ids]) =>
        ensureCategoryMapForChannel(channelId, Array.from(ids), policy),
      ),
    );

    const rowsWithCategories = variationRows.map((row) => {
      const productMap = categoriesByProductId.get(row.variation.id) || new Map();
      const categories: Record<string, CategorySelection> = {};
      sheinChannels.value.forEach((channel) => {
        const entry = productMap.get(channel.id) || null;
        const remoteId = entry?.remoteId ?? null;
        const map = categoryMapByChannel.value[channel.id] || {};
        const node = remoteId ? map[remoteId] : null;
        categories[channel.id] = {
          productCategoryId: entry?.id ?? null,
          remoteId,
          productTypeRemoteId: node?.productTypeRemoteId ?? null,
          path: remoteId ? (node ? buildCategoryPath(remoteId, channel.id) : remoteId) : null,
        };
      });
      return {
        ...row,
        categories,
      };
    });

    variations.value = rowsWithCategories;
    originalVariations.value = JSON.parse(JSON.stringify(rowsWithCategories));
    matrixRef.value?.resetHistory(rowsWithCategories);
  } finally {
    loading.value = false;
  }
};

const resolveProductTypeRemoteId = async (
  channelId: string,
  remoteId: string,
  fallback: string | null,
) => {
  if (fallback) return fallback;
  const map = categoryMapByChannel.value[channelId] || {};
  if (map[remoteId]?.productTypeRemoteId) {
    return map[remoteId].productTypeRemoteId;
  }
  const node = await fetchCategoryDetails(remoteId, channelId, 'cache-first');
  if (!node) return null;
  categoryMapByChannel.value = {
    ...categoryMapByChannel.value,
    [channelId]: { ...map, [remoteId]: node },
  };
  return node.productTypeRemoteId || null;
};

const save = async () => {
  if (!hasChanges.value || saving.value) return;
  if (!sheinChannels.value.length) {
    Toast.error(t('products.products.shein.noChannels'));
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
      for (const channel of sheinChannels.value) {
        const channelId = channel.id;
        const current = row.categories[channelId] || createEmptyCategory();
        const originalCategory = original?.categories[channelId] || createEmptyCategory();
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
              mutation: deleteSheinProductCategoryMutation,
              variables: { data: { id: productCategoryId } },
            });
            current.productCategoryId = null;
          }
          continue;
        }

        const productTypeRemoteId = await resolveProductTypeRemoteId(
          channelId,
          currentRemoteId,
          current.productTypeRemoteId,
        );
        if (!productTypeRemoteId) {
          Toast.error(t('products.products.shein.productTypeIdMissing'));
          continue;
        }
        current.productTypeRemoteId = productTypeRemoteId;

        if (productCategoryId) {
          await apolloClient.mutate({
            mutation: updateSheinProductCategoryMutation,
            variables: {
              data: {
                id: productCategoryId,
                remoteId: currentRemoteId,
                productTypeRemoteId,
              },
            },
          });
        } else {
          const { data } = await apolloClient.mutate({
            mutation: createSheinProductCategoryMutation,
            variables: {
              data: {
                product: { id: row.variation.id },
                salesChannel: { id: channelId },
                remoteId: currentRemoteId,
                productTypeRemoteId,
              },
            },
          });
          current.productCategoryId = data?.createSheinProductCategory?.id || null;
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

const openSelectionModal = (rowIndex: number, channelId: string | null) => {
  if (!channelId) return;
  modalSelection.value = null;
  modalSelectionPath.value = null;
  selectionModal.rowIndex = rowIndex;
  selectionModal.channelId = channelId;
  selectionModal.visible = true;
};

const closeSelectionModal = () => {
  selectionModal.visible = false;
  selectionModal.rowIndex = -1;
  selectionModal.channelId = null;
  modalSelection.value = null;
  modalSelectionPath.value = null;
};

const handleModalSelection = (payload: { node: SheinCategoryNode; path: SheinCategoryNode[] }) => {
  modalSelection.value = payload.node;
  modalSelectionPath.value = payload.path.map((node) => node.name).filter(Boolean).join(' > ');
  if (!selectionModal.channelId) return;
  categoryMapByChannel.value = {
    ...categoryMapByChannel.value,
    [selectionModal.channelId]: {
      ...(categoryMapByChannel.value[selectionModal.channelId] || {}),
      [payload.node.remoteId]: payload.node,
    },
  };
};

const applyModalSelection = () => {
  if (!modalSelection.value || selectionModal.rowIndex < 0 || !selectionModal.channelId) return;
  const row = variations.value[selectionModal.rowIndex];
  if (!row) return;
  const category = ensureCategorySelection(row, selectionModal.channelId);
  category.remoteId = modalSelection.value.remoteId;
  category.productTypeRemoteId = modalSelection.value.productTypeRemoteId ?? null;
  category.path = modalSelectionPath.value || modalSelection.value.name;
  closeSelectionModal();
};

const openPreview = async (rowIndex: number, channelId: string | null) => {
  if (!channelId) return;
  const row = variations.value[rowIndex];
  const category = row?.categories[channelId];
  if (!category?.remoteId) return;
  const remoteId = category.remoteId;
  const map = categoryMapByChannel.value[channelId] || {};
  let node: SheinCategoryNode | null = map[remoteId] ?? null;
  if (!node) {
    node = await fetchCategoryDetails(remoteId, channelId, 'cache-first');
    if (node) {
      categoryMapByChannel.value = {
        ...categoryMapByChannel.value,
        [channelId]: {
          ...map,
          [remoteId]: node,
        },
      };
    }
  }
  previewRow.value = row;
  previewNode.value = node;
  previewChannelId.value = channelId;
  previewVisible.value = true;
};

const closePreview = () => {
  previewVisible.value = false;
  previewNode.value = null;
  previewRow.value = null;
  previewChannelId.value = null;
};

onMounted(async () => {
  await fetchSheinChannels();
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
      :loading="loading || saving"
      :has-changes="hasChanges"
      row-key="id"
      :get-cell-value="getMatrixCellValue"
      :set-cell-value="setMatrixCellValue"
      :clone-cell-value="cloneMatrixCellValue"
      :clear-cell-value="clearMatrixCellValue"
      @save="save"
    >
      <template #filters>
        <div
          v-if="!sheinChannels.length"
          class="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
        >
          {{ t('products.products.shein.noChannels') }}
        </div>
      </template>
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'shein' } }"
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
                :title="getCategoryDisplayPath(row, column.key) || t('products.products.shein.noSelection')"
              >
                {{ getCategoryDisplayPath(row, column.key) || t('products.products.shein.noSelection') }}
              </div>
              <div v-if="getCategorySelection(row, column.key)?.remoteId" class="text-xs text-gray-500">
                {{ t('products.products.variations.shein.labels.categoryId', { id: getCategorySelection(row, column.key)?.remoteId }) }}
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button
                class="p-2 text-primary hover:bg-blue-50 rounded"
                :title="t('products.products.variations.shein.actions.set')"
                :aria-label="t('products.products.variations.shein.actions.set')"
                :disabled="saving"
                @click="openSelectionModal(rowIndex, getChannelIdFromColumnKey(column.key))"
              >
                <Icon name="edit" class="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                v-if="getCategorySelection(row, column.key)?.remoteId"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded"
                :title="t('products.products.variations.shein.actions.preview')"
                :aria-label="t('products.products.variations.shein.actions.preview')"
                :disabled="saving"
                @click="openPreview(rowIndex, getChannelIdFromColumnKey(column.key))"
              >
                <Icon name="eye" class="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </template>
      </template>
    </MatrixEditor>

    <Modal v-model="selectionModal.visible" @closed="closeSelectionModal">
      <Card class="modal-content w-11/12 max-w-6xl h-[85vh] flex flex-col min-h-0 overflow-hidden">
        <div class="mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.variations.shein.modal.title') }}
          </h3>
          <div v-if="selectionModalChannel?.hostname" class="text-xs text-gray-500 mt-1">
            {{ selectionModalChannel.hostname }}
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <div class="grid gap-4 lg:grid-cols-2 h-full min-h-0">
            <div class="rounded border bg-white p-4 min-h-0 h-full max-h-[65vh] overflow-hidden flex flex-col">
              <SheinCategoryBrowser
                :sales-channel-id="selectionModal.channelId"
                @selected="handleModalSelection"
              />
            </div>
            <div class="rounded border bg-white p-4 overflow-y-auto min-h-0 h-full max-h-[65vh]">
              <div v-if="modalSelectionPath" class="text-xs text-gray-500 mb-2">
                {{ modalSelectionPath }}
              </div>
              <SheinCategoryDetails
                v-if="modalSelection"
                :category="modalSelection"
                :sales-channel-id="selectionModal.channelId"
                :channel="selectionModalChannel"
              />
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.shein.noSelection') }}
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
            {{ t('products.products.variations.shein.actions.set') }}
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
              {{ t('products.products.variations.shein.modal.previewTitle') }}
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
          <SheinCategoryDetails
            v-if="previewNode"
            :category="previewNode"
            :sales-channel-id="previewChannelId"
            :channel="previewChannel"
          />
          <div v-else class="text-sm text-gray-500">
            {{ t('products.products.shein.noSelection') }}
          </div>
        </div>
      </Card>
    </Modal>
  </div>
</template>
