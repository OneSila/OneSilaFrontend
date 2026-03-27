<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, withDefaults } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import { processGraphQLErrors, shortenText } from "../../../../../../../../../shared/utils";
import apolloClient from "../../../../../../../../../../apollo-client";
import { Product } from "../../../../../../configs";
import { ProductType } from "../../../../../../../../../shared/utils/constants";
import {
  bundleVariationsQuery,
  configurableVariationsQuery,
  productsWithEanCodesQuery
} from "../../../../../../../../../shared/api/queries/products.js";
import { eanCodesQuery } from "../../../../../../../../../shared/api/queries/eanCodes.js";
import {
  assignEanCodeMutation,
  createEanCodeMutation,
  deleteEanCodeMutation,
  manualAssignEanCodeMutation,
  releaseEanCodeMutation,
  updateEanCodeMutation
} from "../../../../../../../../../shared/api/mutations/eanCodes.js";

type PendingAction = 'none' | 'assign' | 'release' | 'delete';
type ValidationState = 'idle' | 'valid' | 'invalid';
type SaveOperation = Exclude<PendingAction, 'none'> | 'create' | 'update' | null;

interface EanCodeInfo {
  id: string | null;
  ean: string;
  internal: boolean | null;
  alreadyUsed: boolean | null;
}

interface VariationEanRow {
  id: string;
  variation: {
    id: string;
    sku: string;
    name: string;
    active: boolean;
    type: string | null;
  };
  currentEan: EanCodeInfo;
  draftEan: string;
  pendingAction: PendingAction;
  validationState: ValidationState;
  errorMessage: string;
}

interface ExistingEanCodeNode {
  id: string;
  internal: boolean;
  alreadyUsed: boolean;
  product?: {
    id?: string | null;
  } | null;
}

const props = withDefaults(
  defineProps<{ product?: Product | null; productIds?: string[] }>(),
  { product: null, productIds: () => [] }
);

const { t } = useI18n();

const variations = ref<VariationEanRow[]>([]);
const originalVariations = ref<VariationEanRow[]>([]);
const loading = ref(false);
const saving = ref(false);
const matrixRef = ref<MatrixEditorExpose | null>(null);
const validationTimers = new Map<string, number>();

const baseColumns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
  { key: 'eanCode', label: t('products.eanCodes.labels.eanCode'), editable: true, initialWidth: 360 },
]);

const columns = computed<MatrixColumn[]>(() => baseColumns.value);
const hasProductIds = computed(() => props.productIds.length > 0);
const isAlias = computed(() => props.product?.type === ProductType.Alias);
const parentProduct = computed(() => {
  if (!props.product) {
    return null;
  }
  return isAlias.value ? props.product.aliasParentProduct : props.product;
});
const parentProductType = computed(() => parentProduct.value?.type ?? null);

const cloneRows = (rows: VariationEanRow[]) => JSON.parse(JSON.stringify(rows));

const serializeRows = (rows: VariationEanRow[]) =>
  JSON.stringify(
    rows.map((row) => ({
      id: row.id,
      currentEan: row.currentEan,
      draftEan: row.draftEan.trim(),
      pendingAction: row.pendingAction,
    }))
  );

const hasChanges = computed(() => serializeRows(variations.value) !== serializeRows(originalVariations.value));
const hasUnsavedChanges = hasChanges;

const copyValueToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const clearValidationTimer = (rowId: string) => {
  const timer = validationTimers.get(rowId);
  if (timer) {
    window.clearTimeout(timer);
    validationTimers.delete(rowId);
  }
};

const clearAllValidationTimers = () => {
  validationTimers.forEach((timer) => window.clearTimeout(timer));
  validationTimers.clear();
};

const findOriginalRow = (rowId: string) => originalVariations.value.find((row) => row.id === rowId) ?? null;
const getOriginalDraft = (rowId: string) => findOriginalRow(rowId)?.draftEan.trim() ?? '';

const isValidEan13 = (ean: string): boolean => {
  if (!/^\d{13}$/.test(ean)) {
    return false;
  }

  const digits = ean.split('').map(Number);
  const checkDigit = digits.pop();
  const sum = digits.reduce((acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3), 0);
  const calculatedCheck = (10 - (sum % 10)) % 10;

  return calculatedCheck === checkDigit;
};

const scheduleValidation = (rowId: string) => {
  clearValidationTimer(rowId);
  const row = variations.value.find((item) => item.id === rowId);
  if (!row) {
    return;
  }

  const trimmed = row.draftEan.trim();
  if (!trimmed || trimmed === getOriginalDraft(rowId)) {
    row.validationState = 'idle';
    return;
  }

  const timer = window.setTimeout(() => {
    const currentRow = variations.value.find((item) => item.id === rowId);
    if (!currentRow) {
      return;
    }
    currentRow.validationState = isValidEan13(trimmed) ? 'valid' : 'invalid';
    validationTimers.delete(rowId);
  }, 250);

  validationTimers.set(rowId, timer);
};

const isConfigurableRow = (row: VariationEanRow) => row.variation.type === ProductType.Configurable;

const createEmptyEanInfo = (): EanCodeInfo => ({
  id: null,
  ean: '',
  internal: null,
  alreadyUsed: null,
});

const createRow = (product: any, eanCode?: any): VariationEanRow => ({
  id: product.id,
  variation: {
    id: product.id,
    sku: product.sku,
    name: product.name,
    active: product.active,
    type: product.type ?? null,
  },
  currentEan: eanCode
    ? {
        id: eanCode.id ?? null,
        ean: eanCode.eanCode ?? '',
        internal: eanCode.internal ?? null,
        alreadyUsed: eanCode.alreadyUsed ?? null,
      }
    : createEmptyEanInfo(),
  draftEan: eanCode?.eanCode ?? '',
  pendingAction: 'none',
  validationState: 'idle',
  errorMessage: '',
});

const fetchVariationProducts = async (policy: FetchPolicy = 'cache-first') => {
  if (!parentProduct.value || !parentProductType.value) {
    return [];
  }

  const isBundle = parentProductType.value === ProductType.Bundle;
  const query = isBundle ? bundleVariationsQuery : configurableVariationsQuery;
  const key = isBundle ? 'bundleVariations' : 'configurableVariations';
  const pageSize = 100;
  let after: string | null = null;
  const products: any[] = [];
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
    if (!connection) {
      break;
    }

    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => {
      if (edge?.node?.variation) {
        products.push(edge.node.variation);
      }
    });

    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) {
      break;
    }
  }

  return products;
};

const fetchProducts = async (policy: FetchPolicy = 'cache-first') => {
  const ids = props.productIds.filter(Boolean);
  if (!ids.length) {
    return [];
  }

  const pageSize = 100;
  let after: string | null = null;
  const products: any[] = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: productsWithEanCodesQuery,
      variables: {
        first: pageSize,
        after,
        filter: { id: { inList: ids } },
      },
      fetchPolicy: policy,
    });

    const connection = data?.products;
    if (!connection) {
      break;
    }

    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => {
      if (edge?.node) {
        products.push(edge.node);
      }
    });

    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) {
      break;
    }
  }

  return products;
};

const fetchEanCodeMap = async (productIds: string[], policy: FetchPolicy = 'cache-first') => {
  if (!productIds.length) {
    return new Map<string, any>();
  }

  const pageSize = 100;
  let after: string | null = null;
  let hasNextPage = true;
  const eanMap = new Map<string, any>();

  while (hasNextPage) {
    const { data } = await apolloClient.query({
      query: eanCodesQuery,
      variables: {
        first: pageSize,
        after,
        filter: { product: { id: { inList: productIds } } },
      },
      fetchPolicy: policy,
    });

    const connection = data?.eanCodes;
    if (!connection) {
      break;
    }

    const edges = connection.edges ?? [];
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const productId = node?.product?.id;
      if (node && productId && !eanMap.has(productId)) {
        eanMap.set(productId, node);
      }
    });

    hasNextPage = connection.pageInfo?.hasNextPage ?? false;
    after = connection.pageInfo?.endCursor ?? null;
    if (!after) {
      break;
    }
  }

  return eanMap;
};

const mergeFailedRows = (serverRows: VariationEanRow[], failedRows: Map<string, VariationEanRow>) =>
  serverRows.map((row) => {
    const failedRow = failedRows.get(row.id);
    if (!failedRow) {
      return row;
    }

    return {
      ...row,
      draftEan: failedRow.draftEan,
      pendingAction: failedRow.pendingAction,
      validationState: failedRow.validationState,
      errorMessage: failedRow.errorMessage,
    };
  });

const loadData = async (policy: FetchPolicy = 'cache-first', failedRows: Map<string, VariationEanRow> = new Map()) => {
  loading.value = true;
  clearAllValidationTimers();

  try {
    const products = hasProductIds.value
      ? await fetchProducts(policy)
      : await fetchVariationProducts(policy);

    const eanMap = await fetchEanCodeMap(
      products.map((product: any) => product.id).filter(Boolean),
      policy
    );

    const rows = products.map((product: any) => createRow(product, eanMap.get(product.id)));
    const mergedRows = mergeFailedRows(rows, failedRows);

    originalVariations.value = cloneRows(rows);
    variations.value = cloneRows(mergedRows);
    matrixRef.value?.resetHistory(variations.value);
  } finally {
    loading.value = false;
  }
};

const getMatrixCellValue = (rowIndex: number, columnKey: string) => {
  const row = variations.value[rowIndex];
  if (!row) {
    return '';
  }

  if (columnKey === 'sku') {
    return row.variation.sku;
  }
  if (columnKey === 'name') {
    return row.variation.name;
  }
  if (columnKey === 'active') {
    return row.variation.active ? t('shared.labels.yes') : t('shared.labels.no');
  }
  if (columnKey === 'eanCode') {
    return row.draftEan;
  }

  return '';
};

const setMatrixCellValue = (rowIndex: number, columnKey: string, value: any) => {
  if (columnKey !== 'eanCode') {
    return;
  }

  updateDraft(rowIndex, String(value ?? ''));
};

const cloneMatrixCellValue = () => {};
const clearMatrixCellValue = () => {};

const getInputClasses = (row: VariationEanRow) => {
  if (row.validationState === 'invalid') {
    return 'border border-red-400 focus:border-red-400 focus:ring-red-400';
  }
  if (row.validationState === 'valid') {
    return 'border border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400';
  }
  return 'border border-gray-300 focus:border-sky-500 focus:ring-sky-500';
};

const updateDraft = (rowIndex: number, value: string) => {
  const row = variations.value[rowIndex];
  if (!row || isConfigurableRow(row)) {
    return;
  }

  row.draftEan = value;
  row.errorMessage = '';
  if (row.pendingAction !== 'none') {
    row.pendingAction = 'none';
  }
  scheduleValidation(row.id);
};

const scheduleAssign = (rowIndex: number) => {
  const row = variations.value[rowIndex];
  if (!row || isConfigurableRow(row)) {
    return;
  }

  row.pendingAction = row.pendingAction === 'assign' ? 'none' : 'assign';
  row.draftEan = row.pendingAction === 'assign' ? '' : row.currentEan.ean;
  row.validationState = 'idle';
  row.errorMessage = '';
  clearValidationTimer(row.id);
};

const scheduleRelease = (rowIndex: number) => {
  const row = variations.value[rowIndex];
  if (!row || isConfigurableRow(row)) {
    return;
  }

  row.pendingAction = row.pendingAction === 'release' ? 'none' : 'release';
  row.errorMessage = '';
};

const scheduleDelete = (rowIndex: number) => {
  const row = variations.value[rowIndex];
  if (!row || isConfigurableRow(row)) {
    return;
  }

  row.pendingAction = row.pendingAction === 'delete' ? 'none' : 'delete';
  row.errorMessage = '';
};

const buildExternalEanCodeInput = (productId: string, value: string) => ({
  eanCode: value,
  product: { id: productId },
  internal: false,
  alreadyUsed: true,
});

const createExternalEanCode = async (productId: string, value: string) => {
  return apolloClient.mutate({
    mutation: createEanCodeMutation,
    variables: { data: buildExternalEanCodeInput(productId, value) },
  });
};

const updateExternalEanCode = async (id: string, value: string) => {
  return apolloClient.mutate({
    mutation: updateEanCodeMutation,
    variables: {
      data: {
        id,
        eanCode: value,
        internal: false,
        alreadyUsed: true,
      },
    },
  });
};

const deleteAssignedEanCode = async (id: string) => {
  return apolloClient.mutate({
    mutation: deleteEanCodeMutation,
    variables: { id },
  });
};

const releaseAssignedEanCode = async (id: string) => {
  return apolloClient.mutate({
    mutation: releaseEanCodeMutation,
    variables: { data: { id } },
  });
};

const assignInternalEanCode = async (productId: string) => {
  return apolloClient.mutate({
    mutation: assignEanCodeMutation,
    variables: { data: { product: { id: productId } } },
  });
};

const manualAssignInternalEanCode = async (productId: string, eanCodeId: string) => {
  return apolloClient.mutate({
    mutation: manualAssignEanCodeMutation,
    variables: {
      data: {
        product: { id: productId },
        eanCode: { id: eanCodeId }
      }
    },
  });
};

const fetchMatchingEanCode = async (value: string): Promise<ExistingEanCodeNode | null> => {
  const { data } = await apolloClient.query({
    query: eanCodesQuery,
    variables: {
      first: 1,
      filter: {
        eanCode: { exact: value }
      }
    },
    fetchPolicy: 'network-only'
  });

  return data?.eanCodes?.edges?.[0]?.node ?? null;
};

const isReclaimableEanCode = (existingEanCode: ExistingEanCodeNode | null): existingEanCode is ExistingEanCodeNode =>
  Boolean(
    existingEanCode &&
    existingEanCode.internal &&
    existingEanCode.alreadyUsed === false &&
    !existingEanCode.product?.id
  );

const getGraphQLErrorMessages = (error: unknown): string[] => {
  if (!error || typeof error !== 'object' || !('graphQLErrors' in error)) {
    return [];
  }

  const graphQLErrors = (error as { graphQLErrors?: Array<{ message?: string }> }).graphQLErrors;
  if (!Array.isArray(graphQLErrors)) {
    return [];
  }

  return graphQLErrors
    .map((graphQLError) => graphQLError?.message)
    .filter((message): message is string => Boolean(message));
};

const getErrorMessage = (error: unknown) => {
  const validationErrors = processGraphQLErrors(error, t);
  const messages = Object.values(validationErrors).filter(Boolean);
  if (messages.length) {
    return String(messages[0]);
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return t('shared.alert.toast.unexpectedResult');
};

const isDuplicateEanError = (error: unknown) => {
  const validationMessages = Object.values(processGraphQLErrors(error, t)).map((message) => String(message));
  const messages = [...getGraphQLErrorMessages(error), ...validationMessages];

  return messages.some((message) => /ean code/i.test(message) && /already exists/i.test(message));
};

const tryMatchExistingEanCode = async (
  productId: string,
  value: string,
  previousExternalId: string | null,
  previousExternalEan: string
) => {
  const existingEanCode = await fetchMatchingEanCode(value);

  if (!isReclaimableEanCode(existingEanCode)) {
    throw new Error(t('products.eanCodes.messages.matchExistingBlocked'));
  }

  if (previousExternalId) {
    await deleteAssignedEanCode(previousExternalId);
  }

  try {
    await manualAssignInternalEanCode(productId, existingEanCode.id);
  } catch (error) {
    if (previousExternalId && previousExternalEan) {
      try {
        await createExternalEanCode(productId, previousExternalEan);
      } catch (rollbackError) {
        console.error('Failed to restore previous external EAN code.', rollbackError);
      }
    }
    throw error;
  }
};

const getRowOperation = (row: VariationEanRow, original: VariationEanRow | null): SaveOperation => {
  if (row.pendingAction !== 'none') {
    return row.pendingAction;
  }

  const trimmedDraft = row.draftEan.trim();
  const originalDraft = original?.draftEan.trim() ?? '';

  if (!row.currentEan.id && trimmedDraft) {
    return 'create';
  }

  if (row.currentEan.id && row.currentEan.internal === false && trimmedDraft && trimmedDraft !== originalDraft) {
    return 'update';
  }

  return null;
};

const performOperation = async (row: VariationEanRow, original: VariationEanRow | null) => {
  const operation = getRowOperation(row, original);
  if (!operation) {
    return false;
  }

  const productId = row.variation.id;
  const trimmedDraft = row.draftEan.trim();

  if (operation === 'assign') {
    await assignInternalEanCode(productId);
    return true;
  }

  if (operation === 'release') {
    if (!row.currentEan.id) {
      return false;
    }
    await releaseAssignedEanCode(row.currentEan.id);
    return true;
  }

  if (operation === 'delete') {
    if (!row.currentEan.id) {
      return false;
    }
    await deleteAssignedEanCode(row.currentEan.id);
    return true;
  }

  if (operation === 'create') {
    try {
      await createExternalEanCode(productId, trimmedDraft);
    } catch (error) {
      if (!isDuplicateEanError(error)) {
        throw error;
      }
      await tryMatchExistingEanCode(productId, trimmedDraft, null, '');
    }
    return true;
  }

  if (operation === 'update') {
    if (!row.currentEan.id) {
      return false;
    }

    try {
      await updateExternalEanCode(row.currentEan.id, trimmedDraft);
    } catch (error) {
      if (!isDuplicateEanError(error)) {
        throw error;
      }
      await tryMatchExistingEanCode(
        productId,
        trimmedDraft,
        row.currentEan.id,
        original?.currentEan.ean ?? row.currentEan.ean
      );
    }
    return true;
  }

  return false;
};

const save = async () => {
  if (!hasChanges.value) {
    return;
  }

  saving.value = true;
  clearAllValidationTimers();

  const failedRows = new Map<string, VariationEanRow>();
  let successCount = 0;
  let attemptedCount = 0;

  try {
    const originalMap = new Map<string, VariationEanRow>();
    originalVariations.value.forEach((row) => {
      originalMap.set(row.id, row);
    });

    for (const row of variations.value) {
      row.errorMessage = '';
      const original = originalMap.get(row.id) ?? null;
      const operation = getRowOperation(row, original);

      if (!operation || isConfigurableRow(row)) {
        continue;
      }

      attemptedCount += 1;

      try {
        const changed = await performOperation(row, original);
        if (changed) {
          successCount += 1;
        }
      } catch (error) {
        row.errorMessage = getErrorMessage(error);
        failedRows.set(row.id, JSON.parse(JSON.stringify(row)));
      }
    }

    if (!attemptedCount) {
      await loadData('network-only');
      return;
    }

    await loadData('network-only', failedRows);

    if (successCount) {
      Toast.success(
        t('products.products.variations.eanCodes.toast.saved', { count: successCount })
      );
    }

    if (failedRows.size) {
      Toast.warning(
        t('products.products.variations.eanCodes.toast.failed', { count: failedRows.size })
      );
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

onBeforeUnmount(() => {
  clearAllValidationTimers();
});

defineExpose({ save, hasUnsavedChanges });
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
      :enable-cell-clipboard="false"
      :enable-row-clipboard="false"
      :enable-drag-fill="false"
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
            <Button class="p-0" @click="copyValueToClipboard(row.variation.sku)">
              <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
            </Button>
          </div>
        </template>
        <template v-else-if="column.key === 'active'">
          <Icon v-if="row.variation.active" name="check-circle" class="text-green-500" />
          <Icon v-else name="times-circle" class="text-red-500" />
        </template>
        <template v-else-if="column.key === 'eanCode'">
          <div class="min-w-[320px] py-1">
            <template v-if="isConfigurableRow(row)">
              <span class="text-xs text-gray-400">
                {{ t('products.products.variations.eanCodes.labels.disabledForConfigurable') }}
              </span>
            </template>

            <template v-else-if="row.pendingAction === 'assign'">
              <div class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {{ t('products.products.variations.eanCodes.status.toBeAssigned') }}
              </div>
            </template>

            <template v-else-if="row.pendingAction === 'release'">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="block truncate font-medium text-gray-900" :title="row.currentEan.ean">
                    {{ row.currentEan.ean }}
                  </span>
                  <Button class="p-0" @click="copyValueToClipboard(row.currentEan.ean)">
                    <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </Button>
                </div>
                <span class="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  {{ t('products.products.variations.eanCodes.status.toBeReleased') }}
                </span>
              </div>
            </template>

            <template v-else-if="row.pendingAction === 'delete'">
              <div class="space-y-2">
                <span class="block truncate text-gray-500 line-through" :title="row.currentEan.ean">
                  {{ row.currentEan.ean }}
                </span>
                <span class="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  {{ t('products.products.variations.eanCodes.status.toBeDeleted') }}
                </span>
              </div>
            </template>

            <template v-else-if="row.currentEan.internal">
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <span class="block truncate font-medium text-gray-900" :title="row.currentEan.ean">
                    {{ row.currentEan.ean }}
                  </span>
                  <Button class="p-0" @click="copyValueToClipboard(row.currentEan.ean)">
                    <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </Button>
                </div>
                <Button class="btn btn-outline-danger btn-sm" @click="scheduleRelease(rowIndex)">
                  {{ t('products.eanCodes.assign.button.release') }}
                </Button>
              </div>
            </template>

            <template v-else>
              <div class="space-y-2">
                <input
                  :value="row.draftEan"
                  type="text"
                  :placeholder="t('products.eanCodes.placeholders.externalEanCode')"
                  class="w-full rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1"
                  :class="getInputClasses(row)"
                  :disabled="saving"
                  @input="(event) => updateDraft(rowIndex, (event.target as HTMLInputElement).value)"
                />
                <div class="flex flex-wrap items-center gap-2">
                  <Button
                    v-if="!row.currentEan.id"
                    class="btn btn-outline-primary btn-sm"
                    :disabled="saving"
                    @click="scheduleAssign(rowIndex)"
                  >
                    {{ t('products.eanCodes.assign.button.assign') }}
                  </Button>
                  <Button
                    v-if="row.currentEan.id && row.currentEan.internal === false"
                    class="btn btn-outline-danger btn-sm"
                    :disabled="saving"
                    @click="scheduleDelete(rowIndex)"
                  >
                    {{ t('shared.button.delete') }}
                  </Button>
                  <span
                    v-if="!row.currentEan.id && row.draftEan.trim()"
                    class="text-xs text-gray-500"
                  >
                    {{ t('products.products.variations.eanCodes.status.willCreate') }}
                  </span>
                  <span
                    v-if="row.currentEan.id && row.currentEan.internal === false && row.draftEan.trim() && row.draftEan.trim() !== row.currentEan.ean"
                    class="text-xs text-gray-500"
                  >
                    {{ t('products.products.variations.eanCodes.status.willUpdate') }}
                  </span>
                </div>
              </div>
            </template>

            <p v-if="row.errorMessage" class="mt-2 text-xs text-danger">
              {{ row.errorMessage }}
            </p>
          </div>
        </template>
      </template>
    </MatrixEditor>
  </div>
</template>
