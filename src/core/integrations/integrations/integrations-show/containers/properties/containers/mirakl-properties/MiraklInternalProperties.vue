<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import {
  miraklInternalPropertiesSearchConfigConstructor,
  miraklInternalPropertiesListingConfigConstructor,
  miraklInternalListingQuery,
  miraklInternalListingQueryKey,
} from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const { t } = useI18n();

const searchConfig = computed(() => miraklInternalPropertiesSearchConfigConstructor(t));
const listingConfig = computed(() => miraklInternalPropertiesListingConfigConstructor(t));
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="miraklInternalListingQuery"
    :listing-query-key="miraklInternalListingQueryKey"
  />
</template>
