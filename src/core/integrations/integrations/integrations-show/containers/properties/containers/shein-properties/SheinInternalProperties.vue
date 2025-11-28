<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import RemoteProperties from "../remote-properties/RemoteProperties.vue";
import {
  sheinInternalPropertiesSearchConfigConstructor,
  sheinInternalPropertiesListingConfigConstructor,
  sheinInternalListingQuery,
  sheinInternalListingQueryKey,
} from './sheinInternalConfigs';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const { t } = useI18n();

const internalSearchConfig = computed(() => sheinInternalPropertiesSearchConfigConstructor(t));
const internalListingConfig = sheinInternalPropertiesListingConfigConstructor(t, props.id);
</script>

<template>
  <RemoteProperties
    :id="id"
    :sales-channel-id="salesChannelId"
    :search-config="internalSearchConfig"
    :listing-config="internalListingConfig"
    :listing-query="sheinInternalListingQuery"
    :listing-query-key="sheinInternalListingQueryKey"
    @pull-data="emit('pull-data')"
  />
</template>
