<script setup lang="ts">
import ImportedRemoteProductType from '../remote-product-types/containers/ImportedRemoteProductType.vue';
import { ebayImportedRemoteProductTypeConfig } from '../remote-product-types/configs';

defineProps<{ productType: any | null }>();
</script>

<template>
  <ImportedRemoteProductType :product-type="productType" :config="ebayImportedRemoteProductTypeConfig" />
</template>
