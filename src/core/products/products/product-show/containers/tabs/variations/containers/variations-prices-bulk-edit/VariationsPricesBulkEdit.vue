<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FetchPolicy } from '@apollo/client';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../../../../apollo-client";
import { currenciesQuery } from "../../../../../../../../../shared/api/queries/currencies.js";
import { bundleVariationsWithPricesQuery, configurableVariationsWithPricesQuery } from "../../../../../../../../../shared/api/queries/products.js";
import { createSalesPricesMutation, updateSalesPriceMutation } from "../../../../../../../../../shared/api/mutations/salesPrices.js";
import { Product } from "../../../../configs";
import { ProductType } from "../../../../../../../../../shared/utils/constants";

interface CurrencyInfo {
  id: string;
  isoCode: string;
  name: string;
  symbol: string;
  readonly: boolean;
}

interface VariationPriceInfo {
  id: string | null;
  price: string;
  rrp: string;
  currencyId: string;
  readonly: boolean;
}

interface VariationRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
  };
  prices: Record<string, VariationPriceInfo>;
}

const PRICE_COLUMN_SEPARATOR = '__';

type PriceField = 'price' | 'rrp';

type ParsedPriceColumn = {
  isoCode: string;
  field: PriceField;
};

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const currencies = ref<CurrencyInfo[]>([]);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const matrixRef = ref<MatrixEditorExpose | null>(null);

const isAlias = computed(() => props.product.type === ProductType.Alias);
const parentProduct = computed(() => (isAlias.value ? props.product.aliasParentProduct : props.product));
const parentProductType = computed(() => parentProduct.value.type);

const baseColumns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
]);

const priceColumns = computed<MatrixColumn[]>(() =>
  currencies.value.flatMap((currency) => {
    const labelCurrency = currency.name || currency.isoCode;
    return [
      {
        key: `${currency.isoCode}${PRICE_COLUMN_SEPARATOR}rrp`,
        label: t('products.products.variations.prices.columns.rrp', { currency: labelCurrency }),
        editable: !currency.readonly,
        valueType: 'float',
      },
      {
        key: `${currency.isoCode}${PRICE_COLUMN_SEPARATOR}price`,
        label: t('products.products.variations.prices.columns.price', { currency: labelCurrency }),
        editable: !currency.readonly,
        valueType: 'float',
      },
    ];
  })
);

const columns = computed<MatrixColumn[]>(() => [...baseColumns.value, ...priceColumns.value]);

const hasChanges = computed(
  () => JSON.stringify(variations.value) !== JSON.stringify(originalVariations.value)
);

const hasUnsavedChanges = hasChanges;

const parsePriceColumnKey = (key: string): ParsedPriceColumn | null => {
  const [isoCode, field] = key.split(PRICE_COLUMN_SEPARATOR);
  if (!isoCode || (field !== 'price' && field !== 'rrp')) {
    return null;
  }
  return { isoCode, field: field as PriceField };
};

const isPriceColumn = (key: string) => Boolean(parsePriceColumnKey(key));

const isColumnEditable = (key: string) => {
  const parsed = parsePriceColumnKey(key);
  if (!parsed) {
    return false;
  }
  const currency = currencies.value.find((item) => item.isoCode === parsed.isoCode);
  return currency ? !currency.readonly : false;
};

const ensurePriceEntry = (row: VariationRow, isoCode: string) => {
  if (!row.prices[isoCode]) {
    const currency = currencies.value.find((item) => item.isoCode === isoCode);
    if (!currency) {
      return null;
    }
    row.prices[isoCode] = {
      id: null,
      price: '',
      rrp: '',
      currencyId: currency.id,
      readonly: currency.readonly,
    };
  }
  return row.prices[isoCode];
};

const getMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  if (!row) return '';
  if (columnKey === 'sku') {
    return row.variation.sku;
  }
  if (columnKey === 'name') {
    return row.variation.name;
  }
  if (columnKey === 'active') {
    return row.variation.active ? t('shared.labels.yes') : t('shared.labels.no');
  }
  const parsed = parsePriceColumnKey(columnKey);
  if (!parsed) return '';
  const priceInfo = row.prices[parsed.isoCode];
  if (!priceInfo) return '';
  return priceInfo[parsed.field] ?? '';
};

const setPriceValue = (rowIndex: number, columnKey: string, rawValue: any) => {
  if (!isColumnEditable(columnKey)) return;
  const parsed = parsePriceColumnKey(columnKey);
  if (!parsed) return;
  const row = variations.value[rowIndex];
  if (!row) return;
  const entry = ensurePriceEntry(row, parsed.isoCode);
  if (!entry) return;
  const value = rawValue === null || rawValue === undefined ? '' : String(rawValue);
  entry[parsed.field] = value;
};

const updatePriceFromInput = (rowIndex: number, columnKey: string, value: string | number | null) => {
  setPriceValue(rowIndex, columnKey, value);
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  setPriceValue(rowIndex, columnKey, value);
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  if (!isColumnEditable(columnKey)) return;
  const value = getMatrixCellValue(fromRow, columnKey);
  setPriceValue(toRow, columnKey, value);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  setPriceValue(rowIndex, columnKey, '');
};

const loadCurrencies = async (policy: FetchPolicy = 'cache-first') => {
  const { data } = await apolloClient.query({
    query: currenciesQuery,
    variables: { first: 100 },
    fetchPolicy: policy,
  });
  const edges = data?.currencies?.edges ?? [];
  currencies.value = edges.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      isoCode: node.isoCode,
      name: node.name,
      symbol: node.symbol,
      readonly: !node.isDefaultCurrency && !!node.inheritsFrom,
    };
  });
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsWithPricesQuery : configurableVariationsWithPricesQuery;
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

  variations.value = nodes.map((node: any) => {
    const variationProduct = node.variation;
    const priceMap: Record<string, VariationPriceInfo> = {};
    currencies.value.forEach((currency) => {
      const priceEntry = (variationProduct.salespriceSet ?? []).find(
        (price: any) => price.currency?.isoCode === currency.isoCode
      );
      priceMap[currency.isoCode] = {
        id: priceEntry?.id ?? null,
        price: priceEntry?.price != null ? String(priceEntry.price) : '',
        rrp: priceEntry?.rrp != null ? String(priceEntry.rrp) : '',
        currencyId: currency.id,
        readonly: currency.readonly,
      };
    });
    return {
      id: variationProduct.id,
      variation: {
        id: variationProduct.id,
        sku: variationProduct.sku,
        name: variationProduct.name,
        active: variationProduct.active,
      },
      prices: priceMap,
    };
  });
  originalVariations.value = JSON.parse(JSON.stringify(variations.value));
  matrixRef.value?.resetHistory(variations.value);
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    if (!currencies.value.length || policy === 'network-only') {
      await loadCurrencies(policy);
    }
    await fetchVariations(policy);
  } finally {
    loading.value = false;
  }
};

const parsePriceValue = (value: string) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

const save = async () => {
  if (!hasChanges.value) return;
  saving.value = true;
  try {
    const originalMap = new Map<string, VariationRow>();
    originalVariations.value.forEach((item) => {
      originalMap.set(item.variation.id, item);
    });

    const toCreate: any[] = [];
    const toUpdate: any[] = [];

    variations.value.forEach((row) => {
      const original = originalMap.get(row.variation.id);
      currencies.value.forEach((currency) => {
        const current = row.prices[currency.isoCode];
        const previous = original?.prices?.[currency.isoCode];
        if (!current || currency.readonly) {
          return;
        }
        const currentPrice = current.price ?? '';
        const currentRrp = current.rrp ?? '';
        const previousPrice = previous?.price ?? '';
        const previousRrp = previous?.rrp ?? '';
        if (currentPrice === previousPrice && currentRrp === previousRrp) {
          return;
        }
        if (current.id) {
          const updateData: Record<string, any> = { id: current.id };
          if (currentPrice !== previousPrice) {
            updateData.price = parsePriceValue(current.price);
          }
          if (currentRrp !== previousRrp) {
            updateData.rrp = parsePriceValue(current.rrp);
          }
          toUpdate.push(updateData);
        } else {
          const priceValue = parsePriceValue(current.price);
          const rrpValue = parsePriceValue(current.rrp);
          if (priceValue === null && rrpValue === null) {
            return;
          }
          toCreate.push({
            product: { id: row.variation.id },
            currency: { id: current.currencyId },
            price: priceValue,
            rrp: rrpValue,
          });
        }
      });
    });

    const createdCount = toCreate.length;
    const updatedCount = toUpdate.length;

    if (!createdCount && !updatedCount) {
      saving.value = false;
      return;
    }

    if (createdCount) {
      await apolloClient.mutate({
        mutation: createSalesPricesMutation,
        variables: { data: toCreate },
      });
    }

    if (updatedCount) {
      for (const item of toUpdate) {
        await apolloClient.mutate({
          mutation: updateSalesPriceMutation,
          variables: { data: item },
        });
      }
    }

    await loadData('network-only');

    const messages: string[] = [];
    if (createdCount) {
      messages.push(t('products.products.variations.prices.toast.created', { count: createdCount }));
    }
    if (updatedCount) {
      messages.push(t('products.products.variations.prices.toast.updated', { count: updatedCount }));
    }
    if (messages.length) {
      Toast.success(messages.join('<br>'));
    }
  } catch (error) {
    console.error('Failed to save variation prices', error);
    Toast.error(t('shared.messages.somethingWentWrong'));
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadData();
});

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
          <span class="block truncate" :title="row.variation.name">
            {{ row.variation.name }}
          </span>
        </template>
        <template v-else-if="column.key === 'sku'">
          <span class="block truncate" :title="row.variation.sku">
            {{ row.variation.sku }}
          </span>
        </template>
        <template v-else-if="column.key === 'active'">
          <Icon
            v-if="row.variation.active"
            name="check-circle"
            class="text-green-500"
          />
          <Icon
            v-else
            name="times-circle"
            class="text-red-500"
          />
        </template>
        <template v-else-if="isPriceColumn(column.key)">
          <TextInput
            class="w-full"
            :model-value="getMatrixCellValue(rowIndex, column.key)"
            float
            :disabled="!isColumnEditable(column.key) || loading || saving"
            @update:modelValue="(value) => updatePriceFromInput(rowIndex, column.key, value)"
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
