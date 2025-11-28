<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AmazonSelectValueEditProperty from '../amazon-property-select-values/AmazonSelectValueEditProperty.vue';
import EbaySelectValueEditProperty from '../ebay-property-select-values/EbaySelectValueEditProperty.vue';
import SheinSelectValueEditProperty from '../shein-property-select-values/SheinSelectValueEditProperty.vue';

const route = useRoute();
const type = computed(() => String(route.params.type));

const componentMap = {
  amazon: AmazonSelectValueEditProperty,
  ebay: EbaySelectValueEditProperty,
  shein: SheinSelectValueEditProperty,
} as const;

const selectedComponent = computed(() => componentMap[type.value as keyof typeof componentMap] ?? null);
</script>

<template>
  <component :is="selectedComponent" />
</template>
