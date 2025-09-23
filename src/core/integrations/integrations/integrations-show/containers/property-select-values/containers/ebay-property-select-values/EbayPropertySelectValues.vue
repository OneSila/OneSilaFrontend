<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RemotePropertySelectValues from '../remote-property-select-values/RemotePropertySelectValues.vue';
import BulkRemotePropertySelectValueAssigner from '../remote-property-select-values/BulkRemotePropertySelectValueAssigner.vue';
import { ebayPropertySelectValuesSearchConfigConstructor, ebayPropertySelectValuesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';
import { bulkUpdateEbayPropertySelectValueLocalInstanceMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = ebayPropertySelectValuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = ebayPropertySelectValuesListingConfigConstructor(t, props.id);
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
    @pull-data="emit('pull-data')"
  >
    <template #bulkActions="{ selectedEntities, query, clearSelection }">
      <BulkRemotePropertySelectValueAssigner
        :selected-entities="selectedEntities"
        :mutation="bulkUpdateEbayPropertySelectValueLocalInstanceMutation"
        @started="clearSelection(query)"
      />
    </template>
  </RemotePropertySelectValues>
</template>
