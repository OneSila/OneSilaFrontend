<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../../../../../../apollo-client';
import {
  getProductTypeQuery,
  getProductTypeQueryDataKey,
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

const imported = computed(() => Boolean(productType.value?.imported));
const currentComponent = computed(() => {
  if (!imported.value) {
    return ImportedRemoteProductType;
  }
  return RemotelyMappedRemoteProductType;
});
</script>

<template>
  <component
    v-if="!loading"
    :is="currentComponent"
    :product-type="productType"
  />
</template>
