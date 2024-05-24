<script lang="ts" setup>

import { ref, defineProps } from 'vue';
import { Card } from '../../../../shared/components/atoms/card';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Image } from "../../../../shared/components/atoms/image";
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Pagination } from "../../../../shared/components/molecules/pagination";

const props = defineProps<{ label: string; listQuery: any; queryKey: string; searchConfig: any; }>();

const viewType = ref('table');

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
          <FilterManager :searchConfig="props.searchConfig">
          <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
              <ApolloQuery :query="props.listQuery"
                           :variables="{filter: {...filterVariables, 'umbrella': {'id': {'exact': props.product.id}}},
                                        order: orderVariables,
                                        first: pagination.first,
                                        last: pagination.last,
                                        before: pagination.before,
                                        after: pagination.after }">
                  <template v-slot="{ result: { data }, query }">
                      <div v-if="viewType === 'table'" class="overflow-x-auto">
                          <div class="inline-block min-w-full align-middle">
                              <div class="overflow-hidden">
                                  <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                      <thead class="bg-gray-50 dark:bg-gray-700">
                                          <tr class="text-gray-800 dark:text-gray-300">
                                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">File Name</th>
                                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">Last Modified</th>
                                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">File Size</th>
                                              <th scope="col" class="p-3.5 text-sm text-start font-semibold">Owner</th>
                                          </tr>
                                      </thead>
                                      <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                                          <tr v-for="item in data[props.queryKey].edges" :key="item.node.id">
                                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.fileName }}</td>
                                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.updatedAt }}</td>
                                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.fileSize }}</td>
                                              <td class="p-3.5 text-sm text-gray-700 dark:text-gray-400">{{ item.node.owner }}</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                          </div>
                      </div>
                      <div v-else class="gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
                          <div v-for="item in data[props.queryKey].edges" :key="item.node.id" class="file-entry relative">
                              <template v-if="item.node.type === 'IMAGE'">
                                  <Image :src="item.node.thumbnailUrl" alt="File thumbnail" class="w-full h-full"/>
                              </template>
                              <template v-else>
                                  <div class="flex justify-center items-center h-48"> <!-- Height can be adjusted -->
                                      <Icon :name="item.node.type === 'VIDEO' ? 'play' : 'file-text'" size="2xl" class="text-gray-600"/>
                                  </div>
                              </template>
                          </div>
                      </div>
                      <Pagination :page-info="data[props.queryKey].pageInfo" />
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