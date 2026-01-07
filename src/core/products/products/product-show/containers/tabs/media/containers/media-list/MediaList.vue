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
import { ProductType } from '../../../../../../../../../shared/utils/constants';
import { IntegrationTypes } from '../../../../../../../../integrations/integrations/integrations';
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

const props = defineProps<{
  product: Product;
  refetchNeeded: boolean;
  salesChannelId: string;
  salesChannelType?: string | null;
  readonlyMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'refetched'): void;
  (e: 'update-ids', ids: string[]): void;
  (e: 'items-loaded', payload: { items: Item[]; inherited: boolean }): void;
}>();

const { t } = useI18n();

const viewType = ref<'gallery' | 'table'>('gallery');
const items: Ref<Item[]> = ref([]);
const defaultItems: Ref<Item[]> = ref([]);
const inheritedFromDefault = ref(false);
const isMainImageMap = ref<Record<string, boolean>>({});
const deleteVariables = reactive<Record<string, { id: string }>>({});

const isDefaultChannel = computed(() => props.salesChannelId === 'default');
const isChannelInherited = computed(() => !isDefaultChannel.value && inheritedFromDefault.value);
const isReadOnly = computed(() => props.readonlyMode);
const isSheinChannel = computed(() => props.salesChannelType === IntegrationTypes.Shein);
const resolvedProduct = computed(() => {
  if (props.product.type === ProductType.Alias && props.product.aliasParentProduct) {
    return props.product.aliasParentProduct;
  }
  return props.product;
});
const isSheinVariation = computed(() => resolvedProduct.value.type === ProductType.Simple);
const shouldShowSheinColor = computed(
  () => resolvedProduct.value.type === ProductType.Configurable || isSheinVariation.value
);

type SheinImageRole = 'main' | 'square' | 'detail' | 'color';

const sheinRoleColorMap: Record<SheinImageRole, string> = {
  main: 'bg-blue-500',
  square: 'bg-purple-500',
  detail: 'bg-emerald-500',
  color: 'bg-orange-500'
};

const sheinRoleLabelKey: Record<SheinImageRole, string> = {
  main: 'products.products.variations.media.sheinGuide.labels.main',
  square: 'products.products.variations.media.sheinGuide.labels.square',
  detail: 'products.products.variations.media.sheinGuide.labels.detail',
  color: 'products.products.variations.media.sheinGuide.labels.color'
};

const getSheinRole = (index: number, total: number): SheinImageRole => {
  if (index === 0) {
    return 'main';
  }
  if (index === 1) {
    return 'square';
  }
  if (shouldShowSheinColor.value && total > 2 && index === total - 1) {
    return 'color';
  }
  return 'detail';
};

const getSheinRoleLabel = (index: number, total: number) => {
  const role = getSheinRole(index, total);
  return t(sheinRoleLabelKey[role]);
};

const getSheinRoleDotClass = (index: number, total: number) => {
  const role = getSheinRole(index, total);
  return sheinRoleColorMap[role];
};

const sheinLegend = computed(() => ([
  { key: 'main', label: t(sheinRoleLabelKey.main), dotClass: sheinRoleColorMap.main },
  { key: 'square', label: t(sheinRoleLabelKey.square), dotClass: sheinRoleColorMap.square },
  { key: 'detail', label: t(sheinRoleLabelKey.detail), dotClass: sheinRoleColorMap.detail },
  { key: 'color', label: t(sheinRoleLabelKey.color), dotClass: sheinRoleColorMap.color }
]));

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

const fetchData = async (policy: FetchPolicy = 'cache-first') => {
  const { data } = await apolloClient.query({
    query: mediaProductThroughQuery,
    variables: { filter: buildFilter(props.salesChannelId) },
    fetchPolicy: policy
  });

  const nodes = extractNodes(data?.mediaProductThroughs);

  if (isDefaultChannel.value) {
    items.value = nodes;
    defaultItems.value = nodes;
    inheritedFromDefault.value = false;
  } else if (nodes.length === 0) {
    const defaults = await loadDefaultItems(policy);
    defaultItems.value = defaults;
    items.value = defaults;
    inheritedFromDefault.value = true;
  } else {
    items.value = nodes;
    inheritedFromDefault.value = false;
    if (!defaultItems.value.length) {
      defaultItems.value = await loadDefaultItems(policy);
    }
  }

  syncMainImageMap(items.value);
  Object.keys(deleteVariables).forEach((key) => {
    delete deleteVariables[key];
  });
  emitState();
};

const ensureChannelSpecificSet = async (): Promise<boolean> => {
  if (isDefaultChannel.value || !inheritedFromDefault.value) {
    return false;
  }

  const defaults = defaultItems.value.length
    ? defaultItems.value
    : await loadDefaultItems('network-only');

  if (!defaults.length) {
    inheritedFromDefault.value = false;
    items.value = [];
    syncMainImageMap(items.value);
    emitState();
    return false;
  }

  await apolloClient.mutate({
    mutation: createMediaProductThroughsMutation,
    variables: {
      data: defaults.map((item, index) => ({
        product: { id: props.product.id },
        media: { id: item.media.id },
        salesChannel: { id: props.salesChannelId },
        sortOrder: index,
        isMainImage: item.isMainImage,
      }))
    }
  });

  inheritedFromDefault.value = false;
  await fetchData('network-only');
  return true;
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

  if (updatePromises.length) {
    await Promise.allSettled(updatePromises);
  }

  await fetchData('network-only');
};

const handleEnd = async () => {
  if (isReadOnly.value) {
    return;
  }

  const orderedMediaIds = items.value.map((entry) => entry.media.id);

  if (!isDefaultChannel.value && inheritedFromDefault.value) {
    const duplicated = await ensureChannelSpecificSet();
    if (duplicated) {
      await nextTick();
    }
  }

  await persistSortOrder(orderedMediaIds);
};

const updateMainImage = async (target: Item) => {
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
};

const handleMainImageChange = async (item: Item) => {
  if (isReadOnly.value) {
    return;
  }

  let target = item;

  if (!isDefaultChannel.value && inheritedFromDefault.value) {
    const duplicated = await ensureChannelSpecificSet();
    if (duplicated) {
      await nextTick();
    }
    target = items.value.find((entry) => entry.media.id === item.media.id) || item;
  }

  await updateMainImage(target);
};

const prepareDelete = async (item: Item, confirm: () => Promise<void>) => {
  if (isReadOnly.value) {
    return;
  }

  let target = item;

  if (!isDefaultChannel.value && inheritedFromDefault.value) {
    const duplicated = await ensureChannelSpecificSet();
    if (duplicated) {
      await nextTick();
    }
    target = items.value.find((entry) => entry.media.id === item.media.id) || item;
  }

  deleteVariables[item.media.id] = { id: target.id };
  await confirm();
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
      <div
        v-if="isSheinChannel"
        class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        <div class="font-medium">{{ t('products.products.variations.media.sheinGuide.title') }}</div>
        <p class="mt-1">{{ t('products.products.variations.media.sheinGuide.description') }}</p>
        <ul class="mt-2 list-disc space-y-1 pl-5">
          <li>
            {{ t('products.products.variations.media.sheinGuide.order.main', { label: t('products.products.variations.media.sheinGuide.labels.main') }) }}
          </li>
          <li>
            {{ t('products.products.variations.media.sheinGuide.order.square', { label: t('products.products.variations.media.sheinGuide.labels.square') }) }}
          </li>
          <li>
            {{ t('products.products.variations.media.sheinGuide.order.detail', { label: t('products.products.variations.media.sheinGuide.labels.detail') }) }}
          </li>
          <li>
            {{ t('products.products.variations.media.sheinGuide.order.color', { label: t('products.products.variations.media.sheinGuide.labels.color') }) }}
          </li>
        </ul>
        <p class="mt-2 text-xs text-red-600">
          {{ t('products.products.variations.media.sheinGuide.note') }}
        </p>
        <div class="mt-3 flex flex-wrap gap-3 text-xs text-red-700">
          <div v-for="legend in sheinLegend" :key="legend.key" class="flex items-center gap-2">
            <span class="h-2.5 w-2.5 rounded-full" :class="legend.dotClass"></span>
            <span>{{ legend.label }}</span>
          </div>
        </div>
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
                :disabled="isReadOnly"
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
                      :disabled="isReadOnly"
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
                            <Button :disabled="isReadOnly" @click="() => prepareDelete(item, confirmAndMutate)">
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
          class="dragArea gallery grid gap-4 p-4"
          :class="{ 'opacity-60': isChannelInherited }"
          :disabled="isReadOnly"
          @end="handleEnd"
        >
          <div v-for="(item, index) in items" :key="item.media.id" class="file-entry relative">
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

            <div
              v-if="isSheinChannel && item.media.type === TYPE_IMAGE"
              class="shein-badge absolute right-2 top-2 hidden items-center gap-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white"
            >
              <span class="h-2.5 w-2.5 rounded-full" :class="getSheinRoleDotClass(index, items.length)"></span>
              <span>{{ getSheinRoleLabel(index, items.length) }}</span>
            </div>
            <div class="overlay-info absolute bottom-0 left-0 right-0 hidden bg-gray-700 bg-opacity-50 p-2 text-md font-medium text-white">
              <div class="flex flex-wrap items-center gap-2">
                <div class="flex w-full min-w-0 items-center gap-2 sm:w-auto sm:flex-1">
                  <span class="truncate">{{ getFileName(item.media) }}</span>
                  <span class="hidden text-sm sm:inline-block">{{ getFileSize(item.media) }}</span>
                </div>
                <div class="flex items-center gap-2 sm:ml-auto">
                  <span class="text-sm sm:hidden">{{ getFileSize(item.media) }}</span>
                  <Toggle
                    v-if="item.media.type === TYPE_IMAGE"
                    v-model="isMainImageMap[item.media.id]"
                    :disabled="isReadOnly"
                    @update:modelValue="handleMainImageChange(item)"
                  />
                  <ApolloAlertMutation
                    :mutation="deleteMediaProductThroughMutation"
                    :mutation-variables="deleteVariables[item.media.id] ?? { id: item.id }"
                    @done="handleDeleteSuccess"
                  >
                    <template #default="{ confirmAndMutate }">
                      <Button :disabled="isReadOnly" @click="() => prepareDelete(item, confirmAndMutate)">
                        <Icon size="xl" name="trash" />
                      </Button>
                    </template>
                  </ApolloAlertMutation>
                </div>
              </div>
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

.gallery .file-entry:hover .shein-badge {
  display: flex;
}

.gallery {
  display: grid;
  grid-gap: 4px;
  padding: 4px;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 640px) {
  .gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1536px) {
  .gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.file-entry {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
