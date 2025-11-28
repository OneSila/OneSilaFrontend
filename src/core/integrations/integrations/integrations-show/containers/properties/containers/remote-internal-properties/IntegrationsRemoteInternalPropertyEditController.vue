<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { IntegrationTypes } from '../../../../../integrations';
import IntegrationsEbayInternalPropertyEditController from '../ebay-properties/containers/IntegrationsEbayInternalPropertyEditController.vue';
import IntegrationsSheinInternalPropertyEditController from '../shein-properties/containers/IntegrationsSheinInternalPropertyEditController.vue';

const route = useRoute();
const type = computed(() => String(route.params.type));

const componentMap: Record<string, any> = {
  [IntegrationTypes.Ebay]: IntegrationsEbayInternalPropertyEditController,
  [IntegrationTypes.Shein]: IntegrationsSheinInternalPropertyEditController,
};

const currentComponent = computed(() => componentMap[type.value] || null);
</script>

<template>
  <component v-if="currentComponent" :is="currentComponent" />
</template>
