<script lang="ts" setup>

import { ref } from 'vue';
import { Card } from '../../../../shared/components/atoms/card';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Image } from "../../../../shared/components/atoms/image";
import { Link } from "../../../../shared/components/atoms/link";
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Pagination } from "../../../../shared/components/molecules/pagination";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const props = defineProps<{ label: string; listQuery: any; queryKey: string; searchConfig: any; defaultViewType?: string; }>();

const viewType = ref(props.defaultViewType || 'table');

const getPath = (node: any) => {
  return 'dashboard';
  const identifier = node.proxyId ? 'proxyId' : 'id';
  const routeName = getRouteName(node.type);
  return { name: routeName, params: { id: node[identifier] } };
};

const getRouteName = (type: string) => {
  switch (type) {
    case 'IMAGE':
      return 'media.image.show';
    case 'VIDEO':
      return 'media.video.show';
    case 'FILE':
      return 'media.file.show';
    default:
      return 'media.show';
  }
};

const getFileName = (node: any) => {
  if (node.type === 'IMAGE') return node.image.name;
  if (node.type === 'FILE') return node.file.name;
  if (node.type === 'VIDEO') return truncateUrl(node.videoUrl);
  return '-';
};

const getFileSize = (node: any) => {
  if (node.type === 'IMAGE') return humanFileSize(node.image.size);
  if (node.type === 'FILE') return humanFileSize(node.file.size);
  return '-';
};

const truncateUrl = (url: string) => {
  return url.length > 20 ? url.substring(0, 20) + '...' : url;
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

const humanFileSize = (bytes, si=false, dp=1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

</script>

<template>
  <Card class="card">
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
                           :variables="{filter: filterVariables,
                                        order: orderVariables,
                                        first: pagination.first,
                                        last: pagination.last,
                                        before: pagination.before,
                                        after: pagination.after }">
                  <template v-slot="{ result: { data }, query }">
                    <div v-if="data">
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
                                          </tr>
                                      </thead>
                                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                          <tr v-for="item in data[queryKey].edges" :key="item.node.id">
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">
                                              <Link :path="getPath(item.node)">
                                                {{ getFileName(item.node) }}
                                              </Link>
                                            </td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ formatDate(item.node.updatedAt) }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ getFileSize(item.node) }}</td>
                                            <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.owner.firstName }} {{ item.node.owner.lastName }}</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                      <div v-else class="gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
                          <div v-for="item in data[queryKey].edges" :key="item.node.id" class="file-entry relative">
                              <template v-if="item.node.type === 'IMAGE'">
                                  <Image :source="item.node.imageWebUrl" alt="File thumbnail" class="w-full h-full"/>
                              </template>
                              <template v-else>
                                  <div class="flex justify-center items-center h-48">
                                      <Icon :name="item.node.type === 'VIDEO' ? 'play' : 'file-text'" size="2xl" class="text-gray-600"/>
                                  </div>
                              </template>
                              <div class="overlay-info absolute bottom-0 left-0 right-0 bg-gray-700 bg-opacity-50 text-white p-2 text-md font-medium hidden">
                                {{ getFileName(item.node) }} {{ getFileSize(item.node) }}
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
    display: block; /* Show overlay on hover over image only */
}

/* General styling for the gallery and files */
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