<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemotePropertySelectValues from '../remote-property-select-values/RemotePropertySelectValues.vue';
import {
  listingQuery,
  listingQueryKey,
  miraklPropertySelectValuesListingConfigConstructor,
  miraklPropertySelectValuesSearchConfigConstructor,
} from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const { t } = useI18n();

const searchConfig = computed(() => miraklPropertySelectValuesSearchConfigConstructor(t));
const listingConfig = computed(() => miraklPropertySelectValuesListingConfigConstructor(t));
</script>

<template>
  <RemotePropertySelectValues
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="listingQuery"
    :listing-query-key="listingQueryKey"
  />
</template>
