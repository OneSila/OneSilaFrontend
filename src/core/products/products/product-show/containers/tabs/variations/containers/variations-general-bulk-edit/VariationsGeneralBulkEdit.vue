<script setup lang="ts">
import { computed, ref, watch, withDefaults } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { Product } from "../../../../../../configs";
import { ProductType } from "../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../apollo-client";
import {
  bundleVariationsWithGeneralQuery,
  configurableVariationsWithGeneralQuery,
  productsWithGeneralQuery,
} from "../../../../../../../../../shared/api/queries/products.js";
import { vatRatesQuery } from "../../../../../../../../../shared/api/queries/vatRates.js";
import { updateProductMutation } from "../../../../../../../../../shared/api/mutations/products.js";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { processGraphQLErrors, shortenText } from "../../../../../../../../../shared/utils";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Toggle } from "../../../../../../../../../shared/components/atoms/toggle";
import { Selector } from "../../../../../../../../../shared/components/atoms/selector";

interface VatRateOption {
  id: string;
  name: string;
  rate: number | string | null;
}

interface VariationRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
  };
  active: boolean;
  allowBackorder: boolean;
  vatRate: VatRateOption | null;
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] }
);
const { t } = useI18n();

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const vatRates = ref<VatRateOption[]>([]);
const loading = ref(false);
const saving = ref(false);

const hasProductIds = computed(() => props.productIds.length > 0);
const isAlias = computed(() => props.product?.type === ProductType.Alias);
const parentProduct = computed(() => {
  if (!props.product) {
    return null;
  }
  return isAlias.value ? props.product.aliasParentProduct : props.product;
});
const parentProductType = computed(() => parentProduct.value?.type ?? null);

const columns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: true, initialWidth: 80, valueType: 'boolean' },
  {
    key: 'allowBackorder',
    label: t('products.products.labels.allowBackorder'),
    editable: true,
    initialWidth: 160,
    valueType: 'boolean',
  },
  {
    key: 'vatRate',
    label: t('products.products.labels.vatRate'),
    editable: true,
    initialWidth: 200,
    valueType: 'select',
  },
]);

const vatRateOptions = computed(() =>
  vatRates.value.map((rate) => ({
    id: rate.id,
    label:
      rate.rate !== null && rate.rate !== undefined && rate.rate !== ''
        ? t('products.products.variations.general.optionLabel', {
            name: rate.name,
            rate: rate.rate,
          })
        : rate.name,
  }))
);

const hasChanges = computed(
  () => JSON.stringify(variations.value) !== JSON.stringify(originalVariations.value)
);

const hasUnsavedChanges = hasChanges;

const copySkuToClipboard = async (sku: string) => {
  try {
    await navigator.clipboard.writeText(sku);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const normalizeVatRate = (value: any): VatRateOption | null => {
  if (!value) {
    return null;
  }
  if (typeof value === 'string') {
    const option = vatRates.value.find((rate) => rate.id === value);
    return option ? { ...option } : null;
  }
  if (typeof value === 'object' && value.id) {
    const option = vatRates.value.find((rate) => rate.id === value.id);
    if (option) {
      return { ...option };
    }
    return {
      id: value.id,
      name: value.name ?? '',
      rate: 'rate' in value ? (value as VatRateOption).rate ?? null : null,
    };
  }
  return null;
};

const getMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  if (!row) return null;
  if (columnKey === 'active') return row.active;
  if (columnKey === 'allowBackorder') return row.allowBackorder;
  if (columnKey === 'vatRate') return row.vatRate ? { ...row.vatRate } : null;
  if (columnKey === 'sku') return row.variation.sku;
  if (columnKey === 'name') return row.variation.name;
  return null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  if (columnKey === 'active' || columnKey === 'allowBackorder') {
    row[columnKey] = Boolean(value);
    return;
  }
  if (columnKey === 'vatRate') {
    row.vatRate = normalizeVatRate(value);
  }
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  if (columnKey === 'vatRate') {
    const clonedValue =
      value && typeof value === 'object'
        ? { ...(value as Record<string, any>) }
        : value;
    setMatrixCellValue(toRow, columnKey, clonedValue ?? null);
    return;
  }
  setMatrixCellValue(toRow, columnKey, value);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  if (columnKey === 'active' || columnKey === 'allowBackorder') {
    setMatrixCellValue(rowIndex, columnKey, false);
    return;
  }
  if (columnKey === 'vatRate') {
    setMatrixCellValue(rowIndex, columnKey, null);
  }
};

const updateBooleanValue = (
  rowIndex: number,
  key: 'active' | 'allowBackorder',
  value: boolean | null
) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  row[key] = Boolean(value);
};

const updateVatRate = (rowIndex: number, value: string | null) => {
  const row = variations.value[rowIndex];
  if (!row) return;
  row.vatRate = value ? normalizeVatRate(value) : null;
};

const loadVatRates = async (policy: FetchPolicy = 'cache-first') => {
  const { data } = await apolloClient.query({
    query: vatRatesQuery,
    variables: { first: 100 },
    fetchPolicy: policy,
  });
  const edges = data?.vatRates?.edges ?? [];
  vatRates.value = edges.map((edge: any) => ({
    id: edge.node?.id,
    name: edge.node?.name ?? '',
    rate: edge.node?.rate ?? null,
  }));
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  if (!parentProduct.value || !parentProductType.value) {
    return [];
  }
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsWithGeneralQuery : configurableVariationsWithGeneralQuery;
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
      },
      active: Boolean(variationProduct.active),
      allowBackorder: Boolean(variationProduct.allowBackorder),
      vatRate: variationProduct.vatRate
        ? {
            id: variationProduct.vatRate.id,
            name: variationProduct.vatRate.name ?? '',
            rate: variationProduct.vatRate.rate ?? null,
          }
        : null,
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
      query: productsWithGeneralQuery,
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
    },
    active: Boolean(node.active),
    allowBackorder: Boolean(node.allowBackorder),
    vatRate: node.vatRate
      ? {
          id: node.vatRate.id,
          name: node.vatRate.name ?? '',
          rate: node.vatRate.rate ?? null,
        }
      : null,
  })) as VariationRow[];
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    await loadVatRates(policy);
    let variationRows: VariationRow[] = [];
    if (hasProductIds.value) {
      variationRows = await fetchProducts(policy);
    } else if (props.product) {
      variationRows = await fetchVariations(policy);
    }
    variations.value = variationRows;
    originalVariations.value = JSON.parse(JSON.stringify(variationRows));
    matrixRef.value?.resetHistory(variationRows);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!hasChanges.value) return;
  saving.value = true;
  try {
    const originalMap = new Map<string, VariationRow>();
    originalVariations.value.forEach((row) => {
      originalMap.set(row.id, row);
    });

    const updates: any[] = [];

    variations.value.forEach((row) => {
      const original = originalMap.get(row.id);
      if (!original) return;
      const input: Record<string, any> = { id: row.id };
      let changed = false;

      if (row.active !== original.active) {
        input.active = row.active;
        changed = true;
      }
      if (row.allowBackorder !== original.allowBackorder) {
        input.allowBackorder = row.allowBackorder;
        changed = true;
      }
      const currentVatRateId = row.vatRate?.id ?? null;
      const originalVatRateId = original.vatRate?.id ?? null;
      if (currentVatRateId !== originalVatRateId) {
        input.vatRate = currentVatRateId ? { id: currentVatRateId } : null;
        changed = true;
      }

      if (changed) {
        updates.push(input);
      }
    });

    if (!updates.length) {
      return;
    }

    for (const data of updates) {
      await apolloClient.mutate({
        mutation: updateProductMutation,
        variables: { data },
      });
    }

    originalVariations.value = JSON.parse(JSON.stringify(variations.value));
    matrixRef.value?.resetHistory(variations.value);
    Toast.success(
      t('products.products.variations.general.toast.updated', {
        count: updates.length,
      })
    );
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const messages = Object.values(validationErrors).filter(Boolean);
    if (messages.length) {
      Toast.error(messages.join('<br>'));
    } else {
      Toast.error(t('shared.messages.somethingWentWrong'));
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => [props.product?.id ?? null, props.productIds.join(',')],
  () => {
    loadData();
  },
  { immediate: true }
);

defineExpose({ save, hasUnsavedChanges });
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
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'general' } }"
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
          <Toggle :model-value="variations[rowIndex].active" @update:modelValue="(value) => updateBooleanValue(rowIndex, 'active', value)" />
        </template>
        <template v-else-if="column.key === 'allowBackorder'">
          <Toggle
            :model-value="variations[rowIndex].allowBackorder"
            @update:modelValue="(value) => updateBooleanValue(rowIndex, 'allowBackorder', value)"
          />
        </template>
        <template v-else-if="column.key === 'vatRate'">
          <Selector
            class="w-full"
            :options="vatRateOptions"
            :model-value="variations[rowIndex].vatRate?.id ?? null"
            label-by="label"
            value-by="id"
            dropdown-position="bottom"
            :placeholder="t('products.products.variations.general.placeholders.vatRate')"
            @update:modelValue="(value) => updateVatRate(rowIndex, value)"
          />
        </template>
        <template v-else>
          <span class="block truncate">
            {{ getMatrixCellValue(rowIndex, column.key) ?? '' }}
          </span>
        </template>
      </template>
    </MatrixEditor>
  </div>
</template>
