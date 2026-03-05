<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../../../../shared/components/atoms/local-loader';
import { Toast } from '../../../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../../../shared/utils';
import { amazonBrowseNodesQuery } from '../../../../../../../../../../shared/api/queries/amazonProducts.js';
import { amazonChannelViewsQuery } from '../../../../../../../../../../shared/api/queries/salesChannels.js';

type CategoryId = string | number;

interface AmazonBrowseNode {
  remoteId: string;
  name: string;
  hasChildren: boolean;
  browsePathByName: string[];
  productTypeDefinitions: string[];
}

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

const loadingViews = ref(false);
const decodingCategories = ref(false);
const marketplaceViews = ref<any[]>([]);
const selectedViewId = ref<string | null>(null);

const loadingNodes = ref(false);
const nodes = ref<AmazonBrowseNode[]>([]);
const currentParentId = ref<string | null>(null);
const pathStack = ref<AmazonBrowseNode[]>([]);
const search = ref('');

const decodedMap = ref<Record<string, AmazonBrowseNode>>({});
const unresolvedRemoteIds = ref<Record<string, boolean>>({});

const pickerVisible = ref(false);
const selectedPickerNode = ref<AmazonBrowseNode | null>(null);
const selectedPickerPath = ref<string | null>(null);
const selectedListRemoteId = ref<string | null>(null);

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

const filteredNodes = computed(() =>
  nodes.value.filter((node) =>
    node.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const selectedView = computed(() =>
  marketplaceViews.value.find((view: any) => view.id === selectedViewId.value) || null,
);

const selectedViewIndex = computed(() =>
  marketplaceViews.value.findIndex((view: any) => view.id === selectedViewId.value),
);

const activeMarketplaceId = computed(() => selectedView.value?.remoteId || null);

const hasMultipleViews = computed(() => marketplaceViews.value.length > 1);

const categoryMarketplaceIds = computed(() =>
  Array.from(
    new Set(
      marketplaceViews.value
        .map((view: any) => view?.remoteId)
        .filter((value: string | null) => Boolean(value)),
    ),
  ),
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

const selectedViewLabel = computed(() =>
  selectedView.value
    ? formatViewLabel(selectedView.value, selectedViewIndex.value >= 0 ? selectedViewIndex.value : 0)
    : '',
);

const emptyMessage = computed(() =>
  categoryMarketplaceIds.value.length
    ? t('integrations.show.documentTypes.categories.empty')
    : t('integrations.show.documentTypes.categories.noMarketplaces'),
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

const formatPath = (node: AmazonBrowseNode | null, remoteId: string): string => {
  if (!node) {
    return remoteId;
  }
  if (Array.isArray(node.browsePathByName) && node.browsePathByName.length) {
    return node.browsePathByName.join(' > ');
  }
  return node.name || remoteId;
};

const resetNavigation = () => {
  search.value = '';
  currentParentId.value = null;
  pathStack.value = [];
};

const resetSelectionPreview = () => {
  selectedListRemoteId.value = null;
  selectedPickerNode.value = null;
  selectedPickerPath.value = null;
};

const normalizeAmazonNode = (node: any): AmazonBrowseNode => ({
  remoteId: node?.remoteId ?? '',
  name: node?.name ?? '',
  hasChildren: Boolean(node?.hasChildren),
  browsePathByName: Array.isArray(node?.browsePathByName) ? node.browsePathByName.filter((item: unknown) => typeof item === 'string') : [],
  productTypeDefinitions: Array.isArray(node?.productTypeDefinitions) ? node.productTypeDefinitions.filter((item: unknown) => typeof item === 'string') : [],
});

const fetchMarketplaceViews = async () => {
  if (!props.salesChannelId) {
    marketplaceViews.value = [];
    selectedViewId.value = null;
    return;
  }

  loadingViews.value = true;
  try {
    const { data } = await apolloClient.query({
      query: amazonChannelViewsQuery,
      variables: {
        first: 100,
        filter: { salesChannel: { id: { exact: props.salesChannelId } } },
      },
      fetchPolicy: 'cache-first',
    });

    const views = (data?.amazonChannelViews?.edges?.map((edge: any) => edge.node) || []).sort((a: any, b: any) => {
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? -1 : 1;
      }
      return formatViewLabel(a, 0).localeCompare(formatViewLabel(b, 0));
    });

    marketplaceViews.value = views;

    if (selectedViewId.value && views.some((view: any) => view.id === selectedViewId.value)) {
      return;
    }

    const defaultView = views.find((view: any) => view.isDefault) || views[0] || null;
    selectedViewId.value = defaultView?.id || null;
  } catch (error) {
    marketplaceViews.value = [];
    selectedViewId.value = null;
    displayApolloError(error);
  } finally {
    loadingViews.value = false;
  }
};

watch(
  () => props.salesChannelId,
  () => {
    resetNavigation();
    resetSelectionPreview();
    fetchMarketplaceViews();
  },
  { immediate: true },
);

const fetchNodes = async () => {
  if (!activeMarketplaceId.value) {
    nodes.value = [];
    return;
  }

  loadingNodes.value = true;
  try {
    const filter: any = {
      marketplaceId: { exact: activeMarketplaceId.value },
    };
    if (!currentParentId.value) {
      filter.isRoot = { exact: true };
    } else {
      filter.parentNode = { remoteId: { exact: currentParentId.value } };
    }

    const { data } = await apolloClient.query({
      query: amazonBrowseNodesQuery,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });

    nodes.value = (data?.amazonBrowseNodes?.edges?.map((edge: any) => normalizeAmazonNode(edge.node)) || []);
  } catch (error) {
    nodes.value = [];
    displayApolloError(error);
  } finally {
    loadingNodes.value = false;
  }
};

watch(
  [activeMarketplaceId, currentParentId],
  () => {
    fetchNodes();
  },
  { immediate: true },
);

const decodeCategories = async () => {
  const requestId = ++decodeRequestId;
  const ids = Array.from(new Set(remoteIds.value));

  if (!ids.length) {
    decodingCategories.value = false;
    decodedMap.value = {};
    unresolvedRemoteIds.value = {};
    return;
  }

  const marketplaceIds = categoryMarketplaceIds.value;
  if (!marketplaceIds.length) {
    decodingCategories.value = false;
    decodedMap.value = {};
    unresolvedRemoteIds.value = ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
    return;
  }

  decodingCategories.value = true;
  const mapped: Record<string, AmazonBrowseNode> = {};
  const unresolvedIds = new Set(ids);

  try {
    for (const marketplaceId of marketplaceIds) {
      if (!unresolvedIds.size) {
        break;
      }
      const unresolvedList = Array.from(unresolvedIds);
      for (let i = 0; i < unresolvedList.length; i += 50) {
        const batch = unresolvedList.slice(i, i + 50);
        const { data } = await apolloClient.query({
          query: amazonBrowseNodesQuery,
          variables: {
            filter: {
              marketplaceId: { exact: marketplaceId },
              remoteId: { inList: batch },
            },
          },
          fetchPolicy: 'cache-first',
        });

        const fetchedNodes = data?.amazonBrowseNodes?.edges?.map((edge: any) => normalizeAmazonNode(edge.node)) || [];
        fetchedNodes.forEach((node: AmazonBrowseNode) => {
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
  [remoteIds, categoryMarketplaceIds],
  () => {
    decodeCategories();
  },
  { immediate: true },
);

const fetchNodeDetailsFromActiveMarketplace = async (remoteId: string): Promise<AmazonBrowseNode | null> => {
  if (!activeMarketplaceId.value) {
    return null;
  }
  try {
    const { data } = await apolloClient.query({
      query: amazonBrowseNodesQuery,
      variables: {
        filter: {
          marketplaceId: { exact: activeMarketplaceId.value },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: 'cache-first',
    });

    const node = data?.amazonBrowseNodes?.edges?.[0]?.node;
    return node ? normalizeAmazonNode(node) : null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const addCategory = (node: AmazonBrowseNode) => {
  if (!node.remoteId || localValue.value.some((value) => String(value) === node.remoteId)) {
    return;
  }

  decodedMap.value = {
    ...decodedMap.value,
    [node.remoteId]: node,
  };
  unresolvedRemoteIds.value = {
    ...unresolvedRemoteIds.value,
    [node.remoteId]: false,
  };
  localValue.value = [...localValue.value, node.remoteId];
};

const removeAt = (index: number) => {
  const removedRemoteId = String(localValue.value[index] || '');
  const nextValue = [...localValue.value];
  nextValue.splice(index, 1);
  localValue.value = nextValue;

  if (removedRemoteId && selectedListRemoteId.value === removedRemoteId) {
    resetSelectionPreview();
  }
};

const selectMarketplaceView = (viewId: string) => {
  if (selectedViewId.value === viewId) {
    return;
  }

  selectedViewId.value = viewId;
  resetNavigation();
  resetSelectionPreview();
  manualSelectionError.value = null;
};

const goToChild = (node: AmazonBrowseNode) => {
  if (!node.hasChildren) {
    return;
  }
  pathStack.value.push(node);
  currentParentId.value = node.remoteId;
  search.value = '';
};

const goToLevel = (index: number | null) => {
  search.value = '';
  if (index === null) {
    resetNavigation();
    return;
  }
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentParentId.value = pathStack.value[index].remoteId;
};

const goBack = () => {
  if (!pathStack.value.length) {
    goToLevel(null);
    return;
  }
  const target = pathStack.value.length - 2;
  goToLevel(target >= 0 ? target : null);
};

const handleNodeSelection = (node: AmazonBrowseNode) => {
  if (node.hasChildren) {
    Toast.info(t('products.products.amazon.leafRestriction'));
    return;
  }

  addCategory(node);
  resetNavigation();
  resetSelectionPreview();
  manualSelectionError.value = null;
};

const previewExistingCategory = (item: { remoteId: string; node: AmazonBrowseNode | null }) => {
  if (!item.node) {
    return;
  }

  selectedListRemoteId.value = item.remoteId;
  selectedPickerNode.value = item.node;
  selectedPickerPath.value = formatPath(item.node, item.remoteId);
  pickerVisible.value = true;
};

const setManualCategory = async () => {
  if (!manualCategoryId.value || manualSelectionLoading.value) {
    return;
  }
  if (!activeMarketplaceId.value) {
    manualSelectionError.value = t('products.products.amazon.manualEntry.invalid');
    return;
  }

  manualSelectionLoading.value = true;
  manualSelectionError.value = null;
  try {
    const node = await fetchNodeDetailsFromActiveMarketplace(manualCategoryId.value);
    if (!node) {
      manualSelectionError.value = t('products.products.amazon.manualEntry.invalid');
      return;
    }

    addCategory(node);
    manualCategoryInput.value = '';
    resetNavigation();
    resetSelectionPreview();
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

    <div class="mt-3 space-y-2 max-h-72 overflow-y-auto pr-1 category-list-scroll">
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
              {{ formatPath(item.node, item.remoteId) }}
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
        {{ t('integrations.show.documentTypes.categories.amazonPickerTitle') }}
      </p>

      <div v-if="loadingViews" class="h-24">
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

        <div v-if="!activeMarketplaceId" class="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
          {{
            t('integrations.show.documentTypes.categories.missingMarketplaceIdForMarketplace', {
              marketplace: selectedViewLabel || t('integrations.show.documentTypes.categories.currentMarketplace'),
            })
          }}
        </div>
        <div v-else class="grid gap-4 lg:grid-cols-2">
          <div>
            <div class="flex items-center gap-2 text-sm mb-2">
              <span class="cursor-pointer hover:underline" @click="goToLevel(null)">
                {{ t('products.products.amazon.browseNodeRoot') }}
              </span>
              <template v-for="(crumb, index) in pathStack" :key="crumb.remoteId">
                <span>&gt;</span>
                <span class="cursor-pointer hover:underline" @click="goToLevel(index)">
                  {{ crumb.name }}
                </span>
              </template>
              <div v-if="pathStack.length" class="flex gap-1 ml-auto">
                <Button class="btn btn-sm btn-outline-primary" @click="goBack">
                  {{ t('shared.button.back') }}
                </Button>
              </div>
            </div>

            <input
              v-model="search"
              type="text"
              class="form-input w-full mb-2"
              :placeholder="t('shared.button.search') + '...'"
            />

            <div class="min-h-0 h-full max-h-[65vh] overflow-y-auto pr-1">
              <div v-if="loadingNodes">
                <LocalLoader :loading="true" />
              </div>
              <ul v-else class="space-y-1">
                <li
                  v-for="node in filteredNodes"
                  :key="node.remoteId"
                  class="flex justify-between items-center py-2 px-2 border rounded hover:bg-gray-100"
                >
                  <div
                    class="flex items-center gap-2 flex-1 cursor-pointer"
                    @click="node.hasChildren ? goToChild(node) : handleNodeSelection(node)"
                  >
                    <Icon :name="node.hasChildren ? 'angle-right' : 'circle'" class="w-3" />
                    <span>{{ node.name }}</span>
                  </div>
                  <div class="flex gap-2">
                    <Button
                      class="btn btn-sm btn-outline-primary"
                      :disabled="node.hasChildren"
                      :title="node.hasChildren ? t('products.products.amazon.leafRestriction') : undefined"
                      @click.stop="handleNodeSelection(node)"
                    >
                      {{ t('shared.button.select') }}
                    </Button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div class="overflow-y-auto min-h-0 h-full max-h-[65vh] lg:border-l lg:border-gray-200 lg:pl-4">
            <div v-if="selectedPickerPath" class="mb-2 text-xs text-gray-500">
              {{ selectedPickerPath }}
            </div>
            <div v-if="selectedPickerNode">
              <div class="text-sm font-medium">{{ selectedPickerNode.name }}</div>
              <div class="text-xs text-gray-500">{{ selectedPickerNode.remoteId }}</div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatPath(selectedPickerNode, selectedPickerNode.remoteId) }}
              </div>
              <div v-if="selectedPickerNode.productTypeDefinitions.length" class="mt-3">
                <h6 class="font-semibold text-xs text-gray-700 mb-1">
                  {{ t('products.products.amazon.recommendedProductTypes') }}
                </h6>
                <ul class="space-y-1">
                  <li
                    v-for="item in selectedPickerNode.productTypeDefinitions"
                    :key="item"
                    class="text-xs text-gray-700"
                  >
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">
              {{ t('products.products.amazon.noBrowseNodeSelected') }}
            </div>
          </div>
        </div>

        <div class="mt-4 border-t border-gray-200 pt-3">
          <p class="text-sm font-semibold text-gray-900">
            {{ t('products.products.amazon.manualEntry.title') }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('products.products.amazon.manualEntry.description') }}
          </p>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              v-model="manualCategoryInput"
              type="text"
              class="form-input flex-1"
              :placeholder="t('products.products.amazon.manualEntry.placeholder')"
              @keyup.enter="setManualCategory"
            />
            <Button
              class="btn btn-sm btn-outline-primary"
              type="button"
              :disabled="manualSelectionLoading || !manualCategoryId || !activeMarketplaceId"
              :loading="manualSelectionLoading"
              @click="setManualCategory"
            >
              {{ t('products.products.amazon.manualEntry.button') }}
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

.category-list-scroll {
  scrollbar-width: thin;
  scrollbar-color: #94a3b8 #f1f5f9;
}

.category-list-scroll::-webkit-scrollbar {
  width: 8px;
}

.category-list-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 9999px;
}

.category-list-scroll::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 9999px;
  border: 2px solid #f1f5f9;
}

.category-list-scroll::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
