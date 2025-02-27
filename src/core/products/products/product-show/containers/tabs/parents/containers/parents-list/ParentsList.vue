<script setup lang="ts">
import { getInspectorStatusBadgeMap, Product } from "../../../../../../configs";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { useI18n } from "vue-i18n";
import { Pagination } from "../../../../../../../../../shared/components/molecules/pagination";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { FilterManager } from "../../../../../../../../../shared/components/molecules/filter-manager";

const { t } = useI18n();

const props = defineProps<{
  product: Product,
  searchConfig: any,
  listQuery: any,
  queryKey: string,
}>();


</script>

<template>
  <FilterManager :search-config="searchConfig">
    <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
      <ApolloQuery
        :query="listQuery"
        :variables="{
          filter: { ...filterVariables, variation: { id: { exact: product.id } } },
          order: orderVariables,
          first: pagination.first,
          last: pagination.last,
          before: pagination.before,
          after: pagination.after
        }"
      >
        <template v-slot="{ result: { data }, query }">
          <div v-if="data" class="mt-5 p-0 border-0 overflow-hidden">
            <div :class="data[queryKey].edges.length > 0 ? 'table-responsive custom-table-scroll' : ''">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.name') }}</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.active') }}</th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ t('products.products.labels.inspectorStatus') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="item in data[queryKey].edges" :key="item.node.id">
                    <td>
                      <Link :path="{ name: 'products.products.show', params: { id: item.node.parent.id } }">
                        <div class="flex gap-4 items-center">
                          <div v-if="item.node.parent.thumbnailUrl" class="w-8 h-8 overflow-hidden">
                            <img
                              class="w-8 h-8 rounded-md object-cover"
                              :src="item.node.parent.thumbnailUrl"
                              :alt="item.node.parent.name"
                            />
                          </div>
                          <div
                            v-else
                            class="w-8 h-8 rounded-md bg-gray-200 flex justify-center items-center"
                          ></div>
                          <span>{{ item.node.parent.name }}</span>
                        </div>
                      </Link>
                    </td>
                    <td>
                      <Icon v-if="item.node.parent.active" name="check-circle" class="ml-2 text-green-500" />
                      <Icon v-else name="times-circle" class="ml-2 text-red-500" />
                    </td>
                    <td>
                      {{ getInspectorStatusBadgeMap()[item.node.parent.inspectorStatus].text }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="py-2 px-2">
              <Pagination :page-info="data[queryKey].pageInfo" />
            </div>
          </div>
        </template>
      </ApolloQuery>
    </template>
  </FilterManager>
</template>
