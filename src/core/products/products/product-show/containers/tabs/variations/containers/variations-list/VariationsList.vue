<script setup lang="ts">

import {Product} from "../../../../../../configs";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import {useI18n} from "vue-i18n";
import {SearchConfig} from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";
import {PRODUCT_BUNDLE} from "../../../../../../../../../shared/utils/constants";
import {Pagination} from "../../../../../../../../../shared/components/molecules/pagination";
import {Icon} from "../../../../../../../../../shared/components/atoms/icon";
import {FilterManager} from "../../../../../../../../../shared/components/molecules/filter-manager";
import {ApolloAlertMutation} from "../../../../../../../../../shared/components/molecules/apollo-alert-mutation";
import {deleteUmbrellaVariationMutation, deleteBundleVariationMutation} from "../../../../../../../../../shared/api/mutations/products.js";

const { t } = useI18n();
const props = defineProps<{ product: Product, searchConfig: SearchConfig,  listQuery: any; queryKey: any, refetchNeeded: boolean}>();
const emit = defineEmits(['refetched', 'update-ids']);

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

</script>

<template>
  <FilterManager :searchConfig="searchConfig">
    <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
      <ApolloQuery :query="listQuery"
                   :variables="{filter: {...filterVariables, 'umbrella': {'id': {'exact': product.id}}},
                                order:orderVariables,
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
                  <th v-if="product.type == PRODUCT_BUNDLE">{{ t('shared.labels.quantity') }}</th>
                  <th class="!text-end">{{ t('shared.labels.actions')}}</th>
                </tr>
                </thead>
                <tbody>

                <tr v-for="item in data[queryKey].edges" :key="item.node.id">
                  <td>{{ item.node.variation.name }}</td>
                  <td>
                    <Icon v-if="item.node.variation.active" name="check-circle" class="ml-2 text-green-500" />
                    <Icon v-else name="times-circle" class="ml-2 text-red-500" />
                  </td>
                  <td v-if="product.type == PRODUCT_BUNDLE">{{ item.node.quantity }}</td>
                  <td>
                    <div class="flex gap-4 items-center justify-end">
                      <Link :path="{name: 'products.products.show', params: {id: item.node.variation.id}}">
                        <Button class="btn btn-sm btn-outline-secondary">{{ t('shared.button.show') }}</Button>
                      </Link>
                      <ApolloAlertMutation
                        :mutation="product.type === PRODUCT_BUNDLE ? deleteBundleVariationMutation : deleteUmbrellaVariationMutation"
                        :mutation-variables="{id: item.node.id}"
                        :refetch-queries="() => [{
                         query: listQuery,
                         variables: {
                           filter: {...filterVariables, 'umbrella': {'id': {'exact': product.id}}},
                           order: orderVariables,
                           first: pagination.first,
                           last: pagination.last,
                           before: pagination.before,
                           after: pagination.after
                         }
                       }]"
                      >
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
              <Pagination :page-info="data[queryKey].pageInfo" />
            </div>
          </div>

        </template>
      </ApolloQuery>

    </template>
  </FilterManager>
</template>
