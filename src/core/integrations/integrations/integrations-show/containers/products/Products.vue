<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../shared/components/atoms/link";
import { productsSearchConfigConstructor, productsListingConfigConstructor, listingQuery, listingQueryKey } from "./configs";
import {
  bulkCreateSheinProductFromAssignsMutation,
  resyncSalesChannelViewAssignMutation
} from "../../../../../../shared/api/mutations/salesChannels.js";
import { displayApolloError } from "../../../../../../shared/utils";
import { Toast } from "../../../../../../shared/modules/toast";
import { LogsInfoModal } from "../../../../../products/products/product-show/containers/tabs/websites/containers/logs-info-modal";
import { useRoute } from "vue-router";
import {IntegrationTypes} from "../../../integrations";
import apolloClient from "../../../../../../../apollo-client";
import Swal, {SweetAlertOptions} from "sweetalert2";

const { t } = useI18n();
const route = useRoute();
const props = defineProps<{ salesChannelId: string }>();

const infoId = ref<string | null>(null);
const showInfoModal = ref(false);
const infoIntegrationType = ref<string | undefined>(undefined);
const type = ref(String(route.params.type));

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

const handleBulkSheinCreate = async (selectedEntities: string[]) => {
  if (!selectedEntities.length) return;

  const defaultSwalOptions = {
    title: t('integrations.shein.actions.bulkCreate.title'),
    text: t('integrations.shein.actions.bulkCreate.description'),
    confirmButtonText: t('integrations.shein.actions.bulkCreate.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
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

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);
  if (!result.isConfirmed) return;

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
  } catch (e) {
    displayApolloError(e);
  }
};


</script>

<template>
  <div>
    <GeneralListing
      :search-config="searchConfig"
      :config="listingConfig"
      :query="listingQuery"
      :query-key="listingQueryKey"
      :fixed-filter-variables="{ salesChannel: { id: { exact: salesChannelId } } }"
    >
        <template v-if="type == IntegrationTypes.Shein" #bulkActions="{ selectedEntities }">
          <div class="overflow-x-auto">
            <div class="flex min-w-max items-center gap-2 py-1 pr-2 scroll-smooth">
              <button
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
