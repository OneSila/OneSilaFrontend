<script setup lang="ts">
import { computed } from 'vue';
import { IntegrationTypes } from '../../../integrations';
import { AmazonProperties } from './containers/amazon-properties';
import { EbayProperties } from './containers/ebay-properties';
import { SheinProperties } from './containers/shein-properties';

const props = defineProps<{ id: string; salesChannelId: string; type: string }>();
const emit = defineEmits(['pull-data']);

const currentComponent = computed(() => {
  switch (props.type) {
    case IntegrationTypes.Amazon:
      return AmazonProperties;
    case IntegrationTypes.Ebay:
      return EbayProperties;
    case IntegrationTypes.Shein:
      return SheinProperties;
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
