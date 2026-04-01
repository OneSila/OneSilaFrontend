<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../../../../shared/components/atoms/local-loader';
import { displayApolloError } from '../../../../../../../../../../shared/utils';
import { miraklCategoriesQuery } from '../../../../../../../../../../shared/api/queries/miraklProducts.js';
import MiraklCategoryBrowser from '../../../../../../../../../products/products/product-show/containers/tabs/mirakl/components/MiraklCategoryBrowser.vue';
import MiraklCategoryDetails from '../../../../../../../../../products/products/product-show/containers/tabs/mirakl/components/MiraklCategoryDetails.vue';
import {
  mapMiraklCategoriesConnection,
  normalizeMiraklCategoryNode,
  type MiraklCategoryNode,
} from '../../../../../../../../../products/products/product-show/containers/tabs/mirakl/components/miraklCategoryUtils';

type CategoryId = string | number;

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

const decodingCategories = ref(false);
const decodedMap = ref<Record<string, MiraklCategoryNode>>({});
const unresolvedRemoteIds = ref<Record<string, boolean>>({});
const decodedPaths = ref<Record<string, string>>({});
const pickerVisible = ref(false);
const selectedPickerNode = ref<MiraklCategoryNode | null>(null);
const selectedPickerPath = ref<string | null>(null);
const selectedListRemoteId = ref<string | null>(null);
const browserInstanceKey = ref(0);
const manualCategoryInput = ref('');
const manualSelectionLoading = ref(false);
const manualSelectionError = ref<string | null>(null);
const nodeCache = ref<Record<string, MiraklCategoryNode>>({});
let decodeRequestId = 0;

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

const remoteIds = computed(() =>
  localValue.value
    .map((value) => String(value))
    .filter((value) => value.length > 0),
);

const manualCategoryId = computed(() => manualCategoryInput.value.trim());

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

const emptyMessage = computed(() =>
  props.salesChannelId
    ? t('integrations.show.documentTypes.categories.empty')
    : t('products.products.mirakl.selectChannelPrompt'),
);

const resetSelectionPreview = () => {
  selectedListRemoteId.value = null;
  selectedPickerNode.value = null;
  selectedPickerPath.value = null;
};

const refreshBrowser = () => {
  browserInstanceKey.value += 1;
};

const fetchCategoryByRemoteId = async (remoteId: string): Promise<MiraklCategoryNode | null> => {
  if (!props.salesChannelId || !remoteId) {
    return null;
  }

  const cached = nodeCache.value[remoteId];
  if (cached) {
    return cached;
  }

  try {
    const { data } = await apolloClient.query({
      query: miraklCategoriesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: props.salesChannelId } },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: 'cache-first',
    });

    const node = mapMiraklCategoriesConnection(data?.miraklCategories)[0] || null;
    if (node?.remoteId) {
      nodeCache.value = {
        ...nodeCache.value,
        [node.remoteId]: node,
      };
    }
    return node;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const buildCategoryPath = async (node: MiraklCategoryNode | null): Promise<string | null> => {
  if (!node) {
    return null;
  }

  const segments = [node.name || node.remoteId];
  const visited = new Set<string>([node.remoteId]);
  let parentRemoteId = node.parent?.remoteId || null;
  let parentName = node.parent?.name || null;

  while (parentRemoteId && !visited.has(parentRemoteId)) {
    visited.add(parentRemoteId);
    const parentNode = await fetchCategoryByRemoteId(parentRemoteId);

    if (!parentNode) {
      if (parentName) {
        segments.unshift(parentName);
      }
      break;
    }

    segments.unshift(parentNode.name || parentNode.remoteId);
    parentRemoteId = parentNode.parent?.remoteId || null;
    parentName = parentNode.parent?.name || null;
  }

  return segments.filter(Boolean).join(' > ') || node.remoteId;
};

const decodeCategories = async () => {
  const requestId = ++decodeRequestId;
  const ids = Array.from(new Set(remoteIds.value));

  if (!ids.length) {
    decodingCategories.value = false;
    decodedMap.value = {};
    unresolvedRemoteIds.value = {};
    decodedPaths.value = {};
    return;
  }

  if (!props.salesChannelId) {
    decodingCategories.value = false;
    decodedMap.value = {};
    decodedPaths.value = {};
    unresolvedRemoteIds.value = ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
    return;
  }

  decodingCategories.value = true;
  const mapped: Record<string, MiraklCategoryNode> = {};
  const pathMap: Record<string, string> = {};

  try {
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const { data } = await apolloClient.query({
        query: miraklCategoriesQuery,
        variables: {
          first: batch.length,
          filter: {
            salesChannel: { id: { exact: props.salesChannelId } },
            remoteId: { inList: batch },
          },
        },
        fetchPolicy: 'cache-first',
      });

      const nodes = mapMiraklCategoriesConnection(data?.miraklCategories);

      for (const node of nodes) {
        if (!node.remoteId) {
          continue;
        }

        mapped[node.remoteId] = node;
        nodeCache.value = {
          ...nodeCache.value,
          [node.remoteId]: node,
        };
        pathMap[node.remoteId] = (await buildCategoryPath(node)) || node.name || node.remoteId;
      }
    }
  } catch (error) {
    displayApolloError(error);
  } finally {
    if (requestId !== decodeRequestId) {
      return;
    }

    decodedMap.value = mapped;
    decodedPaths.value = pathMap;
    unresolvedRemoteIds.value = ids.reduce<Record<string, boolean>>((acc, id) => {
      acc[id] = !mapped[id];
      return acc;
    }, {});
    decodingCategories.value = false;
  }
};

watch(
  [remoteIds, () => props.salesChannelId],
  () => {
    void decodeCategories();
  },
  { immediate: true },
);

const formatPath = (node: MiraklCategoryNode | null, remoteId: string): string => {
  if (!node) {
    return remoteId;
  }
  return decodedPaths.value[remoteId] || node.name || remoteId;
};

const addCategory = (node: MiraklCategoryNode, path: string) => {
  if (!node.remoteId || localValue.value.some((value) => String(value) === node.remoteId)) {
    return;
  }

  decodedMap.value = {
    ...decodedMap.value,
    [node.remoteId]: node,
  };
  nodeCache.value = {
    ...nodeCache.value,
    [node.remoteId]: node,
  };
  decodedPaths.value = {
    ...decodedPaths.value,
    [node.remoteId]: path || node.name || node.remoteId,
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

const previewExistingCategory = (item: { remoteId: string; node: MiraklCategoryNode | null }) => {
  if (!item.node) {
    return;
  }

  selectedListRemoteId.value = item.remoteId;
  selectedPickerNode.value = item.node;
  selectedPickerPath.value = formatPath(item.node, item.remoteId);
  pickerVisible.value = true;
};

const onSelectedFromBrowser = (payload: { node: MiraklCategoryNode; path: MiraklCategoryNode[] }) => {
  const normalizedNode = normalizeMiraklCategoryNode(payload.node);
  const path = payload.path.map((item) => item.name).filter(Boolean).join(' > ')
    || normalizedNode.name
    || normalizedNode.remoteId;
  addCategory(normalizedNode, path);
  manualSelectionError.value = null;
  resetSelectionPreview();
  refreshBrowser();
};

const setManualCategory = async () => {
  if (!manualCategoryId.value || manualSelectionLoading.value) {
    return;
  }
  if (!props.salesChannelId) {
    manualSelectionError.value = t('products.products.mirakl.selectChannelPrompt');
    return;
  }

  manualSelectionLoading.value = true;
  manualSelectionError.value = null;
  try {
    const node = await fetchCategoryByRemoteId(manualCategoryId.value);
    if (!node) {
      manualSelectionError.value = t('products.products.mirakl.manualEntry.invalid');
      return;
    }

    const path = (await buildCategoryPath(node)) || node.name || node.remoteId;
    addCategory(node, path);
    manualCategoryInput.value = '';
    resetSelectionPreview();
    refreshBrowser();
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
        {{ t('products.products.mirakl.categoryTitle') }}
      </p>

      <div v-if="!props.salesChannelId" class="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-500">
        {{ t('products.products.mirakl.selectChannelPrompt') }}
      </div>
      <template v-else>
        <div class="grid gap-4 lg:grid-cols-2">
          <div>
            <div class="min-h-0 h-full max-h-[65vh] overflow-hidden">
              <MiraklCategoryBrowser
                :key="browserInstanceKey"
                :sales-channel-id="props.salesChannelId || null"
                @selected="onSelectedFromBrowser"
              />
            </div>
          </div>
          <div class="overflow-y-auto min-h-0 h-full max-h-[65vh] lg:border-l lg:border-gray-200 lg:pl-4">
            <div v-if="selectedPickerPath" class="mb-2 text-xs text-gray-500">
              {{ selectedPickerPath }}
            </div>
            <MiraklCategoryDetails
              v-if="selectedPickerNode"
              :category="selectedPickerNode"
              :sales-channel-id="props.salesChannelId || null"
              :channel="null"
            />
            <div v-else class="text-sm text-gray-500">
              {{ t('products.products.mirakl.noSelection') }}
            </div>
          </div>
        </div>

        <div class="mt-4 border-t border-gray-200 pt-3">
          <p class="text-sm font-semibold text-gray-900">
            {{ t('products.products.mirakl.manualEntry.title') }}
          </p>
          <p class="mt-1 text-xs text-gray-500">
            {{ t('products.products.mirakl.manualEntry.description') }}
          </p>
          <div class="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              v-model="manualCategoryInput"
              type="text"
              class="form-input flex-1"
              :placeholder="t('products.products.mirakl.manualEntry.placeholder')"
              @keyup.enter="setManualCategory"
            />
            <Button
              class="btn btn-sm btn-outline-primary"
              type="button"
              :disabled="manualSelectionLoading || !manualCategoryId || !props.salesChannelId"
              :loading="manualSelectionLoading"
              @click="setManualCategory"
            >
              {{ t('products.products.mirakl.manualEntry.button') }}
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
