<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch, type Ref } from 'vue';
import type { FetchPolicy } from '@apollo/client';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next';

import { Product } from '../../../../../../configs';
import { Link } from '../../../../../../../../../shared/components/atoms/link';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { Image } from '../../../../../../../../../shared/components/atoms/image';
import { Toggle } from '../../../../../../../../../shared/components/atoms/toggle';
import { ApolloAlertMutation } from '../../../../../../../../../shared/components/molecules/apollo-alert-mutation';
import { VideoListingPreview } from '../../../../../../../../media/videos/videos-list/containers/video-listing-preview';
import {
  formatDate,
  getFileName,
  getFileSize,
  getPath,
  TYPE_DOCUMENT,
  TYPE_IMAGE,
  TYPE_VIDEO
} from '../../../../../../../../media/files/media';
import { mediaProductThroughQuery } from '../../../../../../../../../shared/api/queries/media.js';
import {
  createMediaProductThroughsMutation,
  deleteMediaProductThroughMutation,
  updateMediaProductThroughMutation
} from '../../../../../../../../../shared/api/mutations/media.js';
import apolloClient from '../../../../../../../../../../apollo-client';

interface MediaOwner {
  firstName?: string | null;
  lastName?: string | null;
}

interface Media {
  id: string;
  type: string;
  imageWebUrl: string;
  videoUrl: string;
  updatedAt: Date;
  owner: MediaOwner | null;
}

interface SalesChannelInfo {
  id: string;
  type: string;
  hostname?: string | null;
  name?: string | null;
}

type Item = {
  id: string;
  isMainImage: boolean;
  active: boolean;
  productType: string | null;
  sortOrder: number | null;
  media: Media;
  salesChannel: SalesChannelInfo | null;
};

type EnsureChannelSpecificSetResult = {
  duplicated: boolean;
  appliedToCurrentChannel: boolean;
  createdEntries: Array<{ id: string; media: { id: string } }> | null;
};

const props = defineProps<{
  product: Product;
  refetchNeeded: boolean;
  salesChannelId: string;
}>();

const emit = defineEmits<{
  (e: 'refetched'): void;
  (e: 'update-ids', ids: string[]): void;
  (e: 'items-loaded', payload: { items: Item[]; inherited: boolean }): void;
  (e: 'mutation-start'): void;
  (e: 'mutation-end'): void;
}>();

const { t } = useI18n();

const viewType = ref<'gallery' | 'table'>('gallery');
const items: Ref<Item[]> = ref([]);
const defaultItems: Ref<Item[]> = ref([]);
const inheritedFromDefault = ref(false);
const isMainImageMap = ref<Record<string, boolean>>({});
const deleteVariables = reactive<Record<string, { id: string }>>({});
const activeMutations = ref(0);

const runWithMutationGuard = async <T>(operation: () => Promise<T>): Promise<T> => {
  if (activeMutations.value === 0) {
    emit('mutation-start');
  }

  activeMutations.value += 1;

  try {
    return await operation();
  } finally {
    activeMutations.value -= 1;
    if (activeMutations.value === 0) {
      emit('mutation-end');
    }
  }
};

const isDefaultChannel = computed(() => props.salesChannelId === 'default');
const isChannelInherited = computed(() => !isDefaultChannel.value && inheritedFromDefault.value);

const extractNodes = (connection: any): Item[] => {
  if (!connection?.edges?.length) {
    return [];
  }
  return connection.edges.map((edge: any) => edge.node as Item);
};

const buildFilter = (channelId: string) => {
  const filter: Record<string, any> = {
    product: { id: { exact: props.product.id } }
  };

  if (channelId === 'default') {
    filter.salesChannel = { id: { isNull: true } };
  } else {
    filter.salesChannel = { id: { exact: channelId } };
  }

  return filter;
};

const syncMainImageMap = (entries: Item[]) => {
  const map: Record<string, boolean> = {};
  entries.forEach((entry) => {
    map[entry.media.id] = entry.isMainImage;
  });
  isMainImageMap.value = map;
};

const loadDefaultItems = async (policy: FetchPolicy = 'cache-first') => {
  const { data } = await apolloClient.query({
    query: mediaProductThroughQuery,
    variables: { filter: buildFilter('default') },
    fetchPolicy: policy
  });

  return extractNodes(data?.mediaProductThroughs);
};

const emitState = () => {
  emit('update-ids', items.value.map((entry) => entry.media.id));
  emit('items-loaded', { items: items.value, inherited: inheritedFromDefault.value });
};

const fetchData = async (
  policy: FetchPolicy = 'cache-first',
  channelId: string = props.salesChannelId
): Promise<{ appliedToCurrentChannel: boolean; nodes: Item[] }> => {
  const { data } = await apolloClient.query({
    query: mediaProductThroughQuery,
    variables: { filter: buildFilter(channelId) },
    fetchPolicy: policy
  });

  const nodes = extractNodes(data?.mediaProductThroughs);

  if (channelId === 'default') {
    defaultItems.value = nodes;
    if (channelId !== props.salesChannelId) {
      return { appliedToCurrentChannel: false, nodes };
    }
    items.value = nodes;
    inheritedFromDefault.value = false;
  } else if (nodes.length === 0) {
    const defaults = defaultItems.value.length ? defaultItems.value : await loadDefaultItems(policy);
    defaultItems.value = defaults;
    if (channelId !== props.salesChannelId) {
      return { appliedToCurrentChannel: false, nodes: defaults };
    }
    items.value = defaults;
    inheritedFromDefault.value = true;
  } else {
    if (!defaultItems.value.length) {
      defaultItems.value = await loadDefaultItems(policy);
    }
    if (channelId !== props.salesChannelId) {
      return { appliedToCurrentChannel: false, nodes };
    }
    items.value = nodes;
    inheritedFromDefault.value = false;
  }

  syncMainImageMap(items.value);
  Object.keys(deleteVariables).forEach((key) => {
    delete deleteVariables[key];
  });
  emitState();

  return { appliedToCurrentChannel: true, nodes: items.value };
};

const ensureChannelSpecificSet = async (): Promise<EnsureChannelSpecificSetResult> => {
  const channelId = props.salesChannelId;
  const inheritedAtCall = inheritedFromDefault.value;

  if (channelId === 'default' || !inheritedAtCall) {
    return {
      duplicated: false,
      appliedToCurrentChannel: false,
      createdEntries: null
    };
  }

  const defaults = defaultItems.value.length
    ? defaultItems.value
    : await loadDefaultItems('network-only');

  if (!defaults.length) {
    if (channelId === props.salesChannelId) {
      inheritedFromDefault.value = false;
      items.value = [];
      syncMainImageMap(items.value);
      emitState();
    }

    return {
      duplicated: false,
      appliedToCurrentChannel: false,
      createdEntries: null
    };
  }

  let createdEntries: Array<{ id: string; media: { id: string } }> | null = null;

  await runWithMutationGuard(async () => {
    const { data } = await apolloClient.mutate({
      mutation: createMediaProductThroughsMutation,
      variables: {
        data: defaults.map((item, index) => ({
          product: { id: props.product.id },
          media: { id: item.media.id },
          salesChannel: { id: channelId },
          sortOrder: index,
          isMainImage: item.isMainImage
        }))
      }
    });

    createdEntries = data?.createMediaproducthroughs ?? null;

    if (channelId === props.salesChannelId) {
      inheritedFromDefault.value = false;
      await fetchData('network-only', channelId);
    }
  });

  return {
    duplicated: true,
    appliedToCurrentChannel: channelId === props.salesChannelId,
    createdEntries
  };
};

const resolveDuplicatedTarget = (item: Item, result: EnsureChannelSpecificSetResult): Item => {
  if (!result.duplicated) {
    return item;
  }

  if (result.appliedToCurrentChannel) {
    return items.value.find((entry) => entry.media.id === item.media.id) || item;
  }

  const createdEntry = result.createdEntries?.find((entry) => entry.media?.id === item.media.id);
  if (createdEntry) {
    return { ...item, id: createdEntry.id };
  }

  return item;
};

defineExpose({ ensureChannelSpecificSet });

onMounted(() => {
  fetchData();
});

watch(() => props.salesChannelId, () => {
  fetchData('network-only');
});

watch(() => props.refetchNeeded, (newValue) => {
  if (newValue) {
    fetchData('network-only');
    emit('refetched');
  }
});

const handleDeleteSuccess = () => {
  fetchData('network-only');
};

const persistSortOrder = async (orderedMediaIds: string[]) => {
  const orderedEntries = orderedMediaIds
    .map((mediaId) => items.value.find((entry) => entry.media.id === mediaId))
    .filter((entry): entry is Item => Boolean(entry));

  const updatePromises = orderedEntries.map((entry, index) => {
    if ((entry.sortOrder ?? index) === index) {
      return null;
    }
    return apolloClient.mutate({
      mutation: updateMediaProductThroughMutation,
      variables: {
        data: {
          id: entry.id,
          sortOrder: index
        }
      }
    });
  }).filter(Boolean) as Promise<any>[];

  if (!updatePromises.length) {
    await fetchData('network-only');
    return;
  }

  await runWithMutationGuard(async () => {
    await Promise.allSettled(updatePromises);
    await fetchData('network-only');
  });
};

const handleEnd = async () => {
  const orderedMediaIds = items.value.map((entry) => entry.media.id);

  if (!isDefaultChannel.value && inheritedFromDefault.value) {
    const duplicationResult = await ensureChannelSpecificSet();
    if (duplicationResult.duplicated && duplicationResult.appliedToCurrentChannel) {
      await nextTick();
    }
  }

  await persistSortOrder(orderedMediaIds);
};

const updateMainImage = async (target: Item) => {
  await runWithMutationGuard(async () => {
    await apolloClient.mutate({
      mutation: updateMediaProductThroughMutation,
      variables: {
        data: {
          id: target.id,
          isMainImage: !!isMainImageMap.value[target.media.id]
        }
      }
    });

    await fetchData('network-only');
  });
};

const handleMainImageChange = async (item: Item) => {
  await runWithMutationGuard(async () => {
    let target = item;

    if (!isDefaultChannel.value && inheritedFromDefault.value) {
      const duplicationResult = await ensureChannelSpecificSet();
      if (duplicationResult.duplicated && duplicationResult.appliedToCurrentChannel) {
        await nextTick();
      }
      target = resolveDuplicatedTarget(item, duplicationResult);
    }

    await updateMainImage(target);
  });
};

const prepareDelete = async (item: Item, confirm: () => Promise<void>) => {
  let target = item;

  if (!isDefaultChannel.value && inheritedFromDefault.value) {
    const duplicationResult = await ensureChannelSpecificSet();
    if (duplicationResult.duplicated && duplicationResult.appliedToCurrentChannel) {
      await nextTick();
    }
    target = resolveDuplicatedTarget(item, duplicationResult);
  }

  deleteVariables[item.media.id] = { id: target.id };
  await runWithMutationGuard(confirm);
};

</script>

<template>
  <div>
    <Flex between class="py-2">
      <FlexCell grow></FlexCell>
      <FlexCell>
        <div class="bg-gray-100 px-2 py-1 rounded-lg">
          <Button class="mr-2" @click="viewType = 'table'" :class="{ 'text-blue-500': viewType === 'table' }">
            <Icon name="table" />
          </Button>
          <Button @click="viewType = 'gallery'" :class="{ 'text-blue-500': viewType === 'gallery' }">
            <Icon name="images" />
          </Button>
        </div>
      </FlexCell>
    </Flex>
    <div>
      <div
        v-if="isChannelInherited"
        class="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"
      >
        {{ t('products.products.variations.media.messages.inheritedFromDefault') }}
      </div>
      <div v-if="viewType === 'table'" class="overflow-x-auto" :class="{ 'opacity-60': isChannelInherited }">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr class="text-gray-800 dark:text-gray-300">
                  <th scope="col" class="p-3.5 text-sm text-start font-semibold">
                    {{ t('media.media.labels.fileName') }}
                  </th>
                  <th scope="col" class="p-3.5 text-sm text-start font-semibold">
                    {{ t('media.media.labels.lastModified') }}
                  </th>
                  <th scope="col" class="p-3.5 text-sm text-start font-semibold">
                    {{ t('media.media.labels.fileSize') }}
                  </th>
                  <th scope="col" class="p-3.5 text-sm text-start font-semibold">
                    {{ t('media.media.labels.owner') }}
                  </th>
                  <th scope="col" class="p-3.5 text-sm text-start font-semibold">
                    {{ t('media.media.labels.isMainImage') }}
                  </th>
                  <th scope="col" class="p-3.5 text-sm text-start font-semibold">
                    {{ t('shared.labels.actions') }}
                  </th>
                </tr>
              </thead>
              <VueDraggableNext
                tag="tbody"
                :list="items"
                class="dragArea divide-y divide-gray-200 dark:divide-gray-600"
                @end="handleEnd"
              >
                <tr v-for="item in items" :key="item.id">
                  <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                    <span v-if="item.media.type === TYPE_DOCUMENT">
                      {{ getFileName(item.media) }}
                    </span>
                    <Link v-else :path="getPath(item.media)">
                      {{ getFileName(item.media) }}
                    </Link>
                  </td>
                  <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                    {{ formatDate(item.media.updatedAt) }}
                  </td>
                  <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                    {{ getFileSize(item.media) }}
                  </td>
                  <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                    {{
                      item.media?.owner?.firstName || item.media?.owner?.lastName
                        ? `${item.media.owner?.firstName || ''} ${item.media.owner?.lastName || ''}`.trim()
                        : '-'
                    }}
                  </td>
                  <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                    <Toggle
                      v-if="item.media.type === TYPE_IMAGE"
                      v-model="isMainImageMap[item.media.id]"
                      @update:modelValue="handleMainImageChange(item)"
                    />
                  </td>
                  <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                    <Flex>
                      <FlexCell v-if="item.media.type === TYPE_IMAGE" class="mr-2"></FlexCell>
                      <FlexCell>
                        <ApolloAlertMutation
                          :mutation="deleteMediaProductThroughMutation"
                          :mutation-variables="deleteVariables[item.media.id] ?? { id: item.id }"
                          @done="handleDeleteSuccess"
                        >
                          <template #default="{ confirmAndMutate }">
                            <Button @click="() => prepareDelete(item, confirmAndMutate)">
                              <Icon name="trash" />
                            </Button>
                          </template>
                        </ApolloAlertMutation>
                      </FlexCell>
                    </Flex>
                  </td>
                </tr>
              </VueDraggableNext>
            </table>
          </div>
        </div>
      </div>
      <div v-else>
        <VueDraggableNext
          :list="items"
          class="dragArea gallery grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3"
          :class="{ 'opacity-60': isChannelInherited }"
          @end="handleEnd"
        >
          <div v-for="item in items" :key="item.media.id" class="file-entry relative">
            <template v-if="item.media.type === TYPE_IMAGE">
              <Link :path="getPath(item.media)">
                <div class="flex h-48 w-56 items-center justify-center overflow-hidden rounded-md">
                  <Image
                    :source="item.media.imageWebUrl"
                    :alt="t('media.media.labels.fileThumbnail')"
                    class="h-full w-full object-contain"
                  />
                </div>
              </Link>
            </template>
            <template v-else-if="item.media.type === TYPE_VIDEO">
              <Link :path="getPath(item.media)">
                <VideoListingPreview :video-url="item.media.videoUrl" />
              </Link>
            </template>
            <template v-else-if="item.media.type === TYPE_DOCUMENT">
              <div class="flex h-48 items-center justify-center rounded-md bg-gray-200 px-28">
                <Icon name="file-text" size="2xl" class="text-gray-600" />
              </div>
            </template>

            <div class="overlay-info absolute bottom-0 left-0 right-0 hidden bg-gray-700 bg-opacity-50 p-2 text-md font-medium text-white">
              <Flex>
                <FlexCell center grow>
                  {{ getFileName(item.media) }} {{ getFileSize(item.media) }}
                </FlexCell>
                <FlexCell v-if="item.media.type === TYPE_IMAGE" center class="mr-2">
                  <Toggle
                    v-model="isMainImageMap[item.media.id]"
                    @update:modelValue="handleMainImageChange(item)"
                  />
                </FlexCell>
                <FlexCell center>
                  <ApolloAlertMutation
                    :mutation="deleteMediaProductThroughMutation"
                    :mutation-variables="deleteVariables[item.media.id] ?? { id: item.id }"
                    @done="handleDeleteSuccess"
                  >
                    <template #default="{ confirmAndMutate }">
                      <Button @click="() => prepareDelete(item, confirmAndMutate)">
                        <Icon size="xl" name="trash" />
                      </Button>
                    </template>
                  </ApolloAlertMutation>
                </FlexCell>
              </Flex>
            </div>
          </div>
        </VueDraggableNext>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gallery .file-entry:hover .overlay-info {
  display: block;
}

.gallery {
  display: grid;
  grid-gap: 4px;
  padding: 4px;
}

.file-entry {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
