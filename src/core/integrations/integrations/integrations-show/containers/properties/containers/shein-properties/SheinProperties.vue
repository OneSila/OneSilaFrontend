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

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const searchConfig = computed(() => sheinPropertiesSearchConfigConstructor(t));
const listingConfig = sheinPropertiesListingConfigConstructor(t, props.id);
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="searchConfig"
    :listing-config="listingConfig"
    :listing-query="listingQuery"
    :listing-query-key="listingQueryKey"
    @pull-data="emit('pull-data')"
  />
</template>
