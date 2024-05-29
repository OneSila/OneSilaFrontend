<script setup lang="ts">

import {Product} from "../../../../../../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { SearchConfig } from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { Pagination } from "../../../../../../../../../shared/components/molecules/pagination";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { FilterManager } from "../../../../../../../../../shared/components/molecules/filter-manager";
import { Image } from "../../../../../../../../../shared/components/atoms/image";
import { formatDate, getFileName, getFileSize, getId, getPath, TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from "../../../../../../../../media/files/media";
import { mediaProductThroughQuery } from "../../../../../../../../../shared/api/queries/media.js";

const { t } = useI18n();
const props = defineProps<{ product: Product, refetchNeeded: boolean}>();
const emit = defineEmits(['refetched', 'update-ids']);
const viewType = ref('gallery');

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};
const extractVariationIds = (data) => {

  if (!data || !data.edges) {
    return [];
  }

  return data.edges.map(edge => edge.node.variation.id);
};

const refetchIfNecessary = (query, data) => {
  emit('update-ids', extractVariationIds(data.umbrellaVariations))
  if (props.refetchNeeded) {
    query.refetch();
    emit('refetched');
  }
  return true;
}

const listQuery = mediaProductThroughQuery;
const queryKey = 'mediaProductThroughs'

</script>

<template>
  <div>
    <div class="card-header flex justify-between items-center py-2">
          <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-300">{{ props.label }}</h4>
          <div class="bg-gray-100 px-2 py-1 rounded-lg">
              <button class="mr-2" @click="viewType = 'table'" :class="{'text-blue-500': viewType === 'table'}">
                  <Icon name="table" />
              </button>
              <button @click="viewType = 'gallery'" :class="{'text-blue-500': viewType === 'gallery'}">
                  <Icon name="images" />
              </button>
          </div>
      </div>

      <FilterManager :searchConfig="searchConfig">
    <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
      <ApolloQuery :query="listQuery"
                   :variables="{filter: {...filterVariables, product: {id: {exact: product.id }}},
                                order:orderVariables,
                                first: pagination.first,
                                last: pagination.last,
                                before: pagination.before,
                                after: pagination.after }">
                  <template v-slot="{ result: { data }, query }">
                    <div v-if="data && refetchIfNecessary(query, data)">
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
                                            <th scope="col" class="p-3.5 text-sm text-start font-semibold">{{ t('shared.labels.actions') }}</th>
                                          </tr>
                                      </thead>
                                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                          <tr v-for="item in data[queryKey].edges" :key="item.node.id">
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                              <span v-if="item.node.media.type === TYPE_DOCUMENT">
                                                {{ getFileName(item.node.media) }}
                                              </span>
                                              <Link v-else :path="getPath(item.node.media)">
                                                {{ getFileName(item.node.media) }}
                                              </Link>
                                            </td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ formatDate(item.node.media.updatedAt) }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ getFileSize(item.node.media) }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.media.owner.firstName }} {{ item.node.media.owner.lastName }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                                <Icon name="trash" />
                                            </td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                      <div v-else class="gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
                          <div v-for="item in data[queryKey].edges" :key="item.node.media.id" class="file-entry relative">
                              <template v-if="item.node.media.type === TYPE_IMAGE">
                                <Link :path="getPath(item.node.media)">
                                  <Image :source="item.node.media.imageWebUrl" alt="File thumbnail" class="w-full h-48"/>
                                </Link>
                              </template>
                              <template v-else-if="item.node.media.type === TYPE_VIDEO">
                                <Link :path="getPath(item.node.media)">
                                  <div class="flex justify-center items-center h-48">
                                      <Icon name="play" size="2xl" class="text-gray-600"/>
                                  </div>
                                </Link>
                              </template>
                              <template v-else-if="item.node.media.type === TYPE_DOCUMENT">
                                  <div class="flex justify-center items-center h-48">
                                      <Icon name="file-text" size="2xl" class="text-gray-600"/>
                                  </div>
                              </template>

                              <div class="overlay-info absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-50 text-white p-2 text-md font-medium hidden">
                                <Flex>
                                  <FlexCell grow center>
                                    {{ getFileName(item.node.media) }} {{ getFileSize(item.node.media) }}
                                  </FlexCell>
                                  <FlexCell center>
                                    <Icon name="trash" />
                                  </FlexCell>
                                </Flex>
                              </div>
                          </div>
                      </div>
                      <Pagination :page-info="data[queryKey].pageInfo" />
                    </div>
                  </template>
      </ApolloQuery>

    </template>
  </FilterManager>
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