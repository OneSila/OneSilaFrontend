<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import {
  listingQuery,
  listingQueryKey,
  sheinPropertiesListingConfigConstructor,
  sheinPropertiesSearchConfigConstructor,
} from './configs';
import { mapSalesChannelPerfectMatchPropertiesMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';
const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = computed(() => sheinPropertiesSearchConfigConstructor(t));
const listingConfig = sheinPropertiesListingConfigConstructor(t, props.id);
const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remoteProperties.edit',
  params: { type: 'shein', id },
  query: { integrationId, salesChannelId, wizard: '1' },
});
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="listingQuery"
    :listing-query-key="listingQueryKey"
    :build-start-mapping-route="buildStartMappingRoute"
    :auto-map-mutation="mapSalesChannelPerfectMatchPropertiesMutation"
  />
</template>
