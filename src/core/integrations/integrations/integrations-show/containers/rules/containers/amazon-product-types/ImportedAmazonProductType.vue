<script setup lang="ts">
import ImportedRemoteProductType from '../remote-product-types/containers/ImportedRemoteProductType.vue';
import { amazonImportedRemoteProductTypeConfig } from '../remote-product-types/configs';

defineProps<{ productType: any | null }>();
</script>

<template>
  <ImportedRemoteProductType :product-type="productType" :config="amazonImportedRemoteProductTypeConfig" />
</template>
