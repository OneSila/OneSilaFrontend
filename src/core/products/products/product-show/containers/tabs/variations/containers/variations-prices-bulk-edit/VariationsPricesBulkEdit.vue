<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FetchPolicy } from '@apollo/client';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { TextInput } from "../../../../../../../../../shared/components/atoms/input-text";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { processGraphQLErrors, shortenText } from "../../../../../../../../../shared/utils";
import apolloClient from "../../../../../../../../../../apollo-client";
import { currenciesQuery } from "../../../../../../../../../shared/api/queries/currencies.js";
import { bundleVariationsWithPricesQuery, configurableVariationsWithPricesQuery } from "../../../../../../../../../shared/api/queries/products.js";
import {
  createSalesPriceListItemsMutation,
  createSalesPricesMutation,
  updateSalesPriceListItemMutation,
  updateSalesPriceMutation,
} from "../../../../../../../../../shared/api/mutations/salesPrices.js";
import { salesPriceListItemsQuery } from "../../../../../../../../../shared/api/queries/salesPrices.js";
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

interface PriceListInfo {
  id: string;
  name: string;
  currency: {
    id: string;
    isoCode: string;
    symbol: string;
  };
}

interface VariationPriceListInfo {
  id: string | null;
  priceAuto: string;
  discountAuto: string;
  priceOverride: string;
  discountOverride: string;
  salesPriceListId: string;
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
  priceLists: Record<string, VariationPriceListInfo>;
}

const PRICE_COLUMN_SEPARATOR = '__';
const PRICE_LIST_COLUMN_PREFIX = 'pricelist';

type PriceField = 'price' | 'rrp';
type PriceListField = 'priceOverride' | 'discountOverride';

type ParsedPriceColumn = {
  isoCode: string;
  field: PriceField;
};

type ParsedPriceListColumn = {
  priceListId: string;
  field: PriceListField;
};

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const currencies = ref<CurrencyInfo[]>([]);
const priceLists = ref<PriceListInfo[]>([]);
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
        requireType: 'base-price',
        iconColorClass: 'text-red-500',
      },
      {
        key: `${currency.isoCode}${PRICE_COLUMN_SEPARATOR}price`,
        label: t('products.products.variations.prices.columns.price', { currency: labelCurrency }),
        editable: !currency.readonly,
        valueType: 'float',
        requireType: 'base-price',
        iconColorClass: 'text-red-500',
      },
    ];
  })
);

const priceListColumns = computed<MatrixColumn[]>(() =>
  priceLists.value.flatMap((priceList) => {
    const labelCurrency =
      priceList.currency?.isoCode || priceList.currency?.symbol || '';
    const labelParams = { priceList: priceList.name, currency: labelCurrency };
    return [
      {
        key: `${PRICE_LIST_COLUMN_PREFIX}${PRICE_COLUMN_SEPARATOR}${priceList.id}${PRICE_COLUMN_SEPARATOR}priceOverride`,
        label: t('products.products.variations.prices.columns.priceListPrice', labelParams),
        editable: true,
        valueType: 'float',
        requireType: 'price-list',
        iconColorClass: 'text-orange-400',
      },
      {
        key: `${PRICE_LIST_COLUMN_PREFIX}${PRICE_COLUMN_SEPARATOR}${priceList.id}${PRICE_COLUMN_SEPARATOR}discountOverride`,
        label: t('products.products.variations.prices.columns.priceListDiscount', labelParams),
        editable: true,
        valueType: 'float',
        requireType: 'price-list',
        iconColorClass: 'text-orange-400',
      },
    ];
  })
);

const columns = computed<MatrixColumn[]>(() => [
  ...baseColumns.value,
  ...priceColumns.value,
  ...priceListColumns.value,
]);

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

const parsePriceListColumnKey = (key: string): ParsedPriceListColumn | null => {
  const [prefix, priceListId, field] = key.split(PRICE_COLUMN_SEPARATOR);
  if (prefix !== PRICE_LIST_COLUMN_PREFIX) {
    return null;
  }
  if (field !== 'priceOverride' && field !== 'discountOverride') {
    return null;
  }
  return { priceListId, field: field as PriceListField };
};

const isPriceColumn = (key: string) => Boolean(parsePriceColumnKey(key));
const isPriceListColumn = (key: string) => Boolean(parsePriceListColumnKey(key));

const isColumnEditable = (key: string) => {
  if (parsePriceListColumnKey(key)) {
    return true;
  }
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

const getPriceListEntry = (row: VariationRow, priceListId: string) => {
  if (!row.priceLists) {
    row.priceLists = {};
  }
  if (!row.priceLists[priceListId]) {
    row.priceLists[priceListId] = {
      id: null,
      priceAuto: '',
      discountAuto: '',
      priceOverride: '',
      discountOverride: '',
      salesPriceListId: priceListId,
      readonly: true,
    };
  }
  return row.priceLists[priceListId];
};

const isPriceListCellEditable = (rowIndex: number, columnKey: string) => {
  const parsed = parsePriceListColumnKey(columnKey);
  if (!parsed) return false;
  const row = variations.value[rowIndex];
  if (!row) return false;
  const entry = row.priceLists?.[parsed.priceListId];
  if (!entry) return false;
  return !entry.readonly;
};

const isCellEditable = (rowIndex: number, columnKey: string) => {
  if (parsePriceListColumnKey(columnKey)) {
    return isPriceListCellEditable(rowIndex, columnKey);
  }
  if (parsePriceColumnKey(columnKey)) {
    return isColumnEditable(columnKey);
  }
  return false;
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
  const parsedPriceList = parsePriceListColumnKey(columnKey);
  if (parsedPriceList) {
    const priceListInfo = row.priceLists?.[parsedPriceList.priceListId];
    if (!priceListInfo) return '';
    return priceListInfo[parsedPriceList.field] ?? '';
  }
  const parsed = parsePriceColumnKey(columnKey);
  if (!parsed) return '';
  const priceInfo = row.prices[parsed.isoCode];
  if (!priceInfo) return '';
  return priceInfo[parsed.field] ?? '';
};

const getPriceListAutoValue = (rowIndex: number, columnKey: string) => {
  const parsed = parsePriceListColumnKey(columnKey);
  if (!parsed) return '';
  const row = variations.value[rowIndex];
  if (!row) return '';
  const entry = row.priceLists?.[parsed.priceListId];
  if (!entry) return '';
  if (parsed.field === 'priceOverride') {
    return entry.priceAuto ?? '';
  }
  return entry.discountAuto ?? '';
};

const getPriceListAutoLabel = (rowIndex: number, columnKey: string) => {
  const value = getPriceListAutoValue(rowIndex, columnKey);
  if (value === '') {
    return t('products.products.variations.prices.labels.autoValueEmpty');
  }
  return t('products.products.variations.prices.labels.autoValue', { value });
};

const setPriceValue = (rowIndex: number, columnKey: string, rawValue: any) => {
  if (!isColumnEditable(columnKey)) return;
  const parsed = parsePriceColumnKey(columnKey);
  if (!parsed) return;
  const row = variations.value[rowIndex];
  if (!row) return;
  const entry = ensurePriceEntry(row, parsed.isoCode);
  if (!entry) return;
  let value = rawValue;
  if (value === null || value === undefined || value === '') {
    entry[parsed.field] = '';
    return;
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue < 0) {
    entry[parsed.field] = '';
    return;
  }
  entry[parsed.field] = value.toString();
};

const setPriceListValue = (rowIndex: number, columnKey: string, rawValue: any) => {
  const parsed = parsePriceListColumnKey(columnKey);
  if (!parsed) return;
  const row = variations.value[rowIndex];
  if (!row) return;
  const entry = getPriceListEntry(row, parsed.priceListId);
  if (!entry || entry.readonly) return;
  let value = rawValue;
  if (value === null || value === undefined || value === '') {
    entry[parsed.field] = '';
    return;
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue) || numericValue < 0) {
    entry[parsed.field] = '';
    return;
  }
  entry[parsed.field] = value.toString();
};

const updateCellFromInput = (rowIndex: number, columnKey: string, value: string | number | null) => {
  if (parsePriceListColumnKey(columnKey)) {
    setPriceListValue(rowIndex, columnKey, value);
    return;
  }
  setPriceValue(rowIndex, columnKey, value);
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  if (parsePriceListColumnKey(columnKey)) {
    setPriceListValue(rowIndex, columnKey, value);
    return;
  }
  setPriceValue(rowIndex, columnKey, value);
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  if (parsePriceListColumnKey(columnKey)) {
    if (!isPriceListCellEditable(fromRow, columnKey)) return;
    const value = getMatrixCellValue(fromRow, columnKey);
    setPriceListValue(toRow, columnKey, value);
    return;
  }
  if (!isColumnEditable(columnKey)) return;
  const value = getMatrixCellValue(fromRow, columnKey);
  setPriceValue(toRow, columnKey, value);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  if (parsePriceListColumnKey(columnKey)) {
    setPriceListValue(rowIndex, columnKey, '');
    return;
  }
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

  return nodes.map((node: any) => {
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
      priceLists: {},
    };
  });
};

const loadPriceListItems = async (
  variationIds: string[],
  policy: FetchPolicy = 'cache-first'
) => {
  priceLists.value = [];
  if (!variationIds.length) {
    variations.value.forEach((row) => {
      row.priceLists = {};
    });
    return;
  }
  const pageSize = 100;
  let after: string | null = null;
  const nodes: any[] = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: salesPriceListItemsQuery,
      variables: {
        first: pageSize,
        after,
        filter: { product: { id: { inList: variationIds } } },
      },
      fetchPolicy: policy,
    });
    const connection = data?.salesPriceListItems;
    if (!connection) break;
    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => nodes.push(edge.node));
    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) break;
  }

  const priceListMap = new Map<string, PriceListInfo>();
  const itemsByProduct = new Map<string, any[]>();

  nodes.forEach((node: any) => {
    const productId = node.product?.id;
    const priceListNode = node.salespricelist;
    if (!productId || !priceListNode) return;
    priceListMap.set(priceListNode.id, {
      id: priceListNode.id,
      name: priceListNode.name,
      currency: {
        id: priceListNode.currency?.id,
        isoCode: priceListNode.currency?.isoCode,
        symbol: priceListNode.currency?.symbol,
      },
    });
    if (!itemsByProduct.has(productId)) {
      itemsByProduct.set(productId, []);
    }
    itemsByProduct.get(productId)!.push(node);
  });

  priceLists.value = Array.from(priceListMap.values());

  variations.value.forEach((row) => {
    row.priceLists = {};
    const rowItems = itemsByProduct.get(row.variation.id) ?? [];
    rowItems.forEach((item: any) => {
      const priceListId = item.salespricelist?.id;
      if (!priceListId) return;
      row.priceLists[priceListId] = {
        id: item.id ?? null,
        priceAuto: item.priceAuto != null ? String(item.priceAuto) : '',
        discountAuto: item.discountAuto != null ? String(item.discountAuto) : '',
        priceOverride: item.priceOverride != null ? String(item.priceOverride) : '',
        discountOverride:
          item.discountOverride != null ? String(item.discountOverride) : '',
        salesPriceListId: priceListId,
        readonly: false,
      };
    });
  });

  if (!priceLists.value.length) {
    return;
  }

  variations.value.forEach((row) => {
    priceLists.value.forEach((priceList) => {
      if (!row.priceLists[priceList.id]) {
        row.priceLists[priceList.id] = {
          id: null,
          priceAuto: '',
          discountAuto: '',
          priceOverride: '',
          discountOverride: '',
          salesPriceListId: priceList.id,
          readonly: true,
        };
      }
    });
  });
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    if (!currencies.value.length || policy === 'network-only') {
      await loadCurrencies(policy);
    }
    const variationRows = await fetchVariations(policy);
    variations.value = variationRows;
    await loadPriceListItems(
      variationRows.map((item) => item.variation.id),
      policy
    );
    variations.value = JSON.parse(JSON.stringify(variations.value));
    originalVariations.value = JSON.parse(JSON.stringify(variations.value));
    matrixRef.value?.resetHistory(variations.value);
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
    const priceListToCreate: any[] = [];
    const priceListToUpdate: any[] = [];

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

      priceLists.value.forEach((priceList) => {
        const current = row.priceLists?.[priceList.id];
        const previous = original?.priceLists?.[priceList.id];
        if (!current || current.readonly) {
          return;
        }
        const currentPriceOverride = current.priceOverride ?? '';
        const currentDiscountOverride = current.discountOverride ?? '';
        const previousPriceOverride = previous?.priceOverride ?? '';
        const previousDiscountOverride = previous?.discountOverride ?? '';
        if (
          currentPriceOverride === previousPriceOverride &&
          currentDiscountOverride === previousDiscountOverride
        ) {
          return;
        }
        if (current.id) {
          const updateData: Record<string, any> = { id: current.id };
          if (currentPriceOverride !== previousPriceOverride) {
            updateData.priceOverride = parsePriceValue(current.priceOverride);
          }
          if (currentDiscountOverride !== previousDiscountOverride) {
            updateData.discountOverride = parsePriceValue(current.discountOverride);
          }
          priceListToUpdate.push(updateData);
        } else {
          const priceOverrideValue = parsePriceValue(current.priceOverride);
          const discountOverrideValue = parsePriceValue(current.discountOverride);
          if (priceOverrideValue === null && discountOverrideValue === null) {
            return;
          }
          priceListToCreate.push({
            salespricelist: { id: priceList.id },
            product: { id: row.variation.id },
            priceOverride: priceOverrideValue,
            discountOverride: discountOverrideValue,
          });
        }
      });
    });

    const createdCount = toCreate.length;
    const updatedCount = toUpdate.length;
    const createdPriceListCount = priceListToCreate.length;
    const updatedPriceListCount = priceListToUpdate.length;

    if (!createdCount && !updatedCount && !createdPriceListCount && !updatedPriceListCount) {
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

    if (createdPriceListCount) {
      await apolloClient.mutate({
        mutation: createSalesPriceListItemsMutation,
        variables: { data: priceListToCreate },
      });
    }

    if (updatedPriceListCount) {
      for (const item of priceListToUpdate) {
        await apolloClient.mutate({
          mutation: updateSalesPriceListItemMutation,
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
    if (createdPriceListCount) {
      messages.push(
        t('products.products.variations.prices.toast.priceListCreated', {
          count: createdPriceListCount,
        })
      );
    }
    if (updatedPriceListCount) {
      messages.push(
        t('products.products.variations.prices.toast.priceListUpdated', {
          count: updatedPriceListCount,
        })
      );
    }
    if (messages.length) {
      Toast.success(messages.join('<br>'));
    }
  } catch (error) {
    console.error('Failed to save variation prices', error);
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
            {{ shortenText(row.variation.name, 32) }}
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
            :disabled="!isCellEditable(rowIndex, column.key) || loading || saving"
            @update:modelValue="(value) => updateCellFromInput(rowIndex, column.key, value)"
          />
        </template>
        <template v-else-if="isPriceListColumn(column.key)">
          <div class="flex flex-col gap-1">
            <TextInput
              class="w-full"
              :model-value="getMatrixCellValue(rowIndex, column.key)"
              float
              :disabled="!isCellEditable(rowIndex, column.key) || loading || saving"
              @update:modelValue="(value) => updateCellFromInput(rowIndex, column.key, value)"
            />
            <span class="text-xs text-gray-500">
              {{ getPriceListAutoLabel(rowIndex, column.key) }}
            </span>
          </div>
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
