<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemotePropertySelectValues from '../remote-property-select-values/RemotePropertySelectValues.vue';
import BulkRemotePropertySelectValueAssigner from '../remote-property-select-values/BulkRemotePropertySelectValueAssigner.vue';
import {
  listingQuery,
  listingQueryKey,
  miraklPropertySelectValuesListingConfigConstructor,
  miraklPropertySelectValuesSearchConfigConstructor,
} from './configs';
import { mapSalesChannelPerfectMatchSelectValuesMutation, updateMiraklPropertySelectValueMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = computed(() => miraklPropertySelectValuesSearchConfigConstructor(t));
const listingConfig = computed(() => miraklPropertySelectValuesListingConfigConstructor(t, props.id));
const fixedFilterVariables = computed(() => ({
  isPropertyValue: true,
}));

const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remotePropertySelectValues.edit',
  params: { type: 'mirakl', id },
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
    :fixed-filter-variables="fixedFilterVariables"
    :build-start-mapping-route="buildStartMappingRoute"
    :auto-map-mutation="mapSalesChannelPerfectMatchSelectValuesMutation"
    @pull-data="emit('pull-data')"
  >
    <template #bulkActions="{ selectedEntities, query, clearSelection }">
      <BulkRemotePropertySelectValueAssigner
        :selected-entities="selectedEntities"
        :mutation="updateMiraklPropertySelectValueMutation"
        mode="single"
        @started="clearSelection(query)"
      />
    </template>
  </RemotePropertySelectValues>
</template>
