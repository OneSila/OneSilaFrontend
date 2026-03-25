<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import BulkRemotePropertyAssigner from "../remote-properties/BulkRemotePropertyAssigner.vue";
import {
  miraklPropertiesSearchConfigConstructor,
  miraklPropertiesListingConfigConstructor,
  miraklPropertiesListingQuery,
  miraklPropertiesListingQueryKey,
} from './configs';
import { mapSalesChannelPerfectMatchPropertiesMutation, updateMiraklPropertyMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = computed(() => miraklPropertiesSearchConfigConstructor(t));
const listingConfig = computed(() => miraklPropertiesListingConfigConstructor(t, props.id, props.salesChannelId));

const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remoteProperties.edit',
  params: { type: 'mirakl', id },
  query: { integrationId, salesChannelId, wizard: '1' },
});
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="miraklPropertiesListingQuery"
    :listing-query-key="miraklPropertiesListingQueryKey"
    :fixed-filter-variables="{ showProperty: true }"
    :build-start-mapping-route="buildStartMappingRoute"
    :auto-map-mutation="mapSalesChannelPerfectMatchPropertiesMutation"
    @pull-data="emit('pull-data')"
  >
    <template #bulkActions="{ selectedEntities, query, clearSelection }">
      <BulkRemotePropertyAssigner
        :selected-entities="selectedEntities"
        :mutation="updateMiraklPropertyMutation"
        @started="clearSelection(query)"
      />
    </template>
  </RemoteProperties>
</template>
