<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { IntegrationTypes } from "../../../../../integrations";
import AmazonEditProperty from "../amazon-properties/containers/AmazonEditProperty.vue";
import EbayEditProperty from "../ebay-properties/containers/EbayEditProperty.vue";

const route = useRoute();

const type = computed(() => String(route.params.type));

const componentMap: Record<string, any> = {
  [IntegrationTypes.Amazon]: AmazonEditProperty,
  [IntegrationTypes.Ebay]: EbayEditProperty,
};

const currentComponent = computed(() => componentMap[type.value] || null);
</script>

<template>
  <component v-if="currentComponent" :is="currentComponent" />
</template>
