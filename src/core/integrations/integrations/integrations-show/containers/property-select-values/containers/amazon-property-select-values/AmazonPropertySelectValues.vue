<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RemotePropertySelectValues from '../remote-property-select-values/RemotePropertySelectValues.vue';
import BulkRemotePropertySelectValueAssigner from '../remote-property-select-values/BulkRemotePropertySelectValueAssigner.vue';
import { amazonPropertySelectValuesSearchConfigConstructor, amazonPropertySelectValuesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';
import { bulkUpdateAmazonPropertySelectValueLocalInstanceMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = amazonPropertySelectValuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = amazonPropertySelectValuesListingConfigConstructor(t, props.id);

const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remotePropertySelectValues.edit',
  params: { type: 'amazon', id },
  query: { integrationId, salesChannelId, wizard: '1' },
});
</script>

<template>
  <RemotePropertySelectValues
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="listingQuery"
    :listing-query-key="listingQueryKey"
    :fixed-filter-variables="{ salesChannel: { id: { exact: salesChannelId } } }"
    :first-unmapped-query-variables="{ order: { marketplace: { isDefault: 'DESC' } } }"
    :build-start-mapping-route="buildStartMappingRoute"
    @pull-data="emit('pull-data')"
  >
    <template #bulkActions="{ selectedEntities, query, clearSelection }">
      <BulkRemotePropertySelectValueAssigner
        :selected-entities="selectedEntities"
        :mutation="bulkUpdateAmazonPropertySelectValueLocalInstanceMutation"
        @started="clearSelection(query)"
      />
    </template>
  </RemotePropertySelectValues>
</template>
