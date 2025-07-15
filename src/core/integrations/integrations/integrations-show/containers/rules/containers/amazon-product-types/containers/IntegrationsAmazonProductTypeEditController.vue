<script setup lang="ts">
import {computed, onMounted, ref} from 'vue';
import {useRoute} from 'vue-router';
import apolloClient from '../../../../../../../../../../apollo-client';
import {getAmazonProductTypeQuery} from '../../../../../../../../../shared/api/queries/salesChannels.js';
import RemotelyMappedAmazonProductType from './RemotelyMappedAmazonProductType.vue';
import ImportedAmazonProductType from './ImportedAmazonProductType.vue';

const route = useRoute();
const productTypeId = String(route.params.id);
const productType = ref<any | null>(null);
const loading = ref(true);

onMounted(async () => {
  const {data} = await apolloClient.query({
    query: getAmazonProductTypeQuery,
    variables: {id: productTypeId},
    fetchPolicy: 'network-only',
  });
  productType.value = data?.amazonProductType || null;
  loading.value = false;
});

const imported = computed(() => productType.value?.imported);
</script>

<template>
  <component
    v-if="!loading"
    :is="imported ? RemotelyMappedAmazonProductType : ImportedAmazonProductType"
    :product-type="productType"
  />
</template>
