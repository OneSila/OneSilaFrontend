<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import { ebayPropertiesSearchConfigConstructor, ebayPropertiesListingConfigConstructor, listingQuery, listingQueryKey } from './configs';
import {
  ebayInternalPropertiesSearchConfigConstructor,
  ebayInternalPropertiesListingConfigConstructor,
  ebayInternalListingQuery,
  ebayInternalListingQueryKey,
} from './ebayInternalConfigs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = computed(() => ebayPropertiesSearchConfigConstructor(t, props.salesChannelId));
const listingConfig = ebayPropertiesListingConfigConstructor(t, props.id);
const internalSearchConfig = computed(() => ebayInternalPropertiesSearchConfigConstructor(t));
const internalListingConfig = ebayInternalPropertiesListingConfigConstructor(t, props.id);

const buildStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.ebayProperties.edit',
  params: { type: 'ebay', id },
  query: { integrationId, salesChannelId, wizard: '1' },
});

const buildInternalStartMappingRoute = ({ id, integrationId, salesChannelId }: { id: string; integrationId: string; salesChannelId: string }) => ({
  name: 'integrations.ebayInternalProperties.edit',
  params: { type: 'ebay', id },
  query: { integrationId, salesChannelId, wizard: '1' },
});
</script>

<template>
  <div class="space-y-8">
    <RemoteProperties
      :id="id"
      :sales-channel-id="salesChannelId"
      :search-config="searchConfig"
      :listing-config="listingConfig"
      :listing-query="listingQuery"
      :listing-query-key="listingQueryKey"
      :build-start-mapping-route="buildStartMappingRoute"
      title-key="integrations.show.ebay.properties.title"
      @pull-data="emit('pull-data')"
    />
    <RemoteProperties
      :id="id"
      :sales-channel-id="salesChannelId"
      :search-config="internalSearchConfig"
      :listing-config="internalListingConfig"
      :listing-query="ebayInternalListingQuery"
      :listing-query-key="ebayInternalListingQueryKey"
      :build-start-mapping-route="buildInternalStartMappingRoute"
      title-key="integrations.show.ebay.internalProperties.title"
      @pull-data="emit('pull-data')"
    />
  </div>
</template>
