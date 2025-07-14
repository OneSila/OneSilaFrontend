<script setup lang="ts">
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import RemotelyMappedAmazonProductType from './RemotelyMappedAmazonProductType.vue';
import ImportedAmazonProductType from './ImportedAmazonProductType.vue';

const route = useRoute();
const imported = computed(() => route.query.imported === '1');
</script>

<template>
  <component :is="imported ? RemotelyMappedAmazonProductType : ImportedAmazonProductType" />
</template>
