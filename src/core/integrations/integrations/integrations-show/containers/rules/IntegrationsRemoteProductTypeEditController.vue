<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../../../apollo-client';
import {
  getProductTypeQuery,
  getProductTypeQueryDataKey,
} from './containers/remote-product-types/configs';
import ImportedAmazonProductType from './containers/amazon-product-types/ImportedAmazonProductType.vue';
import ImportedEbayProductType from './containers/ebay-product-types/ImportedEbayProductType.vue';
import AmazonMappedRemoteProductType from './containers/amazon-product-types/AmazonMappedRemoteProductType.vue';
import EbayMappedRemoteProductType from './containers/ebay-product-types/EbayMappedRemoteProductType.vue';
import { IntegrationTypes } from '../../../integrations';

const route = useRoute();
const productTypeId = String(route.params.id);
const type = computed(() => String(route.params.type));
const productType = ref<any | null>(null);
const loading = ref(true);

const componentRegistry: Record<string, { imported: Component; mapped: Component }> = {
  [IntegrationTypes.Amazon]: {
    imported: ImportedAmazonProductType,
    mapped: AmazonMappedRemoteProductType,
  },
  [IntegrationTypes.Ebay]: {
    imported: ImportedEbayProductType,
    mapped: EbayMappedRemoteProductType,
  },
};

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

const registryEntry = computed(() => componentRegistry[type.value] ?? null);
const imported = computed(() => Boolean(productType.value?.imported));
const currentComponent = computed<Component | null>(() => {
  const entry = registryEntry.value;
  if (!entry) {
    return null;
  }
  return imported.value ? entry.mapped : entry.imported;
});
</script>

<template>
  <component v-if="!loading && currentComponent" :is="currentComponent" :product-type="productType" />
</template>
