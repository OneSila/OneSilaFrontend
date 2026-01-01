<script setup lang="ts">
import { computed } from 'vue';

interface ProductTab {
  sku: string;
  completed: boolean;
}

const props = defineProps<{
  products: ProductTab[];
  currentSku: string;
}>();

const emit = defineEmits<{ (e: 'select', sku: string): void }>();

const getTabClasses = (tab: ProductTab) => {
  if (tab.completed) {
    return 'border-green-400 bg-green-50 text-green-700';
  }
  return tab.sku === props.currentSku
    ? 'border-blue-400 bg-blue-50 text-blue-700'
    : 'border-gray-200 bg-white text-gray-600';
};

const orderedTabs = computed(() => props.products || []);
</script>

<template>
  <div class="flex flex-col gap-2">
    <button
      v-for="tab in orderedTabs"
      :key="tab.sku"
      type="button"
      class="w-full rounded-md border px-3 py-2 text-left text-sm font-medium transition"
      :class="getTabClasses(tab)"
      @click="emit('select', tab.sku)"
    >
      {{ tab.sku }}
    </button>
  </div>
</template>
