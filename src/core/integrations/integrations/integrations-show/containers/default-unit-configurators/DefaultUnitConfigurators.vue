<script setup lang="ts">
import { computed } from 'vue';
import { IntegrationTypes } from '../../../integrations';
import { AmazonDefaultUnitConfigurators } from './containers/amazon-unit-configurators';

const props = defineProps<{ id: string; salesChannelId: string; type: string }>();
const emit = defineEmits(['pull-data']);

const currentComponent = computed(() => {
  switch (props.type) {
    case IntegrationTypes.Amazon:
      return AmazonDefaultUnitConfigurators;
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
