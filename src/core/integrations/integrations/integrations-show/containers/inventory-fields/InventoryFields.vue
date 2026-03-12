<script setup lang="ts">
import { computed } from 'vue';
import { IntegrationTypes } from '../../../integrations';
import { EbayInventoryProperties } from '../properties/containers/ebay-properties';
import { SheinInternalProperties } from '../properties/containers/shein-properties';
import { MiraklInternalProperties } from '../properties/containers/mirakl-properties';

const props = defineProps<{ id: string; salesChannelId: string; type: string }>();
const emit = defineEmits(['pull-data']);

const currentComponent = computed(() => {
  switch (props.type) {
    case IntegrationTypes.Ebay:
      return EbayInventoryProperties;
    case IntegrationTypes.Shein:
      return SheinInternalProperties;
    case IntegrationTypes.Mirakl:
      return MiraklInternalProperties;
    default:
      return null;
  }
});
</script>

<template>
  <component
    v-if="currentComponent"
    :is="currentComponent"
    :id="id"
    :sales-channel-id="salesChannelId"
    @pull-data="emit('pull-data')"
  />
</template>
