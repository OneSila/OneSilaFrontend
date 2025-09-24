<script setup lang="ts">
import RemotelyMappedRemoteProductType from '../remote-product-types/containers/RemotelyMappedRemoteProductType.vue';
import { amazonMappedRemoteProductTypeConfig } from '../remote-product-types/configs';

defineProps<{ productType: any | null }>();
</script>

<template>
  <RemotelyMappedRemoteProductType :product-type="productType" :config="amazonMappedRemoteProductTypeConfig" />
</template>
