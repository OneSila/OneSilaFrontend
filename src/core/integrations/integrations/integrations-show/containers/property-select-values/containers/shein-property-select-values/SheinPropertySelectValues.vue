<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RemotePropertySelectValues from '../remote-property-select-values/RemotePropertySelectValues.vue';
import {
  listingQuery,
  listingQueryKey,
  sheinPropertySelectValuesListingConfigConstructor,
  sheinPropertySelectValuesSearchConfigConstructor,
} from './configs';
import { mapSheinPerfectMatchSelectValuesMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = sheinPropertySelectValuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = sheinPropertySelectValuesListingConfigConstructor(t, props.id);
const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remotePropertySelectValues.edit',
  params: { type: 'shein', id },
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
    :build-start-mapping-route="buildStartMappingRoute"
    :auto-map-mutation="mapSheinPerfectMatchSelectValuesMutation"
    @pull-data="emit('pull-data')"
  />
</template>
