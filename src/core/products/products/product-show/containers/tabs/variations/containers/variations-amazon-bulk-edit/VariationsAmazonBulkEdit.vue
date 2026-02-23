<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, withDefaults } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import MatrixEditor from '../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue';
import type { MatrixColumn, MatrixEditorExpose } from '../../../../../../../../../shared/components/organisms/matrix-editor/types';
import { Product } from '../../../../../../configs';
import { FieldType, ProductType } from '../../../../../../../../../shared/utils/constants';
import apolloClient from '../../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Card } from '../../../../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import { Link } from '../../../../../../../../../shared/components/atoms/link';
import { Selector } from '../../../../../../../../../shared/components/atoms/selector';
import { Toggle } from '../../../../../../../../../shared/components/atoms/toggle';
import { LocalLoader } from '../../../../../../../../../shared/components/atoms/local-loader';
import { Toast } from '../../../../../../../../../shared/modules/toast';
import { displayApolloError, shortenText } from '../../../../../../../../../shared/utils';
import {
  bundleVariationsWithAmazonQuery,
  configurableVariationsWithAmazonQuery,
  productsWithAmazonQuery,
} from '../../../../../../../../../shared/api/queries/products.js';
import { propertiesQuerySelector, productPropertiesQuery } from '../../../../../../../../../shared/api/queries/properties.js';
import { amazonChannelViewsQuery, amazonProductTypesQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import { amazonExternalProductIdsQuery } from '../../../../../../../../../shared/api/queries/amazonExternalProductIds.js';
import { amazonGtinExemptionsBulkQuery } from '../../../../../../../../../shared/api/queries/amazonGtinExemptions.js';
import {
  amazonBrowseNodesQuery,
  amazonProductBrowseNodesBulkQuery,
} from '../../../../../../../../../shared/api/queries/amazonProducts.js';
import { amazonVariationThemesQuery } from '../../../../../../../../../shared/api/queries/amazonVariationThemes.js';
import {
  createAmazonExternalProductIdMutation,
  deleteAmazonExternalProductIdMutation,
  updateAmazonExternalProductIdMutation,
} from '../../../../../../../../../shared/api/mutations/amazonExternalProductIds.js';
import {
  createAmazonGtinExemptionMutation,
  updateAmazonGtinExemptionMutation,
} from '../../../../../../../../../shared/api/mutations/amazonGtinExemptions.js';
import {
  createAmazonProductBrowseNodeMutation,
  deleteAmazonProductBrowseNodeMutation,
  updateAmazonProductBrowseNodeMutation,
} from '../../../../../../../../../shared/api/mutations/amazonProducts.js';
import {
  createAmazonVariationThemeMutation,
  deleteAmazonVariationThemeMutation,
  updateAmazonVariationThemeMutation,
} from '../../../../../../../../../shared/api/mutations/amazonVariationThemes.js';
import { FieldValue } from '../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-value';
import { FieldChoice } from '../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-choice';
import { ValueFormField, ChoiceFormField } from '../../../../../../../../../shared/components/organisms/general-form/formConfig';

interface ExternalProductIdSelection {
  id: string | null;
  type: string;
  value: string;
  createdAsin: string;
}

interface GtinExemptionSelection {
  id: string | null;
  value: boolean;
}

interface BrowseNodeSelection {
  id: string | null;
  remoteId: string | null;
  name: string | null;
  path: string | null;
}

interface VariationThemeSelection {
  id: string | null;
  theme: string | null;
}

interface VariationRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
    type: string | null;
  };
  externalIds: Record<string, ExternalProductIdSelection>;
  gtinExemptions: Record<string, GtinExemptionSelection>;
  browseNodes: Record<string, BrowseNodeSelection>;
  variationThemes: Record<string, VariationThemeSelection>;
  productTypeRuleId: string | null;
}

interface BrowseNode {
  id: string;
  remoteId: string;
  name: string;
  browsePathByName: string[];
  hasChildren: boolean;
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] },
);

const { t } = useI18n();

const externalIdColumnKey = 'externalProductId';
const gtinExemptionColumnKey = 'gtinExemption';
const browseNodeColumnKey = 'browseNode';
const variationThemeColumnKey = 'variationTheme';

const externalIdValueType = 'amazon-external-id';
const browseNodeValueType = 'amazon-browse-node';
const variationThemeValueType = 'amazon-variation-theme';

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const browseNodeMapByView = ref<Record<string, Record<string, BrowseNode>>>({});
const productTypePropertyId = ref<string | null>(null);

const amazonViews = ref<any[]>([]);
const selectedViewId = ref<string | null>(null);

const externalIdModal = reactive({
  visible: false,
  rowIndex: -1,
  viewId: null as string | null,
  type: 'ASIN',
  value: '',
  createdAsin: '',
});

const browseNodeModal = reactive({
  visible: false,
  rowIndex: -1,
  viewId: null as string | null,
});

const browseNodeNodes = ref<BrowseNode[]>([]);
const browseNodeLoading = ref(false);
const browseNodeParentId = ref<string | null>(null);
const browseNodePathStack = ref<BrowseNode[]>([]);
const browseNodeSearch = ref('');
const browseNodeSelection = ref<BrowseNode | null>(null);

const variationThemeOptions = ref<{ id: string; name: string }[]>([]);
const variationThemeOptionsLoading = ref(false);

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
  amazonViews.value.reduce<Record<string, any>>((acc, view) => {
    acc[view.id] = view;
    return acc;
  }, {}),
);

const viewKeyById = computed(() =>
  amazonViews.value.reduce<Record<string, string>>((acc, view) => {
    if (view?.id) {
      acc[view.id] = view.id;
    }
    if (view?.proxyId) {
      acc[view.proxyId] = view.id;
    }
    return acc;
  }, {}),
);

const getViewFilterIds = () =>
  Array.from(
    new Set(
      amazonViews.value
        .flatMap((view) => [view?.id, view?.proxyId])
        .filter((id): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

const viewOptions = computed(() =>
  amazonViews.value.map((view) => ({
    id: view.id,
    name: view.name || view.remoteId || view.salesChannel?.hostname || '-',
  })),
);

const browseNodeModalView = computed(() =>
  browseNodeModal.viewId ? viewById.value[browseNodeModal.viewId] : null,
);

const externalIdModalView = computed(() =>
  externalIdModal.viewId ? viewById.value[externalIdModal.viewId] : null,
);

const browseNodeMarketplaceId = computed(() => browseNodeModalView.value?.remoteId ?? null);

const configurableRows = computed(() =>
  variations.value.filter((row) => row.variation.type === ProductType.Configurable),
);

const variationThemeRuleIds = computed(() => {
  const ids = new Set<string | null>();
  configurableRows.value.forEach((row) => {
    ids.add(row.productTypeRuleId ?? null);
  });
  return ids;
});

const variationThemeHasMultipleRules = computed(
  () => configurableRows.value.length > 1 && variationThemeRuleIds.value.size > 1,
);

const variationThemeRuleId = computed(() => {
  if (!configurableRows.value.length) return null;
  if (variationThemeHasMultipleRules.value) return null;
  return Array.from(variationThemeRuleIds.value)[0] ?? null;
});

const showVariationThemeColumn = computed(
  () => configurableRows.value.length > 0 && !variationThemeHasMultipleRules.value,
);

const columns = computed<MatrixColumn[]>(() => {
  const base: MatrixColumn[] = [
    { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false, initialWidth: 160 },
    { key: 'name', label: t('shared.labels.name'), editable: false, initialWidth: 280 },
    { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 80 },
    {
      key: externalIdColumnKey,
      label: t('products.products.amazon.externalProductId'),
      editable: true,
      initialWidth: 260,
      valueType: externalIdValueType,
    },
    {
      key: gtinExemptionColumnKey,
      label: t('products.products.amazon.gtinExemption'),
      editable: true,
      initialWidth: 160,
      valueType: 'boolean',
    },
    {
      key: browseNodeColumnKey,
      label: t('products.products.amazon.browseNode'),
      editable: true,
      initialWidth: 320,
      valueType: browseNodeValueType,
    },
  ];

  if (showVariationThemeColumn.value) {
    base.push({
      key: variationThemeColumnKey,
      label: t('products.products.amazon.variationTheme'),
      editable: true,
      initialWidth: 240,
      valueType: variationThemeValueType,
    });
  }

  return base;
});

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
    return amazonViews.value.some((view) => {
      const viewId = view.id;
      const currentExternal = row.externalIds[viewId] || createEmptyExternalId();
      const originalExternal = original.externalIds[viewId] || createEmptyExternalId();
      const currentValue = currentExternal.value.trim();
      const originalValue = originalExternal.value.trim();
      const compareType = Boolean(currentValue || originalValue);
      if (currentValue !== originalValue) return true;
      if (compareType && currentExternal.type !== originalExternal.type) return true;

      const currentGtin = row.gtinExemptions[viewId]?.value ?? false;
      const originalGtin = original.gtinExemptions[viewId]?.value ?? false;
      if (currentGtin !== originalGtin) return true;

      const currentBrowseNode = row.browseNodes[viewId]?.remoteId ?? null;
      const originalBrowseNode = original.browseNodes[viewId]?.remoteId ?? null;
      if (currentBrowseNode !== originalBrowseNode) return true;

      const currentTheme = row.variationThemes[viewId]?.theme ?? null;
      const originalTheme = original.variationThemes[viewId]?.theme ?? null;
      return currentTheme !== originalTheme;
    });
  });
});

const hasUnsavedChanges = hasChanges;

const typeOptions = [
  { label: 'ASIN', value: 'ASIN' },
  { label: 'UPC', value: 'UPC' },
  { label: 'ISBN', value: 'ISBN' },
  { label: 'GCID', value: 'GCID' },
  { label: 'GTIN', value: 'GTIN' },
  { label: 'JAN', value: 'JAN' },
];

const typeField = (): ChoiceFormField => ({
  type: FieldType.Choice,
  name: 'type',
  label: t('products.products.amazon.identifierType'),
  options: typeOptions,
  labelBy: 'label',
  valueBy: 'value',
});

const valueField = (): ValueFormField => ({
  type: FieldType.Text,
  name: 'value',
  label: t('products.products.amazon.identifierValue'),
  placeholder: t('products.products.amazon.externalProductIdPlaceholder'),
});

const createEmptyExternalId = (): ExternalProductIdSelection => ({
  id: null,
  type: 'ASIN',
  value: '',
  createdAsin: '',
});

const createEmptyGtinExemption = (): GtinExemptionSelection => ({
  id: null,
  value: false,
});

const createEmptyBrowseNode = (): BrowseNodeSelection => ({
  id: null,
  remoteId: null,
  name: null,
  path: null,
});

const createEmptyVariationTheme = (): VariationThemeSelection => ({
  id: null,
  theme: null,
});

const ensureExternalId = (row: VariationRow, viewId: string) => {
  if (!row.externalIds[viewId]) {
    row.externalIds[viewId] = createEmptyExternalId();
  }
  return row.externalIds[viewId];
};

const ensureGtinExemption = (row: VariationRow, viewId: string) => {
  if (!row.gtinExemptions[viewId]) {
    row.gtinExemptions[viewId] = createEmptyGtinExemption();
  }
  return row.gtinExemptions[viewId];
};

const ensureBrowseNode = (row: VariationRow, viewId: string) => {
  if (!row.browseNodes[viewId]) {
    row.browseNodes[viewId] = createEmptyBrowseNode();
  }
  return row.browseNodes[viewId];
};

const ensureVariationTheme = (row: VariationRow, viewId: string) => {
  if (!row.variationThemes[viewId]) {
    row.variationThemes[viewId] = createEmptyVariationTheme();
  }
  return row.variationThemes[viewId];
};

const getExternalIdSelection = (row: VariationRow) => {
  if (!selectedViewId.value) return null;
  return row.externalIds[selectedViewId.value] || null;
};

const getBrowseNodeSelection = (row: VariationRow) => {
  if (!selectedViewId.value) return null;
  return row.browseNodes[selectedViewId.value] || null;
};

const getVariationThemeSelection = (row: VariationRow) => {
  if (!selectedViewId.value) return null;
  return row.variationThemes[selectedViewId.value] || null;
};

const getBrowseNodeDisplayPath = (row: VariationRow) => {
  const selection = getBrowseNodeSelection(row);
  if (!selection?.remoteId) return null;
  return selection.path || selection.name || selection.remoteId;
};

const formatBrowseNodePath = (node: BrowseNode) => {
  if (node.browsePathByName?.length) {
    return node.browsePathByName.join(' > ');
  }
  return node.name || node.remoteId;
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
  if (!selectedViewId.value) return null;
  const viewId = selectedViewId.value;

  if (columnKey === externalIdColumnKey) {
    const selection = row.externalIds[viewId];
    if (!selection?.value) return null;
    return { type: selection.type, value: selection.value };
  }

  if (columnKey === gtinExemptionColumnKey) {
    return row.gtinExemptions[viewId]?.value ?? false;
  }

  if (columnKey === browseNodeColumnKey) {
    const selection = row.browseNodes[viewId];
    if (!selection?.remoteId) return null;
    return {
      remoteId: selection.remoteId,
      path: selection.path,
      name: selection.name,
    };
  }

  if (columnKey === variationThemeColumnKey) {
    return row.variationThemes[viewId]?.theme ?? null;
  }

  return null;
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  const row = variations.value[rowIndex];
  if (!row || !selectedViewId.value) return;
  const viewId = selectedViewId.value;

  if (columnKey === externalIdColumnKey) {
    const selection = ensureExternalId(row, viewId);
    if (value === null || value === undefined || value === '') {
      selection.value = '';
      selection.type = selection.type || 'ASIN';
      return;
    }
    if (typeof value === 'object') {
      selection.type = value.type || selection.type || 'ASIN';
      selection.value = value.value ?? '';
      return;
    }
    selection.value = String(value);
    return;
  }

  if (columnKey === gtinExemptionColumnKey) {
    const selection = ensureGtinExemption(row, viewId);
    if (typeof value === 'boolean') {
      selection.value = value;
      return;
    }
    if (value === 'true' || value === 'false') {
      selection.value = value === 'true';
      return;
    }
    selection.value = Boolean(value);
    return;
  }

  if (columnKey === browseNodeColumnKey) {
    const selection = ensureBrowseNode(row, viewId);
    if (!value) {
      selection.remoteId = null;
      selection.name = null;
      selection.path = null;
      return;
    }
    if (typeof value === 'object') {
      selection.remoteId = value.remoteId ?? null;
      selection.name = value.name ?? selection.name;
      selection.path = value.path ?? selection.path;
      return;
    }
    const remoteId = String(value);
    const node = browseNodeMapByView.value[viewId]?.[remoteId];
    selection.remoteId = remoteId;
    selection.name = node?.name ?? selection.name;
    selection.path = node ? formatBrowseNodePath(node) : selection.path;
    return;
  }

  if (columnKey === variationThemeColumnKey) {
    if (isVariationThemeDisabled(row)) {
      return;
    }
    const selection = ensureVariationTheme(row, viewId);
    if (!value) {
      selection.theme = null;
      return;
    }
    selection.theme = String(value);
  }
};

const cloneMatrixCellValue = (fromRow: number, toRow: number, columnKey: string) => {
  const value = getMatrixCellValue(fromRow, columnKey);
  const clonedValue = value && typeof value === 'object' ? { ...(value as Record<string, any>) } : value;
  setMatrixCellValue(toRow, columnKey, clonedValue ?? null);
};

const clearMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  if (!row || !selectedViewId.value) return;
  const viewId = selectedViewId.value;

  if (columnKey === externalIdColumnKey) {
    const selection = ensureExternalId(row, viewId);
    selection.value = '';
    return;
  }
  if (columnKey === gtinExemptionColumnKey) {
    const selection = ensureGtinExemption(row, viewId);
    selection.value = false;
    return;
  }
  if (columnKey === browseNodeColumnKey) {
    const selection = ensureBrowseNode(row, viewId);
    selection.remoteId = null;
    selection.name = null;
    selection.path = null;
    return;
  }
  if (columnKey === variationThemeColumnKey) {
    if (isVariationThemeDisabled(row)) {
      return;
    }
    const selection = ensureVariationTheme(row, viewId);
    selection.theme = null;
  }
};

const fetchAmazonViews = async () => {
  try {
    const { data } = await apolloClient.query({
      query: amazonChannelViewsQuery,
      fetchPolicy: 'cache-first',
    });
    const list = data?.amazonChannelViews?.edges?.map((edge: any) => edge.node) || [];
    amazonViews.value = list.sort((a: any, b: any) => {
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
    amazonViews.value = [];
    displayApolloError(error);
  }
};

const fetchVariations = async (policy: FetchPolicy = 'cache-first') => {
  if (!parentProduct.value || !parentProductType.value) {
    return [];
  }
  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsWithAmazonQuery : configurableVariationsWithAmazonQuery;
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
        type: variationProduct.type ?? null,
      },
      externalIds: {},
      gtinExemptions: {},
      browseNodes: {},
      variationThemes: {},
      productTypeRuleId: null,
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
      query: productsWithAmazonQuery,
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
      type: node.type ?? null,
    },
    externalIds: {},
    gtinExemptions: {},
    browseNodes: {},
    variationThemes: {},
    productTypeRuleId: null,
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
    return productTypePropertyId.value;
  } catch (error) {
    displayApolloError(error);
    productTypePropertyId.value = null;
    return null;
  }
};

const fetchProductTypeRules = async (productIds: string[], policy: FetchPolicy) => {
  const rulesByProductId = new Map<string, string | null>();
  if (!productIds.length) {
    return rulesByProductId;
  }
  const propertyId = await fetchProductTypeProperty(policy);
  if (!propertyId) {
    return rulesByProductId;
  }
  const pageSize = 100;
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: productPropertiesQuery,
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
      const ruleId = node?.valueSelect?.productpropertiesruleSet?.[0]?.id ?? null;
      rulesByProductId.set(String(productId), ruleId);
    });
    const pageInfo = data?.productProperties?.pageInfo;
    hasNextPage = Boolean(pageInfo?.hasNextPage && pageInfo?.endCursor);
    after = pageInfo?.endCursor ?? null;
  }

  return rulesByProductId;
};

const fetchExternalProductIds = async (
  productIds: string[],
  viewIds: string[],
  policy: FetchPolicy,
) => {
  const map = new Map<string, Map<string, ExternalProductIdSelection>>();
  if (!productIds.length || !viewIds.length) {
    return map;
  }
  const pageSize = 100;
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: amazonExternalProductIdsQuery,
      variables: {
        first: pageSize,
        after,
        filter: {
          product: { id: { inList: productIds } },
          view: { id: { inList: viewIds } },
        },
      },
      fetchPolicy: policy,
    });
    const edges = data?.amazonExternalProductIds?.edges ?? [];
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const productId = node?.product?.id;
      const viewId = node?.view?.id;
      if (!productId || !viewId) return;
      const productMap = map.get(String(productId)) || new Map();
      productMap.set(String(viewId), {
        id: node?.id ?? null,
        type: node?.type || 'ASIN',
        value: node?.value || '',
        createdAsin: node?.createdAsin || '',
      });
      map.set(String(productId), productMap);
    });
    const pageInfo = data?.amazonExternalProductIds?.pageInfo;
    hasNextPage = Boolean(pageInfo?.hasNextPage && pageInfo?.endCursor);
    after = pageInfo?.endCursor ?? null;
  }

  return map;
};

const fetchGtinExemptions = async (
  productIds: string[],
  viewIds: string[],
  policy: FetchPolicy,
) => {
  const map = new Map<string, Map<string, GtinExemptionSelection>>();
  if (!productIds.length || !viewIds.length) {
    return map;
  }
  const pageSize = 100;
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: amazonGtinExemptionsBulkQuery,
      variables: {
        first: pageSize,
        after,
        filter: {
          product: { id: { inList: productIds } },
          view: { id: { inList: viewIds } },
        },
      },
      fetchPolicy: policy,
    });
    const edges = data?.amazonGtinExemptions?.edges ?? [];
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const productId = node?.product?.id;
      const viewId = node?.view?.id;
      if (!productId || !viewId) return;
      const productMap = map.get(String(productId)) || new Map();
      productMap.set(String(viewId), {
        id: node?.id ?? null,
        value: Boolean(node?.value),
      });
      map.set(String(productId), productMap);
    });
    const pageInfo = data?.amazonGtinExemptions?.pageInfo;
    hasNextPage = Boolean(pageInfo?.hasNextPage && pageInfo?.endCursor);
    after = pageInfo?.endCursor ?? null;
  }

  return map;
};

const fetchProductBrowseNodes = async (
  productIds: string[],
  viewIds: string[],
  policy: FetchPolicy,
) => {
  const map = new Map<string, Map<string, { id: string; remoteId: string }>>();
  if (!productIds.length || !viewIds.length) {
    return map;
  }
  const pageSize = 100;
  let after: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: amazonProductBrowseNodesBulkQuery,
      variables: {
        first: pageSize,
        after,
        filter: {
          product: { id: { inList: productIds } },
          view: { id: { inList: viewIds } },
        },
      },
      fetchPolicy: policy,
    });
    const edges = data?.amazonProductBrowseNodes?.edges ?? [];
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const productId = node?.product?.id;
      const rawViewId = node?.view?.id;
      const resolvedViewId = rawViewId ? (viewKeyById.value[rawViewId] || rawViewId) : null;
      if (!productId || !resolvedViewId || !node?.recommendedBrowseNodeId) return;
      const productMap = map.get(String(productId)) || new Map();
      productMap.set(String(resolvedViewId), {
        id: node.id,
        remoteId: node.recommendedBrowseNodeId,
      });
      map.set(String(productId), productMap);
    });
    const pageInfo = data?.amazonProductBrowseNodes?.pageInfo;
    hasNextPage = Boolean(pageInfo?.hasNextPage && pageInfo?.endCursor);
    after = pageInfo?.endCursor ?? null;
  }
  return map;
};

const fetchVariationThemes = async (
  productIds: string[],
  viewIds: string[],
  policy: FetchPolicy,
) => {
  const map = new Map<string, Map<string, VariationThemeSelection>>();
  if (!productIds.length || !viewIds.length) {
    return map;
  }
  const { data } = await apolloClient.query({
    query: amazonVariationThemesQuery,
    variables: {
      filter: {
        product: { id: { inList: productIds } },
        view: { id: { inList: viewIds } },
      },
    },
    fetchPolicy: policy,
  });
  const edges = data?.amazonVariationThemes?.edges ?? [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const productId = node?.product?.id;
    const viewId = node?.view?.id;
    if (!productId || !viewId) return;
    const productMap = map.get(String(productId)) || new Map();
    productMap.set(String(viewId), {
      id: node?.id ?? null,
      theme: node?.theme ?? null,
    });
    map.set(String(productId), productMap);
  });
  return map;
};

const ensureBrowseNodeMapForView = async (
  viewId: string,
  remoteIds: string[],
  policy: FetchPolicy,
) => {
  const view = viewById.value[viewId];
  if (!view?.remoteId || !remoteIds.length) return;
  const map = { ...(browseNodeMapByView.value[viewId] || {}) };
  const pending = new Set<string>(remoteIds.filter((id) => id && !map[id]));

  while (pending.size) {
    const batch = Array.from(pending).slice(0, 50);
    batch.forEach((id) => pending.delete(id));
    const { data } = await apolloClient.query({
      query: amazonBrowseNodesQuery,
      variables: {
        filter: {
          marketplaceId: { exact: view.remoteId },
          remoteId: { inList: batch },
        },
      },
      fetchPolicy: policy,
    });
    const nodes = data?.amazonBrowseNodes?.edges?.map((edge: any) => edge.node) || [];
    nodes.forEach((node: BrowseNode) => {
      map[node.remoteId] = node;
    });
  }

  browseNodeMapByView.value = {
    ...browseNodeMapByView.value,
    [viewId]: map,
  };
};

const loadVariationThemeOptions = async (ruleId: string | null) => {
  if (!ruleId) {
    variationThemeOptions.value = [];
    return;
  }
  variationThemeOptionsLoading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: amazonProductTypesQuery,
      variables: {
        first: 1,
        filter: { localInstance: { id: { exact: ruleId } } },
      },
      fetchPolicy: 'cache-first',
    });
    const node = data?.amazonProductTypes?.edges?.[0]?.node;
    if (!node?.mappedLocally) {
      variationThemeOptions.value = [];
      return;
    }
    const themes: string[] = node?.variationThemes || [];
    variationThemeOptions.value = themes.map((theme: string) => ({ id: theme, name: theme }));
  } catch (error) {
    variationThemeOptions.value = [];
    displayApolloError(error);
  } finally {
    variationThemeOptionsLoading.value = false;
  }
};

const loadData = async (policy: FetchPolicy = 'cache-first') => {
  loading.value = true;
  try {
    if (!amazonViews.value.length) {
      await fetchAmazonViews();
    }
    let variationRows: VariationRow[] = [];
    if (hasProductIds.value) {
      variationRows = await fetchProducts(policy);
    } else if (props.product) {
      variationRows = await fetchVariations(policy);
    }

    const productIds = variationRows.map((row) => row.variation.id).filter(Boolean);
    const viewIds = amazonViews.value.map((view) => view.id).filter(Boolean);
    const viewFilterIds = getViewFilterIds();
    const [
      externalIdsByProductId,
      gtinExemptionsByProductId,
      browseNodesByProductId,
      variationThemesByProductId,
      productTypeRulesByProductId,
    ] = await Promise.all([
      fetchExternalProductIds(productIds, viewIds, policy),
      fetchGtinExemptions(productIds, viewIds, policy),
      fetchProductBrowseNodes(productIds, viewFilterIds, policy),
      fetchVariationThemes(productIds, viewIds, policy),
      fetchProductTypeRules(productIds, policy),
    ]);

    const browseNodeIdsByView: Record<string, Set<string>> = {};
    browseNodesByProductId.forEach((viewMap) => {
      viewMap.forEach((entry, viewId) => {
        if (!browseNodeIdsByView[viewId]) {
          browseNodeIdsByView[viewId] = new Set<string>();
        }
        if (entry.remoteId) {
          browseNodeIdsByView[viewId].add(entry.remoteId);
        }
      });
    });

    browseNodeMapByView.value = {};
    await Promise.all(
      Object.entries(browseNodeIdsByView).map(([viewId, ids]) =>
        ensureBrowseNodeMapForView(viewId, Array.from(ids), policy),
      ),
    );

    const rowsWithData = variationRows.map((row) => {
      const externalIds: Record<string, ExternalProductIdSelection> = {};
      const gtinExemptions: Record<string, GtinExemptionSelection> = {};
      const browseNodes: Record<string, BrowseNodeSelection> = {};
      const variationThemes: Record<string, VariationThemeSelection> = {};

      const externalMap = externalIdsByProductId.get(row.variation.id) || new Map();
      const gtinMap = gtinExemptionsByProductId.get(row.variation.id) || new Map();
      const browseMap = browseNodesByProductId.get(row.variation.id) || new Map();
      const themeMap = variationThemesByProductId.get(row.variation.id) || new Map();

      amazonViews.value.forEach((view) => {
        const externalEntry = externalMap.get(view.id) || null;
        externalIds[view.id] = externalEntry
          ? { ...externalEntry }
          : createEmptyExternalId();

        const gtinEntry = gtinMap.get(view.id) || null;
        gtinExemptions[view.id] = gtinEntry
          ? { ...gtinEntry }
          : createEmptyGtinExemption();

        const browseEntry = browseMap.get(view.id) || null;
        if (browseEntry?.remoteId) {
          const node = browseNodeMapByView.value[view.id]?.[browseEntry.remoteId] || null;
          browseNodes[view.id] = {
            id: browseEntry.id,
            remoteId: browseEntry.remoteId,
            name: node?.name || null,
            path: node ? formatBrowseNodePath(node) : browseEntry.remoteId,
          };
        } else {
          browseNodes[view.id] = createEmptyBrowseNode();
        }

        const themeEntry = themeMap.get(view.id) || null;
        variationThemes[view.id] = themeEntry
          ? { ...themeEntry }
          : createEmptyVariationTheme();
      });

      return {
        ...row,
        externalIds,
        gtinExemptions,
        browseNodes,
        variationThemes,
        productTypeRuleId: productTypeRulesByProductId.get(row.variation.id) ?? null,
      };
    });

    variations.value = rowsWithData;
    originalVariations.value = JSON.parse(JSON.stringify(rowsWithData));
    matrixRef.value?.resetHistory(rowsWithData);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!hasChanges.value || saving.value) return;
  if (!amazonViews.value.length) {
    Toast.error(t('products.products.variations.amazon.noViews'));
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
      for (const view of amazonViews.value) {
        const viewId = view.id;

        const currentExternal = row.externalIds[viewId] || createEmptyExternalId();
        const originalExternal = original?.externalIds[viewId] || createEmptyExternalId();
        const currentExternalValue = currentExternal.value.trim();
        const originalExternalValue = originalExternal.value.trim();
        const compareExternalType = Boolean(currentExternalValue || originalExternalValue);
        if (
          currentExternalValue !== originalExternalValue ||
          (compareExternalType && currentExternal.type !== originalExternal.type)
        ) {
          if (!currentExternalValue) {
            if (currentExternal.id) {
              await apolloClient.mutate({
                mutation: deleteAmazonExternalProductIdMutation,
                variables: { id: currentExternal.id },
              });
              currentExternal.id = null;
              currentExternal.createdAsin = '';
            }
          } else if (currentExternal.id) {
            const { data } = await apolloClient.mutate({
              mutation: updateAmazonExternalProductIdMutation,
              variables: {
                data: { id: currentExternal.id, type: currentExternal.type, value: currentExternalValue },
              },
            });
            currentExternal.createdAsin = data?.updateAmazonExternalProductId?.createdAsin || currentExternal.createdAsin;
          } else {
            const { data } = await apolloClient.mutate({
              mutation: createAmazonExternalProductIdMutation,
              variables: {
                data: {
                  product: { id: row.variation.id },
                  view: { id: viewId },
                  type: currentExternal.type,
                  value: currentExternalValue,
                },
              },
            });
            currentExternal.id = data?.createAmazonExternalProductId?.id || null;
            currentExternal.createdAsin = data?.createAmazonExternalProductId?.createdAsin || '';
          }
        }

        const currentGtin = row.gtinExemptions[viewId] || createEmptyGtinExemption();
        const originalGtin = original?.gtinExemptions[viewId] || createEmptyGtinExemption();
        if (currentGtin.value !== originalGtin.value) {
          if (currentGtin.id) {
            const { data } = await apolloClient.mutate({
              mutation: updateAmazonGtinExemptionMutation,
              variables: { data: { id: currentGtin.id, value: currentGtin.value } },
            });
            currentGtin.id = data?.updateAmazonGtinExemption?.id || currentGtin.id;
          } else {
            const { data } = await apolloClient.mutate({
              mutation: createAmazonGtinExemptionMutation,
              variables: {
                data: {
                  product: { id: row.variation.id },
                  view: { id: viewId },
                  value: currentGtin.value,
                },
              },
            });
            currentGtin.id = data?.createAmazonGtinExemption?.id || null;
          }
        }

        const currentBrowseNode = row.browseNodes[viewId] || createEmptyBrowseNode();
        const originalBrowseNode = original?.browseNodes[viewId] || createEmptyBrowseNode();
        if (currentBrowseNode.remoteId !== originalBrowseNode.remoteId) {
          if (!currentBrowseNode.remoteId) {
            if (currentBrowseNode.id) {
              await apolloClient.mutate({
                mutation: deleteAmazonProductBrowseNodeMutation,
                variables: { data: { id: currentBrowseNode.id } },
              });
              currentBrowseNode.id = null;
            }
          } else if (currentBrowseNode.id) {
            await apolloClient.mutate({
              mutation: updateAmazonProductBrowseNodeMutation,
              variables: {
                data: {
                  id: currentBrowseNode.id,
                  recommendedBrowseNodeId: currentBrowseNode.remoteId,
                },
              },
            });
          } else if (view?.salesChannel?.id) {
            const { data } = await apolloClient.mutate({
              mutation: createAmazonProductBrowseNodeMutation,
              variables: {
                data: {
                  product: { id: row.variation.id },
                  salesChannel: { id: view.salesChannel.id },
                  view: { id: viewId },
                  recommendedBrowseNodeId: currentBrowseNode.remoteId,
                },
              },
            });
            currentBrowseNode.id = data?.createAmazonProductBrowseNode?.id || null;
          }
        }

        const currentTheme = row.variationThemes[viewId] || createEmptyVariationTheme();
        const originalTheme = original?.variationThemes[viewId] || createEmptyVariationTheme();
        if (currentTheme.theme !== originalTheme.theme) {
          if (!currentTheme.theme) {
            if (currentTheme.id) {
              await apolloClient.mutate({
                mutation: deleteAmazonVariationThemeMutation,
                variables: { id: currentTheme.id },
              });
              currentTheme.id = null;
            }
          } else if (currentTheme.id) {
            await apolloClient.mutate({
              mutation: updateAmazonVariationThemeMutation,
              variables: { data: { id: currentTheme.id, theme: currentTheme.theme } },
            });
          } else {
            const { data } = await apolloClient.mutate({
              mutation: createAmazonVariationThemeMutation,
              variables: {
                data: {
                  product: { id: row.variation.id },
                  view: { id: viewId },
                  theme: currentTheme.theme,
                },
              },
            });
            currentTheme.id = data?.createAmazonVariationTheme?.id || null;
          }
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

const openExternalIdModal = (rowIndex: number) => {
  if (!selectedViewId.value) return;
  const row = variations.value[rowIndex];
  if (!row) return;
  const selection = row.externalIds[selectedViewId.value] || createEmptyExternalId();
  externalIdModal.rowIndex = rowIndex;
  externalIdModal.viewId = selectedViewId.value;
  externalIdModal.type = selection.type || 'ASIN';
  externalIdModal.value = selection.value || '';
  externalIdModal.createdAsin = selection.createdAsin || '';
  externalIdModal.visible = true;
};

const closeExternalIdModal = () => {
  externalIdModal.visible = false;
  externalIdModal.rowIndex = -1;
  externalIdModal.viewId = null;
  externalIdModal.type = 'ASIN';
  externalIdModal.value = '';
  externalIdModal.createdAsin = '';
};

const saveExternalIdModal = () => {
  if (externalIdModal.rowIndex < 0 || !externalIdModal.viewId) {
    closeExternalIdModal();
    return;
  }
  const row = variations.value[externalIdModal.rowIndex];
  if (!row) return;
  const selection = ensureExternalId(row, externalIdModal.viewId);
  selection.type = externalIdModal.type || 'ASIN';
  selection.value = externalIdModal.value || '';
  closeExternalIdModal();
};

const openBrowseNodeModal = (rowIndex: number) => {
  if (!selectedViewId.value) return;
  const row = variations.value[rowIndex];
  if (!row) return;
  browseNodeModal.rowIndex = rowIndex;
  browseNodeModal.viewId = selectedViewId.value;
  browseNodeSelection.value = null;
  const current = row.browseNodes[selectedViewId.value];
  if (current?.remoteId) {
    browseNodeSelection.value = {
      id: current.id || '',
      remoteId: current.remoteId,
      name: current.name || current.remoteId,
      browsePathByName: current.path ? current.path.split(' > ') : [],
      hasChildren: false,
    };
  }
  browseNodeSearch.value = '';
  browseNodeParentId.value = null;
  browseNodePathStack.value = [];
  browseNodeModal.visible = true;
};

const closeBrowseNodeModal = () => {
  browseNodeModal.visible = false;
  browseNodeModal.rowIndex = -1;
  browseNodeModal.viewId = null;
  browseNodeSelection.value = null;
  browseNodeSearch.value = '';
  browseNodeParentId.value = null;
  browseNodePathStack.value = [];
};

const updateBrowseNodeSelection = (node: BrowseNode) => {
  browseNodeSelection.value = node;
  if (!browseNodeModal.viewId) return;
  browseNodeMapByView.value = {
    ...browseNodeMapByView.value,
    [browseNodeModal.viewId]: {
      ...(browseNodeMapByView.value[browseNodeModal.viewId] || {}),
      [node.remoteId]: node,
    },
  };
};

const applyBrowseNodeSelection = () => {
  if (!browseNodeSelection.value || browseNodeModal.rowIndex < 0 || !browseNodeModal.viewId) return;
  const row = variations.value[browseNodeModal.rowIndex];
  if (!row) return;
  const selection = ensureBrowseNode(row, browseNodeModal.viewId);
  selection.remoteId = browseNodeSelection.value.remoteId;
  selection.name = browseNodeSelection.value.name || browseNodeSelection.value.remoteId;
  selection.path = formatBrowseNodePath(browseNodeSelection.value);
  closeBrowseNodeModal();
};

const fetchBrowseNodes = async () => {
  if (!browseNodeMarketplaceId.value || !browseNodeModal.visible) return;
  browseNodeLoading.value = true;
  try {
    const filter: any = { marketplaceId: { exact: browseNodeMarketplaceId.value } };
    if (!browseNodeParentId.value) {
      filter.isRoot = { exact: true };
    } else {
      filter.parentNode = { remoteId: { exact: browseNodeParentId.value } };
    }
    const { data } = await apolloClient.query({
      query: amazonBrowseNodesQuery,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });
    const nodes = data?.amazonBrowseNodes?.edges?.map((edge: any) => edge.node) || [];
    browseNodeNodes.value = nodes;
    if (browseNodeModal.viewId) {
      const map = { ...(browseNodeMapByView.value[browseNodeModal.viewId] || {}) };
      nodes.forEach((node: BrowseNode) => {
        map[node.remoteId] = node;
      });
      browseNodeMapByView.value = {
        ...browseNodeMapByView.value,
        [browseNodeModal.viewId]: map,
      };
    }
  } catch (error) {
    browseNodeNodes.value = [];
    displayApolloError(error);
  } finally {
    browseNodeLoading.value = false;
  }
};

const filteredBrowseNodes = computed(() =>
  browseNodeNodes.value.filter((node) =>
    node.name.toLowerCase().includes(browseNodeSearch.value.toLowerCase()),
  ),
);

const browseNodeSelectionPath = computed(() => {
  if (!browseNodeSelection.value) return null;
  if (browseNodeSelection.value.browsePathByName?.length) {
    return browseNodeSelection.value.browsePathByName.join(' > ');
  }
  return browseNodeSelection.value.name || browseNodeSelection.value.remoteId;
});

const goToChild = (node: BrowseNode) => {
  browseNodeSearch.value = '';
  browseNodePathStack.value.push(node);
  browseNodeParentId.value = node.remoteId;
};

const goToLevel = (index: number | null) => {
  browseNodeSearch.value = '';
  if (index === null) {
    browseNodePathStack.value = [];
    browseNodeParentId.value = null;
    return;
  }
  browseNodePathStack.value = browseNodePathStack.value.slice(0, index + 1);
  browseNodeParentId.value = browseNodePathStack.value[index].remoteId;
};

const goBack = () => {
  browseNodeSearch.value = '';
  if (!browseNodePathStack.value.length) {
    goToLevel(null);
    return;
  }
  const target = browseNodePathStack.value.length - 2;
  goToLevel(target >= 0 ? target : null);
};

const selectCurrent = () => {
  const node = browseNodePathStack.value[browseNodePathStack.value.length - 1];
  if (node) {
    updateBrowseNodeSelection(node);
  }
};

const getVariationThemePlaceholder = (row: VariationRow) => {
  if (row.variation.type !== ProductType.Configurable) {
    return t('products.products.variations.amazon.variationTheme.notConfigurable');
  }
  if (variationThemeOptionsLoading.value) {
    return t('shared.labels.loading');
  }
  if (!variationThemeRuleId.value) {
    return t('products.products.variations.amazon.variationTheme.missingRule');
  }
  if (!variationThemeOptions.value.length) {
    return t('products.products.variations.amazon.variationTheme.missingProductType');
  }
  return t('products.products.amazon.variationThemePlaceholder');
};

const getVariationThemeError = (row: VariationRow) => {
  if (row.variation.type !== ProductType.Configurable) {
    return null;
  }
  if (variationThemeOptionsLoading.value) {
    return null;
  }
  if (!variationThemeRuleId.value) {
    return t('products.products.variations.amazon.variationTheme.missingRule');
  }
  if (!variationThemeOptions.value.length) {
    return t('products.products.variations.amazon.variationTheme.missingProductType');
  }
  return null;
};

const isVariationThemeDisabled = (row: VariationRow) => {
  if (saving.value || variationThemeOptionsLoading.value) return true;
  if (row.variation.type !== ProductType.Configurable) return true;
  if (!variationThemeRuleId.value) return true;
  if (!variationThemeOptions.value.length) return true;
  return false;
};

watch(
  viewOptions,
  (options) => {
    if (!options.length) {
      selectedViewId.value = null;
      return;
    }
    if (selectedViewId.value && options.some((opt) => opt.id === selectedViewId.value)) {
      return;
    }
    const defaultView = amazonViews.value.find((view: any) => view.isDefault);
    selectedViewId.value = defaultView?.id || options[0].id;
  },
  { immediate: true },
);

watch(
  () => variationThemeRuleId.value,
  async (ruleId) => {
    await loadVariationThemeOptions(ruleId);
  },
  { immediate: true },
);

watch(
  () => [browseNodeModal.visible, browseNodeMarketplaceId.value, browseNodeParentId.value],
  () => {
    if (!browseNodeModal.visible) return;
    fetchBrowseNodes();
  },
);

onMounted(async () => {
  await fetchAmazonViews();
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
            v-if="viewOptions.length"
            v-model="selectedViewId"
            :options="viewOptions"
            class="w-72"
            :placeholder="t('products.products.variations.amazon.selectors.marketplace')"
            :removable="false"
            labelBy="name"
            valueBy="id"
            filterable
          />
          <div
            v-else
            class="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            {{ t('products.products.variations.amazon.noViews') }}
          </div>
        </div>
        <div
          v-if="variationThemeHasMultipleRules"
          class="mt-3 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <Icon name="triangle-exclamation" class="mt-0.5 h-4 w-4 text-amber-500" />
          <span>{{ t('products.products.variations.amazon.warnings.multipleRules') }}</span>
        </div>
      </template>
      <template #cell="{ row, column, rowIndex }">
        <template v-if="column.key === 'name'">
          <Link
            :path="{ name: 'products.products.show', params: { id: row.variation.id }, query: { tab: 'amazon' } }"
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
        <template v-else-if="column.key === externalIdColumnKey">
          <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="text-sm font-medium whitespace-normal break-words">
                {{ getExternalIdSelection(row)?.value || '-' }}
              </div>
              <div class="text-xs text-gray-500">
                {{ getExternalIdSelection(row)?.type || 'ASIN' }}
              </div>
            </div>
            <Button
              class="p-2 text-primary hover:bg-blue-50 rounded"
              :title="t('products.products.variations.amazon.actions.setExternalProductId')"
              :aria-label="t('products.products.variations.amazon.actions.setExternalProductId')"
              :disabled="saving || !selectedViewId"
              @click="openExternalIdModal(rowIndex)"
            >
              <Icon name="edit" class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </template>
        <template v-else-if="column.key === gtinExemptionColumnKey">
          <Toggle
            :model-value="selectedViewId ? row.gtinExemptions[selectedViewId]?.value ?? false : false"
            :disabled="saving || !selectedViewId"
            @update:modelValue="(value) => setMatrixCellValue(rowIndex, column.key, value)"
          />
        </template>
        <template v-else-if="column.key === browseNodeColumnKey">
          <div class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div
                class="text-sm font-medium whitespace-normal break-words"
                :title="getBrowseNodeDisplayPath(row) || t('products.products.amazon.noBrowseNodeSelected')"
              >
                {{ getBrowseNodeDisplayPath(row) || t('products.products.amazon.noBrowseNodeSelected') }}
              </div>
              <div v-if="getBrowseNodeSelection(row)?.remoteId" class="text-xs text-gray-500">
                {{ t('products.products.variations.amazon.labels.browseNodeId', { id: getBrowseNodeSelection(row)?.remoteId }) }}
              </div>
            </div>
            <Button
              class="p-2 text-primary hover:bg-blue-50 rounded"
              :title="t('products.products.variations.amazon.actions.setBrowseNode')"
              :aria-label="t('products.products.variations.amazon.actions.setBrowseNode')"
              :disabled="saving || !selectedViewId"
              @click="openBrowseNodeModal(rowIndex)"
            >
              <Icon name="edit" class="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </template>
        <template v-else-if="column.key === variationThemeColumnKey">
          <div class="flex flex-col gap-2">
            <Selector
              class="w-full"
              :options="variationThemeOptions"
              :model-value="getVariationThemeSelection(row)?.theme || null"
              label-by="name"
              value-by="id"
              :filterable="true"
              :placeholder="getVariationThemePlaceholder(row)"
              :disabled="isVariationThemeDisabled(row)"
              @update:model-value="(value) => setMatrixCellValue(rowIndex, column.key, value)"
            />
            <div v-if="getVariationThemeError(row)" class="text-xs text-red-600">
              {{ getVariationThemeError(row) }}
            </div>
          </div>
        </template>
      </template>
    </MatrixEditor>

    <Modal v-model="externalIdModal.visible" @closed="closeExternalIdModal">
      <Card class="modal-content w-4/5 max-w-3xl">
        <div class="mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.amazon.externalProductId') }}
          </h3>
          <div v-if="externalIdModalView?.name || externalIdModalView?.salesChannel?.hostname" class="text-xs text-gray-500 mt-1">
            <span v-if="externalIdModalView?.name">{{ externalIdModalView.name }}</span>
            <span v-if="externalIdModalView?.name && externalIdModalView?.salesChannel?.hostname" class="mx-1">•</span>
            <span v-if="externalIdModalView?.salesChannel?.hostname">{{ externalIdModalView.salesChannel.hostname }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-500 mb-4">
          {{ t('products.products.amazon.externalProductIdDescription') }}
        </p>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FieldChoice class="w-48" v-model="externalIdModal.type" :field="typeField()" />
          <FieldValue class="w-full sm:w-96" v-model="externalIdModal.value" :field="valueField()" />
        </div>
        <div v-if="externalIdModal.createdAsin" class="text-xs text-gray-500 mt-2">
          {{ t('products.products.amazon.createdAsin') }}: {{ externalIdModal.createdAsin }}
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button class="btn btn-sm btn-primary" @click="saveExternalIdModal">
            {{ t('shared.button.save') }}
          </Button>
          <Button class="btn btn-sm btn-outline-dark" @click="closeExternalIdModal">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
      </Card>
    </Modal>

    <Modal v-model="browseNodeModal.visible" @closed="closeBrowseNodeModal">
      <Card class="modal-content w-11/12 max-w-6xl max-h-[85vh] flex flex-col min-h-0 overflow-hidden">
        <div class="mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.products.amazon.browseNode') }}
          </h3>
          <div v-if="browseNodeModalView?.name || browseNodeModalView?.salesChannel?.hostname" class="text-xs text-gray-500 mt-1">
            <span v-if="browseNodeModalView?.name">{{ browseNodeModalView.name }}</span>
            <span v-if="browseNodeModalView?.name && browseNodeModalView?.salesChannel?.hostname" class="mx-1">•</span>
            <span v-if="browseNodeModalView?.salesChannel?.hostname">{{ browseNodeModalView.salesChannel.hostname }}</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            {{ t('products.products.amazon.browseNodeDescription') }}
          </p>
        </div>
        <div class="flex-1 min-h-0">
          <div class="grid gap-4 lg:grid-cols-2 h-full min-h-0">
            <div class="rounded border bg-white p-4 min-h-0 h-full max-h-[65vh] overflow-hidden flex flex-col">
              <div class="flex items-center gap-2 text-sm mb-2">
                <span
                  class="cursor-pointer hover:underline"
                  @click="goToLevel(null)"
                >
                  {{ t('products.products.amazon.browseNodeRoot') }}
                </span>
                <template v-for="(crumb, index) in browseNodePathStack" :key="crumb.remoteId">
                  <span>&gt;</span>
                  <span
                    class="cursor-pointer hover:underline"
                    @click="goToLevel(index)"
                  >
                    {{ crumb.name }}
                  </span>
                </template>
                <div v-if="browseNodePathStack.length" class="flex gap-1 ml-auto">
                  <Button
                    class="btn btn-sm btn-outline-primary"
                    @click="selectCurrent"
                  >
                    {{ t('products.products.amazon.selectCurrentNode') }}
                  </Button>
                  <Button class="btn btn-sm btn-outline-primary" @click="goBack">
                    {{ t('shared.button.back') }}
                  </Button>
                </div>
              </div>

              <input
                v-model="browseNodeSearch"
                type="text"
                class="form-input w-full mb-2"
                :placeholder="t('shared.button.search') + '...'"
              />

              <div class="flex-1 overflow-y-auto pr-1">
                <div v-if="browseNodeLoading">
                  <LocalLoader :loading="true" />
                </div>
                <ul v-else class="space-y-1">
                  <li
                    v-for="node in filteredBrowseNodes"
                    :key="node.remoteId"
                    class="flex justify-between items-center py-2 px-2 border rounded hover:bg-gray-100"
                  >
                    <div
                      class="flex items-center gap-2 flex-1 cursor-pointer"
                      @click="node.hasChildren ? goToChild(node) : updateBrowseNodeSelection(node)"
                    >
                      <Icon :name="node.hasChildren ? 'angle-right' : 'circle'" class="w-3" />
                      <span>{{ node.name }}</span>
                    </div>
                    <div class="flex gap-2">
                      <Button
                        class="btn btn-sm btn-outline-primary"
                        :disabled="node.hasChildren"
                        :title="node.hasChildren ? t('products.products.amazon.leafRestriction') : undefined"
                        @click.stop="updateBrowseNodeSelection(node)"
                      >
                        {{ t('shared.button.select') }}
                      </Button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="rounded border bg-white p-4 overflow-y-auto min-h-0 h-full max-h-[65vh]">
              <div v-if="browseNodeSelectionPath" class="text-xs text-gray-500 mb-2">
                {{ browseNodeSelectionPath }}
              </div>
              <div v-if="browseNodeSelection">
                <div class="text-sm font-medium">{{ browseNodeSelection.name }}</div>
                <div class="text-xs text-gray-500">{{ browseNodeSelection.remoteId }}</div>
              </div>
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.amazon.noBrowseNodeSelected') }}
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <Button
            class="btn btn-sm btn-primary"
            :disabled="!browseNodeSelection"
            @click="applyBrowseNodeSelection"
          >
            {{ t('shared.button.save') }}
          </Button>
          <Button class="btn btn-sm btn-outline-dark" @click="closeBrowseNodeModal">
            {{ t('shared.button.cancel') }}
          </Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>
