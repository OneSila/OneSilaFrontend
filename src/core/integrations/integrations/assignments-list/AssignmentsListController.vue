<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import apolloClient from '../../../../../apollo-client';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Button } from '../../../../shared/components/atoms/button';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Link } from '../../../../shared/components/atoms/link';
import { GeneralListing } from '../../../../shared/components/organisms/general-listing';
import type { ListingConfig } from '../../../../shared/components/organisms/general-listing/listingConfig';
import type { ShowField } from '../../../../shared/components/organisms/general-show/showConfig';
import { LogsInfoModal } from '../../../products/products/product-show/containers/tabs/websites/containers/logs-info-modal';
import { Toast } from '../../../../shared/modules/toast';
import { displayApolloError } from '../../../../shared/utils';
import { FieldType } from '../../../../shared/utils/constants';
import {
  deleteSalesChannelViewAssignsMutation,
  resyncSalesChannelViewAssignMutation,
  resyncSalesChannelViewAssignsMutation
} from '../../../../shared/api/mutations/salesChannels.js';
import {
  assignmentsListingQuery,
  listingQueryKey,
  productsListingConfigConstructor,
  productsSearchConfigConstructor
} from '../integrations-show/containers/products/configs';
import Swal, { SweetAlertOptions } from 'sweetalert2';

const { t } = useI18n();

const searchConfig = productsSearchConfigConstructor(t);
const formatDateOnly = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

const baseListingConfig = productsListingConfigConstructor(t);
const listingConfig: ListingConfig = {
  ...baseListingConfig,
  addBulkDelete: true,
  bulkDeleteMutation: deleteSalesChannelViewAssignsMutation,
  bulkDeleteSuccessAlert: t('integrations.assignments.alerts.bulkDeleteSuccess'),
  fields: baseListingConfig.fields.map((field): ShowField => (
    field.name === 'createdAt'
      ? {
          ...field,
          type: FieldType.Text,
          accessor: (node: any) => formatDateOnly(node.createdAt),
        } as ShowField
      : field.name === 'product' && 'keys' in field && field.keys.includes('name')
        ? {
            ...field,
            shortenAfter: 52,
          } as ShowField
      : field
  )),
};
const listingRef = ref<{ clearSelected?: () => void } | null>(null);
const infoId = ref<string | null>(null);
const infoIntegrationType = ref<string | undefined>(undefined);
const infoProductId = ref<string | null>(null);
const infoProductSku = ref<string | null>(null);
const showInfoModal = ref(false);

const setInfoId = (id: string | null, type: string | null, productId?: string | null, productSku?: string | null) => {
  infoId.value = id;
  infoIntegrationType.value = type || undefined;
  infoProductId.value = productId || null;
  infoProductSku.value = productSku || null;
  showInfoModal.value = true;
};

const modalClosed = () => {
  infoId.value = null;
  infoIntegrationType.value = undefined;
  infoProductId.value = null;
  infoProductSku.value = null;
  showInfoModal.value = false;
};

const resyncAssignment = async (id: string) => {
  try {
    await apolloClient.mutate({
      mutation: resyncSalesChannelViewAssignMutation,
      variables: { data: { id } },
    });
    Toast.success(t('integrations.salesChannel.toast.resyncSuccess'));
  } catch (error) {
    displayApolloError(error);
  }
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

const confirmBulkResync = async () => {
  const result = await swalWithBootstrapButtons.fire({
    title: t('integrations.salesChannel.actions.bulkResync.title'),
    text: t('integrations.salesChannel.actions.bulkResync.description'),
    confirmButtonText: t('integrations.salesChannel.actions.bulkResync.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  } as SweetAlertOptions);

  return result.isConfirmed;
};

const handleBulkResync = async (selectedEntities: string[], query: any) => {
  if (!selectedEntities.length) return;
  const confirmed = await confirmBulkResync();
  if (!confirmed) return;

  try {
    const { data } = await apolloClient.mutate({
      mutation: resyncSalesChannelViewAssignsMutation,
      variables: {
        assigns: selectedEntities.map((id) => ({ id })),
      },
    });

    const syncedAssigns = data?.resyncSalesChannelViewAssigns;

    if (syncedAssigns?.length) {
      Toast.success(t('integrations.salesChannel.actions.bulkResync.success'));
    } else {
      Toast.error(t('integrations.salesChannel.actions.bulkResync.noneEligible'));
    }
    listingRef.value?.clearSelected?.();
    await query?.refetch?.();
  } catch (error) {
    displayApolloError(error);
  }
};
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.assignments.list' }, name: t('integrations.assignments.title') }
        ]"
      />
    </template>

    <template v-slot:content>
      <GeneralListing
        ref="listingRef"
        :search-config="searchConfig"
        :config="listingConfig"
        :query="assignmentsListingQuery"
        :query-key="listingQueryKey"
      >
        <template #bulkActions="{ selectedEntities, query }">
          <button
            class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100 disabled:opacity-50"
            :disabled="!selectedEntities.length"
            @click="handleBulkResync(selectedEntities, query)"
          >
            <Icon name="clock-rotate-left" size="sm" class="mr-2 text-blue-600" />
            {{ t('integrations.salesChannel.actions.bulkResync.title') }}
          </button>
        </template>

        <template #additionalButtons="{ item }">
          <Button
            :disabled="!item.node.remoteProduct?.id"
            @click="setInfoId(item.node.remoteProduct?.id, item.node.integrationType, item.node.product?.id, item.node.product?.sku)"
          >
            <Icon name="clipboard-list" size="lg" class="text-gray-500" />
          </Button>

          <Button
            :disabled="item.node.remoteProductPercentage !== 100"
            @click="resyncAssignment(item.node.id)"
          >
            <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
          </Button>

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
        :product-id="infoProductId"
        :product-sku="infoProductSku"
        @modal-closed="modalClosed()"
      />
    </template>
  </GeneralTemplate>
</template>
