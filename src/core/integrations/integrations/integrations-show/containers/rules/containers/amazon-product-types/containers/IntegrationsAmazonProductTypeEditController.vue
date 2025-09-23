<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../../../../../../apollo-client';
import {
  getProductTypeQuery,
  getProductTypeQueryDataKey,
} from '../configs';
import { IntegrationTypes } from '../../../../../../integrations';
import RemotelyMappedAmazonProductType from './RemotelyMappedAmazonProductType.vue';
import ImportedAmazonProductType from './ImportedAmazonProductType.vue';

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

const isAmazon = computed(() => type.value === IntegrationTypes.Amazon);
const imported = computed(() => (isAmazon.value ? productType.value?.imported : true));
const currentComponent = computed(() => {
  if (isAmazon.value && !imported.value) {
    return ImportedAmazonProductType;
  }
  return RemotelyMappedAmazonProductType;
});
</script>

<template>
  <component
    v-if="!loading"
    :is="currentComponent"
    :product-type="productType"
  />
</template>
