<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../../../../shared/components/atoms/local-loader';
import { displayApolloError } from '../../../../../../../../../../shared/utils';
import { ebayCategoriesQuery } from '../../../../../../../../../../shared/api/queries/ebayCategories.js';
import { ebayChannelViewsQuery } from '../../../../../../../../../../shared/api/queries/salesChannels.js';
import EbayCategoryBrowser from '/src/core/products/products/product-show/containers/tabs/ebay/components/EbayCategoryBrowser.vue';
import EbayCategoryDetails from '/src/core/products/products/product-show/containers/tabs/ebay/components/EbayCategoryDetails.vue';

type CategoryId = string | number;
interface EbayCategoryNode {
  remoteId: string;
  name: string;
  fullName?: string | null;
  hasChildren: boolean;
  parentNode?: { remoteId?: string | null } | null;
  configuratorProperties: string[];
}

const parseConfiguratorProperties = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === 'string');
      }
    } catch (_error) {
      /* ignore malformed JSON */
    }
  }
  return [];
};

const normalizeCategoryNode = (node: any): EbayCategoryNode => ({
  remoteId: node?.remoteId ?? '',
  name: node?.name ?? '',
  fullName: node?.fullName ?? null,
  hasChildren: Boolean(node?.hasChildren),
  parentNode: node?.parentNode ?? null,
  configuratorProperties: parseConfiguratorProperties(node?.configuratorProperties),
});

const mapCategoriesConnection = (connection: any): EbayCategoryNode[] => {
  if (!connection) return [];
  const list = Array.isArray(connection)
    ? connection
    : connection.edges?.map((edge: any) => edge.node) || [];
  return list.map((item: any) => normalizeCategoryNode(item));
};

const props = defineProps<{
  modelValue: CategoryId[];
  categoryKind: 'required' | 'optional';
  salesChannelId?: string | null;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: CategoryId[]): void;
}>();

const { t } = useI18n();
const localValue = computed<CategoryId[]>({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (value) => emit('update:modelValue', [...value]),
});
const loadingView = ref(false);
const decodingCategories = ref(false);
const marketplaceViews = ref<any[]>([]);
const selectedViewId = ref<string | null>(null);
const decodedMap = ref<Record<string, EbayCategoryNode>>({});
const unresolvedRemoteIds = ref<Record<string, boolean>>({});
const pickerVisible = ref(false);
const selectedPickerNode = ref<EbayCategoryNode | null>(null);
const selectedPickerPath = ref<string | null>(null);
const selectedListRemoteId = ref<string | null>(null);
const browserInstanceKey = ref(0);
const manualCategoryInput = ref('');
const manualSelectionLoading = ref(false);
const manualSelectionError = ref<string | null>(null);
let decodeRequestId = 0;

const remoteIds = computed(() =>
  localValue.value
    .map((value) => String(value))
    .filter((value) => value.length > 0),
);
const manualCategoryId = computed(() => manualCategoryInput.value.trim());

watch(
  manualCategoryInput,
  () => {
    manualSelectionError.value = null;
  },
);

const formatViewLabel = (view: any, index: number): string => {
  const name = view?.name || '';
  const hostname = view?.salesChannel?.hostname || '';
  if (name && hostname) {
    return `${name} • ${hostname}`;
  }
  if (name || hostname) {
    return name || hostname;
  }
  return t('integrations.show.documentTypes.categories.marketplaceFallback', { index: index + 1 });
};

const fetchMarketplaceViews = async () => {
  if (!props.salesChannelId) {
    marketplaceViews.value = [];
    selectedViewId.value = null;
    return;
  }

  loadingView.value = true;
  try {
    const { data } = await apolloClient.query({
      query: ebayChannelViewsQuery,
      variables: {
        first: 100,
        filter: { salesChannel: { id: { exact: props.salesChannelId } } },
      },
      fetchPolicy: 'cache-first',
    });
    const views = (data?.ebaySalesChannelViews?.edges?.map((edge: any) => edge.node) || []).sort((a: any, b: any) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1;
      }
      return formatViewLabel(a, 0).localeCompare(formatViewLabel(b, 0));
    });
    marketplaceViews.value = views;

    if (selectedViewId.value && views.some((view: any) => view.id === selectedViewId.value)) {
      return;
    }
    const selectedView = views.find((view: any) => view.isDefault) || views[0] || null;
    selectedViewId.value = selectedView?.id || null;
  } catch (error) {
    marketplaceViews.value = [];
    selectedViewId.value = null;
    displayApolloError(error);
  } finally {
    loadingView.value = false;
  }
};

watch(
  () => props.salesChannelId,
  () => {
    fetchMarketplaceViews();
  },
  { immediate: true },
);

const selectedView = computed(() =>
  marketplaceViews.value.find((view: any) => view.id === selectedViewId.value) || null,
);

const selectedViewIndex = computed(() =>
  marketplaceViews.value.findIndex((view: any) => view.id === selectedViewId.value),
);

const selectedViewLabel = computed(() =>
  selectedView.value
    ? formatViewLabel(selectedView.value, selectedViewIndex.value >= 0 ? selectedViewIndex.value : 0)
    : '',
);

const hasMultipleViews = computed(() => marketplaceViews.value.length > 1);

const activeCategoryTreeId = computed(
  () => selectedView.value?.defaultCategoryTreeId || null,
);

const categoryTreeIds = computed(() =>
  Array.from(
    new Set(
      marketplaceViews.value
        .map((view: any) => view?.defaultCategoryTreeId)
        .filter((value: string | null) => Boolean(value)),
    ),
  ),
);

const selectMarketplaceView = (viewId: string) => {
  if (selectedViewId.value === viewId) {
    return;
  }
  selectedViewId.value = viewId;
  selectedPickerNode.value = null;
  selectedPickerPath.value = null;
  selectedListRemoteId.value = null;
  manualSelectionError.value = null;
  browserInstanceKey.value += 1;
};

const fetchCategoryDetailsFromActiveView = async (remoteId: string): Promise<EbayCategoryNode | null> => {
  if (!activeCategoryTreeId.value) {
    return null;
  }
  try {
    const { data } = await apolloClient.query({
      query: ebayCategoriesQuery,
      variables: {
        first: 1,
        filter: {
          marketplaceDefaultTreeId: { exact: activeCategoryTreeId.value },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: 'cache-first',
    });
    const nodes = mapCategoriesConnection(data?.ebayCategories);
    return nodes[0] || null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const decodeCategories = async () => {
  const requestId = ++decodeRequestId;
  const ids = Array.from(new Set(remoteIds.value));

  if (!ids.length) {
    decodingCategories.value = false;
    decodedMap.value = {};
    unresolvedRemoteIds.value = {};
    return;
  }

  const treeIds = categoryTreeIds.value;
  if (!treeIds.length) {
    decodingCategories.value = false;
    decodedMap.value = {};
    unresolvedRemoteIds.value = ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
    return;
  }

  decodingCategories.value = true;
  const mapped: Record<string, EbayCategoryNode> = {};
  const unresolvedIds = new Set(ids);
  try {
    for (const treeId of treeIds) {
      if (!unresolvedIds.size) {
        break;
      }
      const unresolvedList = Array.from(unresolvedIds);
      for (let i = 0; i < unresolvedList.length; i += 50) {
        const batch = unresolvedList.slice(i, i + 50);
        const { data } = await apolloClient.query({
          query: ebayCategoriesQuery,
          variables: {
            first: batch.length,
            filter: {
              marketplaceDefaultTreeId: { exact: treeId },
              remoteId: { inList: batch },
            },
          },
          fetchPolicy: 'cache-first',
        });
        const nodes = mapCategoriesConnection(data?.ebayCategories);
        nodes.forEach((node) => {
          if (!mapped[node.remoteId]) {
            mapped[node.remoteId] = node;
          }
          unresolvedIds.delete(node.remoteId);
        });
      }
    }
  } catch (error) {
    displayApolloError(error);
  } finally {
    if (requestId !== decodeRequestId) {
      return;
    }
    decodedMap.value = mapped;
    unresolvedRemoteIds.value = ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = !mapped[id];
      return acc;
    }, {});
    decodingCategories.value = false;
  }
};

watch(
  [remoteIds, categoryTreeIds],
  () => {
    decodeCategories();
  },
  { immediate: true },
);

const title = computed(() =>
  props.categoryKind === 'required'
    ? t('integrations.show.documentTypes.labels.requiredCategories')
    : t('integrations.show.documentTypes.labels.optionalCategories'),
);
const categoryHelpText = computed(() =>
  props.categoryKind === 'required'
    ? t('integrations.show.documentTypes.help.requiredCategories')
    : t('integrations.show.documentTypes.help.optionalCategories'),
);

const sectionClasses = computed(() =>
  props.categoryKind === 'required'
    ? 'border-rose-200 bg-rose-50/80'
    : 'border-orange-200 bg-orange-50/80',
);

const emptyMessage = computed(() =>
  categoryTreeIds.value.length
    ? t('integrations.show.documentTypes.categories.empty')
    : t('integrations.show.documentTypes.categories.missingTree'),
);

const categoryItems = computed(() =>
  localValue.value.map((rawValue, index) => {
    const remoteId = String(rawValue);
    return {
      key: `${remoteId}-${index}`,
      index,
      remoteId,
      node: decodedMap.value[remoteId] || null,
      outdated: Boolean(unresolvedRemoteIds.value[remoteId]),
    };
  }),
);

const removeAt = (index: number) => {
  const removedRemoteId = String(localValue.value[index] || '');
  const nextValue = [...localValue.value];
  nextValue.splice(index, 1);
  localValue.value = nextValue;
  if (removedRemoteId && selectedListRemoteId.value === removedRemoteId) {
    selectedListRemoteId.value = null;
    selectedPickerNode.value = null;
    selectedPickerPath.value = null;
  }
};

const addCategory = (node: EbayCategoryNode, path: EbayCategoryNode[]) => {
  if (!node.remoteId || localValue.value.some((value) => String(value) === node.remoteId)) {
    return;
  }
  const fullPath = path.map((item) => item.name).filter(Boolean).join(' > ');
  decodedMap.value = {
    ...decodedMap.value,
    [node.remoteId]: {
      ...node,
      fullName: node.fullName || fullPath || node.name,
    },
  };
  unresolvedRemoteIds.value = {
    ...unresolvedRemoteIds.value,
    [node.remoteId]: false,
  };
  localValue.value = [...localValue.value, node.remoteId];
};

const previewExistingCategory = (item: { remoteId: string; node: EbayCategoryNode | null }) => {
  if (!item.node) {
    return;
  }
  selectedListRemoteId.value = item.remoteId;
  selectedPickerNode.value = item.node;
  selectedPickerPath.value = item.node.fullName || item.node.name || item.remoteId;
  pickerVisible.value = true;
};

const onSelectedFromBrowser = (payload: { node: EbayCategoryNode; path: EbayCategoryNode[] }) => {
  addCategory(payload.node, payload.path);
  selectedListRemoteId.value = null;
  selectedPickerNode.value = null;
  selectedPickerPath.value = null;
  browserInstanceKey.value += 1;
};

const setManualCategory = async () => {
  if (!manualCategoryId.value || manualSelectionLoading.value) {
    return;
  }
  if (!activeCategoryTreeId.value) {
    manualSelectionError.value = t('products.products.ebay.manualEntry.invalid');
    return;
  }

  manualSelectionLoading.value = true;
  manualSelectionError.value = null;
  try {
    const node = await fetchCategoryDetailsFromActiveView(manualCategoryId.value);
    if (!node) {
      manualSelectionError.value = t('products.products.ebay.manualEntry.invalid');
      return;
    }
    addCategory(node, [node]);
    manualCategoryInput.value = '';
    selectedListRemoteId.value = null;
    selectedPickerNode.value = null;
    selectedPickerPath.value = null;
    browserInstanceKey.value += 1;
  } finally {
    manualSelectionLoading.value = false;
  }
};
</script>

<template>
  <div :class="['rounded-md border p-4 text-sm text-gray-700', sectionClasses]">
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="font-semibold text-gray-900">{{ title }}</p>
        <p class="mt-1 text-xs text-gray-600">
          {{ categoryHelpText }}
        </p>
        <div v-if="props.errorMessage" class="text-danger text-small blink-animation mt-1">
          <Icon size="sm" name="exclamation-circle" />
          <span class="ml-1">{{ props.errorMessage }}</span>
        </div>
        <p class="mt-1 text-xs text-gray-600">
          {{ t('integrations.show.documentTypes.count', { count: localValue.length }) }}
        </p>
      </div>
      <Button class="btn btn-sm btn-outline-primary" type="button" @click="pickerVisible = !pickerVisible">
        {{ pickerVisible ? t('shared.button.cancel') : t('shared.button.add') }}
      </Button>
    </div>

    <div class="mt-3 space-y-2">
      <div
        v-for="item in categoryItems"
        :key="item.key"
        :class="[
          'rounded border bg-white p-3 transition-colors',
          item.node ? 'cursor-pointer hover:border-primary/40' : 'border-gray-200',
          selectedListRemoteId === item.remoteId ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-200',
        ]"
        @click="previewExistingCategory(item)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p v-if="item.node" class="text-sm font-medium text-gray-900 break-words">
              {{ item.node.fullName || item.node.name }}
            </p>
            <p v-else-if="item.outdated" class="text-sm font-semibold text-red-600">
              {{ t('integrations.show.documentTypes.categories.outdatedCategoryDetected') }}
            </p>
            <p class="mt-2 inline-flex rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {{ t('integrations.show.documentTypes.categories.categoryId', { id: item.remoteId }) }}
            </p>
          </div>
          <Button
            class="btn btn-sm btn-outline-danger"
            type="button"
            :title="t('shared.button.delete')"
            @click.stop="removeAt(item.index)"
          >
            <Icon name="trash" class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div v-if="!categoryItems.length" class="rounded border border-dashed border-gray-300 bg-white/80 p-3 text-sm text-gray-500">
        {{ emptyMessage }}
      </div>
    </div>

    <div v-if="decodingCategories" class="mt-3 rounded border border-gray-200 bg-white p-2">
      <LocalLoader :loading="true" />
    </div>

    <div v-if="pickerVisible" class="mt-4 rounded border border-gray-200 bg-white p-4">
      <p class="mb-3 text-sm font-semibold text-gray-900">
        {{ t('integrations.show.documentTypes.categories.ebayPickerTitle') }}
      </p>
      <div v-if="loadingView" class="h-24">
        <LocalLoader :loading="true" />
      </div>
      <div v-else-if="!marketplaceViews.length" class="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
        {{ t('integrations.show.documentTypes.categories.noMarketplaces') }}
      </div>
      <template v-else>
        <div v-if="hasMultipleViews" class="my-4">
          <hr class="border-gray-200" />
          <p class="mt-3 text-sm font-semibold text-gray-900">
            {{ t('integrations.show.documentTypes.categories.selectMarketplace') }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <Button
              v-for="(view, index) in marketplaceViews"
              :key="view.id"
              :class="selectedViewId === view.id ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline-primary'"
              type="button"
              @click="selectMarketplaceView(view.id)"
            >
              {{ formatViewLabel(view, index) }}
            </Button>
          </div>
          <hr class="border-gray-200 mt-4" />
        </div>

        <div v-if="!activeCategoryTreeId" class="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
          {{
            t('integrations.show.documentTypes.categories.missingTreeForMarketplace', {
              marketplace: selectedViewLabel || t('integrations.show.documentTypes.categories.currentMarketplace'),
            })
          }}
        </div>
        <div v-else class="grid gap-4 lg:grid-cols-2">
          <div>
            <div class="min-h-0 h-full max-h-[65vh] overflow-hidden">
              <EbayCategoryBrowser
                :key="browserInstanceKey"
                :default-category-tree-id="activeCategoryTreeId"
                @selected="onSelectedFromBrowser"
              />
            </div>
          </div>
          <div class="overflow-y-auto min-h-0 h-full max-h-[65vh] lg:border-l lg:border-gray-200 lg:pl-4">
            <div v-if="selectedPickerPath" class="mb-2 text-xs text-gray-500">
              {{ selectedPickerPath }}
            </div>
            <EbayCategoryDetails
              v-if="selectedPickerNode"
              :category="selectedPickerNode"
            />
            <div v-else class="text-sm text-gray-500">
              {{ t('products.products.ebay.noSelection') }}
            </div>
          </div>
        </div>

        <div class="mt-4 border-t border-gray-200 pt-3">
          <p class="text-sm font-semibold text-gray-900">
            {{ t('products.products.ebay.manualEntry.title') }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('products.products.ebay.manualEntry.description') }}
          </p>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              v-model="manualCategoryInput"
              type="text"
              class="form-input flex-1"
              :placeholder="t('products.products.ebay.manualEntry.placeholder')"
              @keyup.enter="setManualCategory"
            />
            <Button
              class="btn btn-sm btn-outline-primary"
              type="button"
              :disabled="manualSelectionLoading || !manualCategoryId || !activeCategoryTreeId"
              :loading="manualSelectionLoading"
              @click="setManualCategory"
            >
              {{ t('products.products.ebay.manualEntry.button') }}
            </Button>
          </div>
          <p v-if="manualSelectionError" class="mt-2 text-xs text-red-600">
            {{ manualSelectionError }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.blink-animation {
  animation: blinker 2s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
