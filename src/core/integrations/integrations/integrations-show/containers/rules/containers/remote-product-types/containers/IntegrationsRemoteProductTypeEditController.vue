<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../../../../../../apollo-client';
import {
  getProductTypeQuery,
  getProductTypeQueryDataKey,
  amazonImportedRemoteProductTypeConfig,
  ebayImportedRemoteProductTypeConfig,
  amazonMappedRemoteProductTypeConfig,
  ebayMappedRemoteProductTypeConfig,
} from '../configs';
import RemotelyMappedRemoteProductType from './RemotelyMappedRemoteProductType.vue';
import ImportedRemoteProductType from './ImportedRemoteProductType.vue';

const route = useRoute();
const productTypeId = String(route.params.id);
const type = computed(() => String(route.params.type));
const productType = ref<any | null>(null);
const loading = ref(true);

onMounted(async () => {
  const query = getProductTypeQuery(type.value);
  const dataKey = getProductTypeQueryDataKey(type.value);
  const { data } = await apolloClient.query({
    query,
    variables: { id: productTypeId },
    fetchPolicy: 'cache-first',
  });
  productType.value = data?.[dataKey] || null;
  loading.value = false;
});

type RegistryEntry = {
  imported: { component: Component; config: any };
  mapped: { component: Component; config: any };
};

const registry: Record<string, RegistryEntry> = {
  amazon: {
    imported: { component: ImportedRemoteProductType, config: amazonImportedRemoteProductTypeConfig },
    mapped: { component: RemotelyMappedRemoteProductType, config: amazonMappedRemoteProductTypeConfig },
  },
  ebay: {
    imported: { component: ImportedRemoteProductType, config: ebayImportedRemoteProductTypeConfig },
    mapped: { component: RemotelyMappedRemoteProductType, config: ebayMappedRemoteProductTypeConfig },
  },
};

const imported = computed(() => Boolean(productType.value?.imported));
const currentEntry = computed(() => {
  const entry = registry[type.value];
  if (!entry) {
    return null;
  }

  return imported.value ? entry.mapped : entry.imported;
});

const currentComponent = computed(() => currentEntry.value?.component ?? null);
const currentConfig = computed(() => currentEntry.value?.config ?? null);
</script>

<template>
  <component
    v-if="!loading && currentComponent && currentConfig"
    :is="currentComponent"
    :product-type="productType"
    :config="currentConfig"
  />
</template>
