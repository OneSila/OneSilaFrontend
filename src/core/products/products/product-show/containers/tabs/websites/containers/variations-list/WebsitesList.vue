<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Pagination } from "../../../../../../../../../shared/components/molecules/pagination";
import { FilterManager } from "../../../../../../../../../shared/components/molecules/filter-manager";
import { ApolloAlertMutation } from "../../../../../../../../../shared/components/molecules/apollo-alert-mutation";
import { deleteSalesChannelViewAssignMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import { salesChannelViewAssignsQuery } from "../../../../../../../../../shared/api/queries/salesChannels.js"
import { Product } from "../../../../../../configs";
import { SearchConfig } from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";

const { t } = useI18n();
const props = defineProps<{ product: Product, searchConfig: SearchConfig, refetchNeeded: boolean }>();
const emit = defineEmits(['refetched', 'update-ids']);

const refetchIfNecessary = (query, data) => {
  emit('update-ids', extractVIewsIds(data.salesChannelViewAssigns));
  if (props.refetchNeeded) {
    query.refetch();
    emit('refetched');
  }
  return true;
}

const extractVIewsIds = (data) => {
  console.log(data)
  if (!data || !data.edges) return [];
  return data.edges.map(edge => edge.node.salesChannelView.id);
};
</script>

<template>
  <FilterManager :searchConfig="props.searchConfig">
    <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
      <ApolloQuery :query="salesChannelViewAssignsQuery"
                   :variables="{filter: {product: {id: {exact: props.product.id}}},
                                order: orderVariables,
                                first: pagination.first,
                                last: pagination.last,
                                before: pagination.before,
                                after: pagination.after }">
        <template v-slot="{ result: { data }, query }">
          <div v-if="data && refetchIfNecessary(query, data)" class="mt-5 panel p-0 border-0 overflow-hidden">
            <div class="table-responsive">
              <table class="table-striped table-hover">
                <thead>
                <tr>
                  <th>{{ t('shared.labels.name') }}</th>
                  <th>{{ t('shared.labels.active') }}</th>
                  <th class="!text-end">{{ t('shared.labels.actions')}}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in data.salesChannelViewAssigns.edges" :key="item.node.id">
                  <td>{{ item.node.salesChannelView.name }}</td>
                  <td>
                    <Icon v-if="item.node.salesChannelView.active" name="check-circle" class="ml-2 text-green-500" />
                    <Icon v-else name="times-circle" class="ml-2 text-red-500" />
                  </td>
                  <td>
                    <div class="flex gap-4 items-center justify-end">
                      <ApolloAlertMutation
                        :mutation="deleteSalesChannelViewAssignMutation"
                        :mutation-variables="{id: item.node.id}"
                        :refetch-queries="() => [{
                         query: salesChannelViewAssignsQuery,
                         variables: {
                           filter: { product: { id: { exact: props.product.id } } },
                           order: orderVariables,
                           first: pagination.first,
                           last: pagination.last,
                           before: pagination.before,
                           after: pagination.after
                         }
                       }]">
                      <template v-slot="{ loading, confirmAndMutate }">
                        <Button :disabled="loading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                          {{ t('shared.button.delete') }}
                        </Button>
                      </template>
                    </ApolloAlertMutation>
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
            <div class="py-2 px-2">
              <Pagination :page-info="data.salesChannelViewAssigns.pageInfo" />
            </div>
          </div>
        </template>
      </ApolloQuery>
    </template>
  </FilterManager>
</template>
