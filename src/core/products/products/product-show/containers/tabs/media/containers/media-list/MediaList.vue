<script setup lang="ts">

import {Product} from "../../../../../../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { useI18n } from "vue-i18n";
import {ref, onMounted, watch, Ref} from "vue";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../../../../../shared/components/atoms/image";
import { formatDate, getFileName, getFileSize, getId, getPath, TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from "../../../../../../../../media/files/media";
import { mediaProductThroughQuery } from "../../../../../../../../../shared/api/queries/media.js";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { ApolloAlertMutation } from "../../../../../../../../../shared/components/molecules/apollo-alert-mutation";
import {deleteMediaProductThroughMutation, updateMediaProductThroughMutation} from "../../../../../../../../../shared/api/mutations/media.js";
import { VueDraggableNext } from 'vue-draggable-next';
import apolloClient from "../../../../../../../../../../apollo-client";
import {Toggle} from "../../../../../../../../../shared/components/atoms/toggle";
import {VideoListingPreview} from "../../../../../../../../media/videos/videos-list/containers/video-listing-preview";
import type { FetchPolicy } from "@apollo/client";

type Media = {
  id: string;
  type: string;
  onesilaThumbnailUrl: string;
  videoUrl: string;
  updatedAt: Date;
  owner: {
    firstName: string;
    lastName: string;
  }
};

type Item = {
  id: string;
  isMainImage: boolean;
  media: Media
}

const { t } = useI18n();
const props = defineProps<{ product: Product, refetchNeeded: boolean}>();
const emit = defineEmits(['refetched', 'update-ids']);
const viewType = ref('gallery');
const items: Ref<Item[]> = ref([]);
const isMainImageMap = ref({});


onMounted(() => {
  fetchData();
})

const extractVariationIds = (data) => {

  if (!data || !data.edges) {
    return [];
  }

  return data.edges.map(edge => edge.node.media.id);
};

const extractNodes = (data) => {

  if (!data || !data.edges) {
    return [];
  }

  return data.edges.map(edge => edge.node);
};


const fetchData = async (policy: FetchPolicy = 'cache-first') => {

  const { data } = await apolloClient.query({
    query: mediaProductThroughQuery,
    variables: { filter: { product: {id: {exact: props.product.id }} }},
    fetchPolicy: policy
  });

  if (data) {
    items.value = extractNodes(data.mediaProductThroughs);

    // Reset isMainImageMap
    isMainImageMap.value = {};

    items.value.forEach(item => {
      isMainImageMap.value[item.id] = item.isMainImage;
    });

    emit('update-ids', extractVariationIds(data.mediaProductThroughs))
  }

};

watch(() => props.refetchNeeded, (newValue, oldValue) => {
  if (newValue) {
    fetchData('network-only');
    emit('refetched');
  }
});

const handleDeleteSuccess = () => {
  fetchData('network-only');
}
const handleEnd = async (event) => {
    const maxIndexToUpdate = Math.max(event.oldIndex, event.newIndex);

    const updatePromises = items.value.slice(0, maxIndexToUpdate + 1).map((item, index) => {
        return apolloClient.mutate({
            mutation: updateMediaProductThroughMutation,
            variables: {
                data: {
                    id: item.id,
                    sortOrder: index
                }
            }
        });
    });

    const results = await Promise.allSettled(updatePromises);
    fetchData('network-only');
};

const handleMainImageChange = async (changedItem: Item) => {

  const { data } = await apolloClient.mutate({
    mutation: updateMediaProductThroughMutation,
    variables: {
      data: {
        id: changedItem.id,
        isMainImage: isMainImageMap.value[changedItem.id]
      }
    }
  });

  fetchData('network-only');
};



</script>

<template>
  <div>
    <Flex between class="py-2">
          <FlexCell grow></FlexCell>
          <FlexCell>
            <div class="bg-gray-100 px-2 py-1 rounded-lg">
              <Button class="mr-2" @click="viewType = 'table'" :class="{'text-blue-500': viewType === 'table'}">
                  <Icon name="table" />
              </Button>
              <Button @click="viewType = 'gallery'" :class="{'text-blue-500': viewType === 'gallery'}">
                  <Icon name="images" />
              </Button>
            </div>
          </FlexCell>
      </Flex>
      <div>
        <div v-if="viewType === 'table'" class="overflow-x-auto">
            <div class="inline-block min-w-full align-middle">
                <div class="overflow-hidden">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr class="text-gray-800 dark:text-gray-300">
                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.fileName') }}</th>
                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.lastModified') }}</th>
                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.fileSize') }}</th>
                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.owner') }}</th>
                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('media.media.labels.isMainImage') }}</th>
                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('shared.labels.actions') }}</th>
                            </tr>
                        </thead>
                          <VueDraggableNext tag="tbody" :list="items"  @end="handleEnd" class="dragArea divide-y divide-gray-200 dark:divide-gray-600">
                            <tr v-for="item in items" :key="item.id">
                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                <span v-if="item.media.type === TYPE_DOCUMENT">
                                  {{ getFileName(item.media) }}
                                </span>
                                <Link v-else :path="getPath(item.media)">
                                  {{ getFileName(item.media) }}
                                </Link>
                              </td>
                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ formatDate(item.media.updatedAt) }}</td>
                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ getFileSize(item.media) }}</td>
                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                  {{
                                    item.media?.owner?.firstName || item.media?.owner?.lastName
                                      ? `${item.media.owner.firstName || ''} ${item.media.owner.lastName || ''}`.trim()
                                      : '-'
                                  }}
                              </td>
                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                <Toggle v-if="item.media.type === TYPE_IMAGE" v-model="isMainImageMap[item.id]" @@update:model-value="handleMainImageChange(item)" />
                              </td>
                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                <Flex>
                                  <FlexCell v-if="item.media.type === TYPE_IMAGE" class="mr-2">
                                  </FlexCell>
                                  <FlexCell>
                                    <ApolloAlertMutation :mutation="deleteMediaProductThroughMutation" :mutation-variables="{id: item.id}" @done="handleDeleteSuccess">
                                      <template v-slot="{ loading, confirmAndMutate }">
                                        <Button @click="confirmAndMutate">
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
          <VueDraggableNext :list="items"  @end="handleEnd" class="dragArea gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
            <div v-for="item in items" :key="item.media.id" class="file-entry relative">
                <template v-if="item.media.type === TYPE_IMAGE">
                  <Link :path="getPath(item.media)">
                    <Image :source="item.media.onesilaThumbnailUrl" alt="File thumbnail" class="h-48 w-56 rounded-md object-contain"/>
                  </Link>
                </template>
                <template v-else-if="item.media.type === TYPE_VIDEO">
                  <Link :path="getPath(item.media)">
                      <VideoListingPreview :video-url="item.media.videoUrl" />
                  </Link>
                </template>
                <template v-else-if="item.media.type === TYPE_DOCUMENT">
                    <div class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                        <Icon name="file-text" size="2xl" class="text-gray-600"/>
                    </div>
                </template>

                <div class="overlay-info absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-50 text-white p-2 text-md font-medium hidden">
                  <Flex>
                    <FlexCell grow center>
                      {{ getFileName(item.media) }} {{ getFileSize(item.media) }}
                    </FlexCell>
                    <FlexCell v-if="item.media.type === TYPE_IMAGE" center class="mr-2">
                      <Toggle v-model="isMainImageMap[item.id]" @update:model-value="handleMainImageChange(item)" />
                    </FlexCell>
                    <FlexCell center>
                      <ApolloAlertMutation :mutation="deleteMediaProductThroughMutation" :mutation-variables="{id: item.id}" @done="handleDeleteSuccess">
                        <template v-slot="{ loading, confirmAndMutate }">
                          <Button @click="confirmAndMutate">
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