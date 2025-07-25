<script setup lang="ts">

import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { ApolloAlertMutation } from "../../../../../../../../../shared/components/molecules/apollo-alert-mutation";
import { deleteSalesChannelViewAssignMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import { Product } from "../../../../../../configs";
import type { SalesChannelViewAssign } from "../../../../../../configs";
import { AssignProgressBar } from "../../../../../../../../../shared/components/molecules/assign-progress-bar";
import { resyncSalesChannelViewAssignMutation } from "../../../../../../../../../shared/api/mutations/salesChannels.js";
import { displayApolloError } from "../../../../../../../../../shared/utils";
import { Toast} from "../../../../../../../../../shared/modules/toast";
import { LogsInfoModal } from "../logs-info-modal";
import { IssuesInfoModal } from "../issues-info-modal";

const { t } = useI18n();
const props = defineProps<{ product: Product }>();
const infoId = ref<string | null>(null);
const showInfoModal = ref(false);
const infoIntegrationType = ref<string | undefined>(undefined);
const issuesList = ref<SalesChannelViewAssign['formattedIssues'] | null>(null);
const showIssuesModal = ref(false);
const issuesAssignId = ref(null);

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

const setIssues = (issues, id) => {
  issuesAssignId.value = id;
  issuesList.value = issues || [];
  showIssuesModal.value = true;
}

const modalColsed = () => {
  infoId.value = null;
  infoIntegrationType.value = undefined;
  showInfoModal.value = false;
}

const issuesModalClosed = () => {
  issuesList.value = null;
  issuesAssignId.value = null;
  showIssuesModal.value = false;
}

</script>

<template>
    <div class="mt-5 p-0 border-0 overflow-hidden">
      <div :class="product.saleschannelviewassignSet.length > 0 ? 'table-responsive custom-table-scroll' : ''">
        <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
          <thead>
          <tr>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.name') }}</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.active') }}</th>
            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.status') }}</th>
            <th scope="col" class="px-3 py-3.5 text-sm font-semibold text-gray-900 !text-end">{{ t('shared.labels.actions')}}</th>
          </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="item in product.saleschannelviewassignSet" :key="item.id">
            <td>{{ item.salesChannelView.name }}</td>
            <td>
              <Icon v-if="item.salesChannelView.active" name="check-circle" class="ml-2 text-green-500" />
              <Icon v-else name="times-circle" class="ml-2 text-red-500" />
            </td>
            <td>
              <AssignProgressBar :progress="item.remoteProductPercentage" :is-error="item.remoteProduct?.hasErrors" />
            </td>
            <td>
              <div class="flex gap-4 items-center justify-end">

                <Button v-if="item.formattedIssues?.length" @click="setIssues(item.formattedIssues, item.id)">
                  <Icon name="exclamation-triangle" size="lg" class="text-red-500" />
                </Button>

                <Button :disabled="!item.remoteProduct?.id" @click="setInfoId(item.remoteProduct?.id, item.integrationType)">
                  <Icon name="clipboard-list" size="lg" class="text-gray-500" />
                </Button>

                <ApolloMutation :mutation="resyncSalesChannelViewAssignMutation" :variables="{ data: {id: item.id} }" @done="onResyncSuccess" @error="onResyncError">
                  <template v-slot="{ mutate, loading, error }">
                    <Button :disabled="item.remoteProductPercentage !== 100 || loading" @click="mutate()">
                      <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
                    </Button>
                  </template>
                </ApolloMutation>

                <Link :path="item.remoteUrl" external>
                  <Icon class="text-gray-500" size="xl" name="eye" />
                </Link>
                <!-- Existing delete button -->
                <ApolloAlertMutation
                  :mutation="deleteSalesChannelViewAssignMutation"
                  :mutation-variables="{ id: item.id }"
                >
                  <template v-slot="{ loading, confirmAndMutate }">
                    <Button :disabled="loading" class="btn btn-sm btn-outline-danger" @click="confirmAndMutate">
                      <!-- Icon only on small screens -->
                      <Icon name="trash" class="block sm:hidden" />

                      <!-- Text only on sm and up -->
                      <span class="hidden sm:inline">
                        {{ t('shared.button.delete') }}
                      </span>
                    </Button>
                  </template>
                </ApolloAlertMutation>
              </div>
            </td>

          </tr>
          </tbody>
        </table>
      </div>
      <LogsInfoModal v-model="showInfoModal" :id="infoId" :integration-type="infoIntegrationType" @modal-closed="modalColsed()" />
      <IssuesInfoModal v-model="showIssuesModal" :issues="issuesList" :id="issuesAssignId" @modal-closed="issuesModalClosed()" />
    </div>
</template>
