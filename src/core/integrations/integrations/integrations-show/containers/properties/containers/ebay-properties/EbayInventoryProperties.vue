<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import {
  ebayInternalPropertiesSearchConfigConstructor,
  ebayInternalPropertiesListingConfigConstructor,
  ebayInternalListingQuery,
  ebayInternalListingQueryKey,
} from './ebayInternalConfigs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const internalSearchConfig = computed(() => ebayInternalPropertiesSearchConfigConstructor(t));
const internalListingConfig = ebayInternalPropertiesListingConfigConstructor(t, props.id);

const buildInternalStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.remoteInternalProperties.edit',
  params: { type: 'ebay', id },
  query: { integrationId, salesChannelId, wizard: '1' },
});
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="internalSearchConfig"
    :listing-config="internalListingConfig"
    :listing-query="ebayInternalListingQuery"
    :listing-query-key="ebayInternalListingQueryKey"
    :build-start-mapping-route="buildInternalStartMappingRoute"
    @pull-data="emit('pull-data')"
  />
</template>
