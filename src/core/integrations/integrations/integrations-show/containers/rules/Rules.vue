<script setup lang="ts">
import { computed } from 'vue';
import { IntegrationTypes } from '../../../integrations';
import { AmazonProductTypes } from './containers/amazon-product-types';
import { EbayProductTypes } from './containers/ebay-product-types';
import { SheinProductTypes } from './containers/shein-product-types';

const props = defineProps<{ id: string; salesChannelId: string; type: string }>();
const emit = defineEmits(['pull-data']);

const currentComponent = computed(() => {
  switch (props.type) {
    case IntegrationTypes.Amazon:
      return AmazonProductTypes;
    case IntegrationTypes.Ebay:
      return EbayProductTypes;
    case IntegrationTypes.Shein:
      return SheinProductTypes;
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
