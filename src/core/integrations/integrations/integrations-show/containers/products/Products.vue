<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../shared/components/atoms/link";
import { AmazonButtonsInfo } from "../../../../../../shared/components/atoms/amazon-buttons-info";
import { productsSearchConfigConstructor, productsListingConfigConstructor, listingQuery, listingQueryKey } from "./configs";
import {
  bulkCreateSheinProductFromAssignsMutation,
  bulkRefreshAmazonLatestIssuesFromAssignsMutation,
  bulkResyncAmazonProductFromAssignsMutation,
  bulkUpdateSheinProductFromAssignsMutation,
  resyncSalesChannelViewAssignMutation,
  resyncSalesChannelViewAssignsMutation
} from "../../../../../../shared/api/mutations/salesChannels.js";
import { displayApolloError } from "../../../../../../shared/utils";
import { Toast } from "../../../../../../shared/modules/toast";
import { LogsInfoModal } from "../../../../../products/products/product-show/containers/tabs/websites/containers/logs-info-modal";
import { useRoute } from "vue-router";
import { IntegrationTypes } from "../../../integrations";
import apolloClient from "../../../../../../../apollo-client";
import Swal, { SweetAlertOptions } from "sweetalert2";

const { t } = useI18n();
const route = useRoute();
const props = defineProps<{ salesChannelId: string }>();

const infoId = ref<string | null>(null);
const showInfoModal = ref(false);
const infoIntegrationType = ref<string | undefined>(undefined);
const type = ref(String(route.params.type));
const listingRef = ref<{ clearSelected?: () => void } | null>(null);

const searchConfig = productsSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = productsListingConfigConstructor(t);

const onResyncError = (error) => {
  displayApolloError(error);
};

const onResyncSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.resyncSuccess'));
};

const setInfoId = (id: string | null, type: string | null) => {
  infoId.value = id;
  infoIntegrationType.value = type || undefined;
  showInfoModal.value = true;
};

const modalClosed = () => {
  infoId.value = null;
  infoIntegrationType.value = undefined;
  showInfoModal.value = false;
};

const clearSelection = () => {
  listingRef.value?.clearSelected?.();
};

const defaultSwalClasses = {
  popup: 'sweet-alerts',
  confirmButton: 'btn btn-secondary',
  cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
};

const swalWithBootstrapButtons = Swal.mixin({
  customClass: defaultSwalClasses,
  buttonsStyling: false,
});

const confirmBulkAction = async ({
  title,
  text,
  confirmButtonText,
}: {
  title: string;
  text: string;
  confirmButtonText: string;
}) => {
  const defaultSwalOptions = {
    title,
    text,
    confirmButtonText,
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  };

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);
  return result.isConfirmed;
};

const handleBulkSheinCreate = async (selectedEntities: string[]) => {
  if (!selectedEntities.length) return;

  const confirmed = await confirmBulkAction({
    title: t('integrations.shein.actions.bulkCreate.title'),
    text: t('integrations.shein.actions.bulkCreate.description'),
    confirmButtonText: t('integrations.shein.actions.bulkCreate.confirmButtonText'),
  });
  if (!confirmed) return;

  const assigns = selectedEntities.map((id) => ({ id }));

  try {
    const { data } = await apolloClient.mutate({
      mutation: bulkCreateSheinProductFromAssignsMutation,
      variables: { assigns },
    });

    const ok = data?.bulkCreateSheinProductFromAssigns;

    if (ok) {
      Toast.success(t('integrations.shein.actions.bulkCreate.success'));
    } else {
      Toast.error(t('integrations.shein.actions.bulkCreate.noneEligible'));
    }
    clearSelection();
  } catch (e) {
    displayApolloError(e);
  }
};

const handleBulkResync = async (selectedEntities: string[]) => {
  if (!selectedEntities.length) return;

  const confirmed = await confirmBulkAction({
    title: t('integrations.salesChannel.actions.bulkResync.title'),
    text: t('integrations.salesChannel.actions.bulkResync.description'),
    confirmButtonText: t('integrations.salesChannel.actions.bulkResync.confirmButtonText'),
  });
  if (!confirmed) return;

  const assigns = selectedEntities.map((id) => ({ id }));

  try {
    const { data } = await apolloClient.mutate({
      mutation: resyncSalesChannelViewAssignsMutation,
      variables: { assigns },
    });

    const syncedAssigns = data?.resyncSalesChannelViewAssigns;

    if (syncedAssigns?.length) {
      Toast.success(t('integrations.salesChannel.actions.bulkResync.success'));
    } else {
      Toast.error(t('integrations.salesChannel.actions.bulkResync.noneEligible'));
    }
    clearSelection();
  } catch (e) {
    displayApolloError(e);
  }
};

const handleAmazonBulkResync = async (selectedEntities: string[], forceFullUpdate: boolean) => {
  if (!selectedEntities.length) return;

  const confirmed = await confirmBulkAction({
    title: forceFullUpdate
      ? t('integrations.amazon.actions.bulkForceUpdate.title')
      : t('integrations.amazon.actions.bulkSync.title'),
    text: forceFullUpdate
      ? t('integrations.amazon.actions.bulkForceUpdate.description')
      : t('integrations.amazon.actions.bulkSync.description'),
    confirmButtonText: forceFullUpdate
      ? t('integrations.amazon.actions.bulkForceUpdate.confirmButtonText')
      : t('integrations.amazon.actions.bulkSync.confirmButtonText'),
  });
  if (!confirmed) return;

  const assigns = selectedEntities.map((id) => ({ id }));

  try {
    const { data } = await apolloClient.mutate({
      mutation: bulkResyncAmazonProductFromAssignsMutation,
      variables: { assigns, forceFullUpdate },
    });

    const ok = data?.bulkResyncAmazonProductFromAssigns;

    if (ok) {
      Toast.success(
        forceFullUpdate
          ? t('integrations.amazon.actions.bulkForceUpdate.success')
          : t('integrations.amazon.actions.bulkSync.success')
      );
    } else {
      Toast.error(
        forceFullUpdate
          ? t('integrations.amazon.actions.bulkForceUpdate.error')
          : t('integrations.amazon.actions.bulkSync.error')
      );
    }
    clearSelection();
  } catch (e) {
    displayApolloError(e);
  }
};

const handleAmazonFetchIssues = async (selectedEntities: string[]) => {
  if (!selectedEntities.length) return;

  const confirmed = await confirmBulkAction({
    title: t('integrations.amazon.actions.bulkFetchIssues.title'),
    text: t('integrations.amazon.actions.bulkFetchIssues.description'),
    confirmButtonText: t('integrations.amazon.actions.bulkFetchIssues.confirmButtonText'),
  });
  if (!confirmed) return;

  const assigns = selectedEntities.map((id) => ({ id }));

  try {
    const { data } = await apolloClient.mutate({
      mutation: bulkRefreshAmazonLatestIssuesFromAssignsMutation,
      variables: { assigns },
    });

    const ok = data?.bulkRefreshAmazonLatestIssuesFromAssigns;

    if (ok) {
      Toast.success(t('integrations.amazon.actions.bulkFetchIssues.success'));
    } else {
      Toast.error(t('integrations.amazon.actions.bulkFetchIssues.error'));
    }
    clearSelection();
  } catch (e) {
    displayApolloError(e);
  }
};

const handleBulkSheinUpdate = async (selectedEntities: string[]) => {
  if (!selectedEntities.length) return;

  const confirmed = await confirmBulkAction({
    title: t('integrations.shein.actions.bulkUpdate.title'),
    text: t('integrations.shein.actions.bulkUpdate.description'),
    confirmButtonText: t('integrations.shein.actions.bulkUpdate.confirmButtonText'),
  });
  if (!confirmed) return;

  const assigns = selectedEntities.map((id) => ({ id }));

  try {
    const { data } = await apolloClient.mutate({
      mutation: bulkUpdateSheinProductFromAssignsMutation,
      variables: { assigns, forceUpdate: true },
    });

    const ok = data?.bulkUpdateSheinProductFromAssigns;

    if (ok) {
      Toast.success(t('integrations.shein.actions.bulkUpdate.success'));
    } else {
      Toast.error(t('integrations.shein.actions.bulkUpdate.error'));
    }
    clearSelection();
  } catch (e) {
    displayApolloError(e);
  }
};

</script>

<template>
  <div>
    <GeneralListing
      ref="listingRef"
      :search-config="searchConfig"
      :config="listingConfig"
      :query="listingQuery"
      :query-key="listingQueryKey"
      :fixed-filter-variables="{ salesChannel: { id: { exact: salesChannelId } } }"
    >
        <template #bulkActions="{ selectedEntities }">
          <div class="overflow-x-auto">
            <div class="flex min-w-max items-center gap-2 py-1 pr-2 scroll-smooth">
              <button
                v-if="type !== IntegrationTypes.Amazon && type !== IntegrationTypes.Shein"
                class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100 disabled:opacity-50"
                :disabled="!selectedEntities.length"
                @click="handleBulkResync(selectedEntities)"
              >
                <Icon name="clock-rotate-left" size="sm" class="mr-2 text-blue-600" />
                {{ t('integrations.salesChannel.actions.bulkResync.title') }}
              </button>
              <button
                v-if="type == IntegrationTypes.Amazon"
                class="inline-flex items-center rounded bg-amber-50 px-4 py-1 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-100 disabled:opacity-50"
                :disabled="!selectedEntities.length"
                @click="handleAmazonBulkResync(selectedEntities, true)"
              >
                <Icon name="cloud-upload" size="sm" class="mr-2 text-amber-600" />
                {{ t('integrations.amazon.actions.bulkForceUpdate.title') }}
              </button>
              <button
                v-if="type == IntegrationTypes.Amazon"
                class="inline-flex items-center rounded bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-800 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-100 disabled:opacity-50"
                :disabled="!selectedEntities.length"
                @click="handleAmazonBulkResync(selectedEntities, false)"
              >
                <Icon name="arrows-rotate" size="sm" class="mr-2 text-indigo-600" />
                {{ t('integrations.amazon.actions.bulkSync.title') }}
              </button>
              <button
                v-if="type == IntegrationTypes.Amazon"
                class="inline-flex items-center rounded bg-teal-50 px-4 py-1 text-sm font-semibold text-teal-800 shadow-sm ring-1 ring-inset ring-teal-300 hover:bg-teal-100 disabled:opacity-50"
                :disabled="!selectedEntities.length"
                @click="handleAmazonFetchIssues(selectedEntities)"
              >
                <Icon name="triangle-exclamation" size="sm" class="mr-2 text-teal-600" />
                {{ t('integrations.amazon.actions.bulkFetchIssues.title') }}
              </button>
              <AmazonButtonsInfo
                v-if="type == IntegrationTypes.Amazon"
                :actions="['fullUpdate', 'resync', 'fetchIssues']"
                button-class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                icon-class="text-gray-500"
              />
              <button
                v-if="type == IntegrationTypes.Shein"
                class="inline-flex items-center rounded bg-fuchsia-50 px-4 py-1 text-sm font-semibold text-fuchsia-800 shadow-sm ring-1 ring-inset ring-fuchsia-300 hover:bg-fuchsia-100 disabled:opacity-50"
                :disabled="!selectedEntities.length"
                @click="handleBulkSheinUpdate(selectedEntities)"
              >
                <Icon name="arrows-rotate" size="sm" class="mr-2 text-fuchsia-600" />
                {{ t('integrations.shein.actions.bulkUpdate.title') }}
              </button>
              <button
                v-if="type == IntegrationTypes.Shein"
                class="inline-flex items-center rounded bg-pink-50 px-4 py-1 text-sm font-semibold text-pink-800 shadow-sm ring-1 ring-inset ring-pink-300 hover:bg-pink-100 disabled:opacity-50"
                :disabled="!selectedEntities.length"
                @click="handleBulkSheinCreate(selectedEntities)"
              >
                <Icon name="cloud-upload" size="sm" class="mr-2 text-pink-600" />
                {{ t('integrations.shein.actions.bulkCreate.title') }}
              </button>
            </div>
          </div>
        </template>

      <template #additionalButtons="{ item }">
        <Button :disabled="!item.node.remoteProduct?.id" @click="setInfoId(item.node.remoteProduct?.id, item.node.integrationType)">
          <Icon name="clipboard-list" size="lg" class="text-gray-500" />
        </Button>

        <ApolloMutation :mutation="resyncSalesChannelViewAssignMutation" :variables="{ data: { id: item.node.id } }" @done="onResyncSuccess" @error="onResyncError">
          <template #default="{ mutate, loading }">
            <Button :disabled="item.node.remoteProductPercentage !== 100 || loading" @click="mutate()">
              <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
            </Button>
          </template>
        </ApolloMutation>

        <Link v-if="item.node.remoteUrl" :path="item.node.remoteUrl" external>
          <Icon class="text-gray-500" size="xl" name="eye" />
        </Link>
        <Button
          v-else
          :disabled="true"
          :title="t('integrations.salesChannel.labels.noFrontendUrl')"
        >
          <Icon class="text-gray-500" size="xl" name="eye" />
        </Button>
      </template>
    </GeneralListing>
    <LogsInfoModal
      v-model="showInfoModal"
      :id="infoId"
      :integration-type="infoIntegrationType"
      @modal-closed="modalClosed()"
    />
  </div>
</template>
