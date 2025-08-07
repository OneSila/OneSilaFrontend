<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../shared/components/atoms/link";
import { productsSearchConfigConstructor, productsListingConfigConstructor, listingQuery, listingQueryKey } from "./configs";
import { resyncSalesChannelViewAssignMutation } from "../../../../../../shared/api/mutations/salesChannels.js";
import { displayApolloError } from "../../../../../../shared/utils";
import { Toast } from "../../../../../../shared/modules/toast";
import { LogsInfoModal } from "../../../../../products/products/product-show/containers/tabs/websites/containers/logs-info-modal";

const { t } = useI18n();
const props = defineProps<{ salesChannelId: string }>();

const infoId = ref<string | null>(null);
const showInfoModal = ref(false);
const infoIntegrationType = ref<string | undefined>(undefined);

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

        <Link :path="item.node.remoteUrl" external>
          <Icon class="text-gray-500" size="xl" name="eye" />
        </Link>
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
