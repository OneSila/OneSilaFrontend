<script lang="ts" setup>

import { ref } from 'vue';
import { Card } from '../../../../shared/components/atoms/card';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Image } from "../../../../shared/components/atoms/image";
import { Link } from "../../../../shared/components/atoms/link";
import { Button } from "../../../../shared/components/atoms/button";
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Pagination } from "../../../../shared/components/molecules/pagination";
import {useI18n} from "vue-i18n";
import ActionsDropdown from "./ActionsDropdown.vue";
import { formatDate, getFileName, getFileSize, getId, getPath, TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO} from "../media";

const { t } = useI18n();
const props = defineProps<{
  label: string;
  listQuery: any;
  queryKey: string;
  searchConfig: any;
  defaultViewType?: string;
  refetchNeeded?: boolean;
  ids?: any[] }>();

const emit = defineEmits(['refetched', 'assign-media']);
const viewType = ref(props.defaultViewType || 'table');

const refetchIfNecessary = (query, data, force = false) => {
  if (force || props.refetchNeeded) {
    query.refetch();
    emit('refetched');
  }
  return true;
}

const assignMedia = (media) => {
 emit('assign-media', media)
}


</script>

<template>
    <Card :class="['card', 'overflow-auto', { 'max-h-[50rem]': props.ids }]">
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

      <div class="flex flex-col">
          <FilterManager :searchConfig="searchConfig">
          <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
              <ApolloQuery :query="listQuery"
                           :variables="{
                                        filter: {
                                          ...filterVariables,
                                          ...(ids && ids.length > 0 ? { id: { nInList: ids } } : {})
                                        },
                                        order: orderVariables,
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
                                              <template v-if="ids && ids.length > 0">
                                                <Button @click="assignMedia(item.node)">
                                                  {{ getFileName(item.node) }}
                                                </Button>
                                              </template>
                                              <template v-else>
                                                <span v-if="item.node.type === TYPE_DOCUMENT">
                                                  {{ getFileName(item.node) }}
                                                </span>
                                                <Link v-else :path="getPath(item.node)">
                                                  {{ getFileName(item.node) }}
                                                </Link>
                                              </template>
                                            </td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ formatDate(item.node.updatedAt) }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ getFileSize(item.node) }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.owner.firstName }} {{ item.node.owner.lastName }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400 flex justify-center items-center">
                                              <ActionsDropdown :id="getId(item.node)" :type="item.node.type" :item="item.node" @trigger-refetch="refetchIfNecessary(query, data, true)" />
                                            </td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                      <div v-else class="gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
                          <div v-for="item in data[queryKey].edges" :key="item.node.id" class="file-entry relative">

                                <template v-if="item.node.type === TYPE_IMAGE">
                                  <Button v-if="ids && ids.length > 0" @click="assignMedia(item.node)">
                                    <Image :source="item.node.imageWebUrl" alt="File thumbnail" class="h-48 w-56 rounded-md"/>
                                  </Button>
                                  <Link v-else :path="getPath(item.node)">
                                    <Image :source="item.node.imageWebUrl" alt="File thumbnail" class="h-48 w-56 rounded-md"/>
                                  </Link>
                                </template>
                                <template v-else-if="item.node.type === TYPE_VIDEO">
                                  <Button v-if="ids && ids.length > 0" @click="assignMedia(item.node)">
                                    <div class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                                        <Icon name="play" size="2xl" class="text-gray-600"/>
                                    </div>
                                  </Button>
                                  <Link v-else :path="getPath(item.node)">
                                    <div class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                                        <Icon name="play" size="2xl" class="text-gray-600"/>
                                    </div>
                                  </Link>
                                </template>
                                <template v-else-if="item.node.type === TYPE_DOCUMENT">
                                  <Button v-if="ids && ids.length > 0" @click="assignMedia(item.node)">
                                    <div class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                                        <Icon name="file-text" size="2xl" class="text-gray-600"/>
                                    </div>
                                  </Button>
                                    <div v-else class="flex justify-center items-center h-48 bg-gray-200 px-28 rounded-md">
                                        <Icon name="file-text" size="2xl" class="text-gray-600"/>
                                    </div>
                                </template>

                              <div class="overlay-info absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-50 text-white p-2 text-md font-medium hidden">
                                <Flex>
                                  <FlexCell grow center>
                                    {{ getFileName(item.node) }} {{ getFileSize(item.node) }}
                                  </FlexCell>
                                  <FlexCell center>
                                    <ActionsDropdown :id="getId(item.node)" :type="item.node.type" :dark="true" :item="item.node" @trigger-refetch="refetchIfNecessary(query, data, true)" />
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
  </Card>
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