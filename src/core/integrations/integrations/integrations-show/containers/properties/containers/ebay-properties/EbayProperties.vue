<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import { ebayPropertiesSearchConfigConstructor, ebayPropertiesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = computed(() => ebayPropertiesSearchConfigConstructor(t, props.salesChannelId));
const listingConfig = ebayPropertiesListingConfigConstructor(t, props.id);

const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.ebayProperties.edit',
  params: { type: 'ebay', id },
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
