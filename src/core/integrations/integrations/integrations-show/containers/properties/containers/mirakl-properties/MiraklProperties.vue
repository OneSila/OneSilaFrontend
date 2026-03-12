<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import {
  miraklPropertiesSearchConfigConstructor,
  miraklPropertiesListingConfigConstructor,
  miraklPropertiesListingQuery,
  miraklPropertiesListingQueryKey,
} from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const { t } = useI18n();

const searchConfig = computed(() => miraklPropertiesSearchConfigConstructor(t));
const listingConfig = computed(() => miraklPropertiesListingConfigConstructor(t));
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="miraklPropertiesListingQuery"
    :listing-query-key="miraklPropertiesListingQueryKey"
  />
</template>
