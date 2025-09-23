<script setup lang="ts">
import RemotelyMappedRemoteProductType from './RemotelyMappedRemoteProductType.vue';
import { amazonMappedRemoteProductTypeConfig } from '../configs';

defineProps<{ productType: any | null }>();
</script>

<template>
  <RemotelyMappedRemoteProductType :product-type="productType" :config="amazonMappedRemoteProductTypeConfig" />
</template>
