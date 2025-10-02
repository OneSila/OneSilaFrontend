<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import { amazonPropertiesSearchConfigConstructor, amazonPropertiesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = amazonPropertiesSearchConfigConstructor(t);
const listingConfig = amazonPropertiesListingConfigConstructor(t, props.id);

const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remoteProperties.edit',
  params: { type: 'amazon', id },
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
    @pull-data="emit('pull-data')"
  />
</template>
