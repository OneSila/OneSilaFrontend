<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import MatrixEditor from "../../../../../../../../../shared/components/organisms/matrix-editor/MatrixEditor.vue";
import type { MatrixColumn, MatrixEditorExpose } from "../../../../../../../../../shared/components/organisms/matrix-editor/types";
import { Product } from "../../../../../../configs";
import { ProductType } from "../../../../../../../../../shared/utils/constants";
import apolloClient from "../../../../../../../../../../apollo-client";
import { bundleVariationsQuery, configurableVariationsQuery } from "../../../../../../../../../shared/api/queries/products.js";
import { mediaProductThroughQuery } from "../../../../../../../../../shared/api/queries/media.js";
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
import { shortenText } from "../../../../../../../../../shared/utils";

interface VariationImageSlot {
  id: string | null;
  productId: string;
  mediaId: string;
  mediaUrl: string | null;
  mediaName: string | null;
  isMainImage: boolean;
  sortOrder: number | null;
  active: boolean;
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

const matrixRef = ref<MatrixEditorExpose | null>(null);
const variations = ref<VariationRow[]>([]);
const originalVariations = ref<VariationRow[]>([]);
const loading = ref(false);
const saving = ref(false);

const isAlias = computed(() => props.product.type === ProductType.Alias);
const parentProduct = computed(() => (isAlias.value ? props.product.aliasParentProduct : props.product));
const parentProductType = computed(() => parentProduct.value.type);

const baseColumns = computed<MatrixColumn[]>(() => [
  { key: 'sku', label: t('shared.labels.sku'), sticky: true, editable: false },
  { key: 'name', label: t('shared.labels.name'), editable: false },
  { key: 'active', label: t('shared.labels.active'), editable: false, initialWidth: 60 },
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
    active: value.active ?? true,
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
      active: node.active ?? true,
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
    const imagesMap = await fetchVariationImages(variationIds, policy);
    variationRows.forEach((row) => {
      const entries = imagesMap.get(row.variation.id) ?? [];
      row.images = entries;
      ensureRowHasMainImage(row);
    });
    variations.value = JSON.parse(JSON.stringify(variationRows));
    originalVariations.value = JSON.parse(JSON.stringify(variationRows));
    matrixRef.value?.resetHistory(variations.value);
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!hasChanges.value || saving.value) {
    return;
  }
  saving.value = true;
  try {
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

    if (toDelete.length) {
      await apolloClient.mutate({
        mutation: deleteMediaProductThroughsMutation,
        variables: { ids: toDelete },
      });
    }

    if (toCreate.length) {
      const payload = toCreate.map((item) => ({
        product: { id: item.productId },
        media: { id: item.mediaId },
        sortOrder: item.sortOrder,
        isMainImage: item.isMainImage,
        active: true,
      }));
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

const removeImage = (rowIndex: number, columnIndex: number) => {
  const columnKey = `image-${columnIndex}`;
  clearMatrixCellValue(rowIndex, columnKey);
};

onMounted(() => {
  loadData();
});

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div class="relative w-full min-w-0 variations-images-bulk-edit">
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
          <Link :path="{ name: 'products.products.show', params: { id: row.variation.id } }" target="_blank">
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
        <template v-else>
          <div class="group relative flex items-center justify-center">
            <div class="flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50">
              <ProductImage
                v-if="row.images[getImageColumnIndex(column.key)]"
                :source="row.images[getImageColumnIndex(column.key)]?.mediaUrl || ''"
                :alt="row.images[getImageColumnIndex(column.key)]?.mediaName || row.variation.name"
                class="h-full w-full object-cover"
              />
              <div v-else class="flex flex-col items-center gap-2">
                <span class="text-xs text-gray-500">
                  {{ t('products.products.variations.images.labels.noImage') }}
                </span>
                <div class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300">
                  <Icon name="plus" class="h-3 w-3 text-gray-400" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-md bg-gray-900 bg-opacity-60 px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100"
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
  </div>
</template>

<style scoped>
.variations-images-bulk-edit .group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>
