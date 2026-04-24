<script setup lang="ts">
import TabContentTemplate from '../TabContentTemplate.vue';
import type { Product } from '../../../../configs';
import WebsitesList from './containers/assigns-list/WebsitesList.vue';

const props = defineProps<{ product: Product }>();
const emit = defineEmits(['assign-added', 'assign-deleted']);

</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <WebsitesList :product="product" @assign-deleted="emit('assign-deleted')" @assign-added="emit('assign-added')" />
    </template>
  </TabContentTemplate>
</template>
