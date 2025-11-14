<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RemotePropertySelectValues from '../remote-property-select-values/RemotePropertySelectValues.vue';
import {
  listingQuery,
  listingQueryKey,
  sheinPropertySelectValuesListingConfigConstructor,
  sheinPropertySelectValuesSearchConfigConstructor,
} from './configs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = sheinPropertySelectValuesSearchConfigConstructor(t, props.salesChannelId);
const listingConfig = sheinPropertySelectValuesListingConfigConstructor(t, props.id);
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
    @pull-data="emit('pull-data')"
  />
</template>
