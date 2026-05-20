<script setup lang="ts">
import RemotelyMappedRemoteProductType from '../remote-product-types/containers/RemotelyMappedRemoteProductType.vue';
import { amazonMappedRemoteProductTypeConfig } from '../remote-product-types/configs';
import AmazonProductTypeDefaults from './AmazonProductTypeDefaults.vue';

defineProps<{ productType: any | null }>();
</script>

<template>
  <RemotelyMappedRemoteProductType :product-type="productType" :config="amazonMappedRemoteProductTypeConfig">
    <template #after-content>
      <AmazonProductTypeDefaults :product-type="productType" />
    </template>
  </RemotelyMappedRemoteProductType>
</template>
