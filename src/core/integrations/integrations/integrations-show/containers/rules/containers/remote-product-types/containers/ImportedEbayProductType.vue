<script setup lang="ts">
import ImportedRemoteProductType from './ImportedRemoteProductType.vue';
import { ebayImportedRemoteProductTypeConfig } from '../configs';

defineProps<{ productType: any | null }>();
</script>

<template>
  <ImportedRemoteProductType :product-type="productType" :config="ebayImportedRemoteProductTypeConfig" />
</template>
