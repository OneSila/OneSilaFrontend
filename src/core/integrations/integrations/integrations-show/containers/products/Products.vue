<script setup lang="ts">
import {ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';
import {useRouter} from "vue-router";
import {FilterManager} from "../../../../../../shared/components/molecules/filter-manager";
import {Icon} from "../../../../../../shared/components/atoms/icon";
import {Button} from "../../../../../../shared/components/atoms/button";
import {Link} from "../../../../../../shared/components/atoms/link";
import {ApolloAlertMutation} from "../../../../../../shared/components/molecules/apollo-alert-mutation";
import {Pagination} from "../../../../../../shared/components/molecules/pagination";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { salesChannelViewAssignsQuery } from "../../../../../../shared/api/queries/salesChannels.js";
import {
  deleteSalesChannelViewAssignMutation,
  resyncSalesChannelViewAssignMutation
} from "../../../../../../shared/api/mutations/salesChannels.js";
import { displayApolloError, shortenText } from "../../../../../../shared/utils";
import {Toast} from "../../../../../../shared/modules/toast";
import { LogsInfoModal } from "../../../../../products/products/product-show/containers/tabs/websites/containers/logs-info-modal";
import {Badge} from "../../../../../../shared/components/atoms/badge";


const { t } = useI18n();
const props = defineProps<{ salesChannelId: string }>();
const infoId = ref<string | null>(null);
const showInfoModal = ref(false);
const infoIntegrationType = ref<string | undefined>(undefined);
const router = useRouter();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const onResyncError = (error) => {
  displayApolloError(error);
};

const onResyncSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.resyncSuccess'))
};

const setInfoId = (id: string | null, type: string | null) => {
  infoId.value = id;
  infoIntegrationType.value = type || undefined;
  showInfoModal.value = true;
}

const modalColsed = () => {
  infoId.value = null;
  infoIntegrationType.value = undefined;
  showInfoModal.value = false;
}

const getStatusColor = (item) => {
  if (item.remoteProduct?.hasErrors) {
    return 'red';
  }

  if (item.remoteProductPercentage == 100) {
    return 'green';
  } else {
    return 'yellow';
  }
}

const getStatusText = (item) => {
  if (item.remoteProduct?.hasErrors) {
    return t('shared.labels.failed');
  }

  if (item.remoteProductPercentage == 100) {
    return t('shared.labels.completed');
  } else {
    return t('shared.labels.processing');
  }
}

</script>

<template>
  <div>
      <FilterManager :searchConfig="searchConfig">
        <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
          <ApolloQuery :query="salesChannelViewAssignsQuery"
                       :variables="{filter: {salesChannel: {id: {exact: salesChannelId }}},
                                order: orderVariables,
                                first: pagination.first,
                                last: pagination.last,
                                before: pagination.before,
                                after: pagination.after }">
            <template v-slot="{ result: { data }, query }">
              <div v-if="data" class="mt-5 p-0 border-0 overflow-hidden">
                <div :class="data.salesChannelViewAssigns.edges.length > 0 ? 'table-responsive custom-table-scroll' : ''">
                  <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                    <thead>
                    <tr>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {{ t('shared.labels.name') }}
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {{ t('shared.labels.active') }}
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        {{ t('shared.labels.status') }}
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-sm font-semibold text-gray-900 !text-end">
                        {{ t('shared.labels.actions') }}
                      </th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="item in data.salesChannelViewAssigns.edges" :key="item.node.id">
                      <td>
                        <Link :title="item.node.product.name" :path="{name: 'products.products.show', params: { id: item.node.product.id}, query: {tab: 'websites'}}">
                          {{ shortenText(item.node.product.name, 64) }}
                        </Link>
                      </td>
                      <td>
                        <Icon v-if="item.node.product.active" name="check-circle" class="ml-2 text-green-500"/>
                        <Icon v-else name="times-circle" class="ml-2 text-red-500"/>
                      </td>
                      <td>
                        <Badge :color="getStatusColor(item.node)" :text="getStatusText(item.node)" />
                      </td>
                      <td>
                        <div class="flex gap-4 items-center justify-end">

                          <Button :disabled="!item.node.remoteProduct?.id" @click="setInfoId(item.node.remoteProduct?.id, item.node.integrationType)">
                            <Icon name="clipboard-list" size="lg" class="text-gray-500" />
                          </Button>

                          <ApolloMutation :mutation="resyncSalesChannelViewAssignMutation" :variables="{ data: {id: item.node.id} }" @done="onResyncSuccess" @error="onResyncError">
                            <template v-slot="{ mutate, loading, error }">
                              <Button :disabled="item.node.remoteProductPercentage !== 100 || loading" @click="mutate()">
                                <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
                              </Button>
                            </template>
                          </ApolloMutation>

                          <Link :path="item.node.remoteUrl" external>
                            <Icon class="text-gray-500" size="xl" name="eye"/>
                          </Link>
                          <ApolloAlertMutation
                              :mutation="deleteSalesChannelViewAssignMutation"
                              :mutation-variables="{id: item.node.id}"
                              :refetch-queries="() => [{
                               query: salesChannelViewAssignsQuery,
                               variables: {
                                 filter: { salesChannel: { id: { exact: salesChannelId } } },
                                 order: orderVariables,
                                 first: pagination.first,
                                 last: pagination.last,
                                 before: pagination.before,
                                 after: pagination.after
                               }}]">
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
                  <Pagination :page-info="data.salesChannelViewAssigns.pageInfo"/>
                </div>
              </div>
            </template>
          </ApolloQuery>
        </template>
      </FilterManager>
    <LogsInfoModal v-model="showInfoModal" :id="infoId" :integration-type="infoIntegrationType" @modal-closed="modalColsed()" />
  </div>
</template>