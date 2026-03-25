<script setup lang="ts">
import MiraklMappedRemoteProductType from './MiraklMappedRemoteProductType.vue';

defineProps<{ productType: any | null }>();
</script>

<template>
  <MiraklMappedRemoteProductType :product-type="productType" />
</template>
