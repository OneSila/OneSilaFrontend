<script setup lang="ts">

import { computed } from 'vue';

const props = defineProps<{
  text: string;
  color: string;
}>();


const badgeClass = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10';
    case 'gray':
      return 'inline-flex items-center rounded-full bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10';
    case 'red':
      return 'inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10';
    case 'yellow':
      return 'inline-flex items-center rounded-full bg-yellow-50 px-1.5 py-0.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20';
    case 'green':
      return 'inline-flex items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20';
    case 'blue':
      return 'inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10';
    case 'indigo':
      return 'inline-flex items-center rounded-full bg-indigo-50 px-1.5 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10';
    case 'purple':
      return 'inline-flex items-center rounded-full bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10';
    case 'pink':
      return 'inline-flex items-center rounded-full bg-pink-50 px-1.5 py-0.5 text-xs font-medium text-pink-700 ring-1 ring-inset ring-pink-700/10';
    case 'none':
      return '';
    default:
      return 'inline-flex items-center rounded-full bg-gray-50 px-1.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10';
  }
});

</script>

<template>
  <span :class="badgeClass">{{ text }}</span>
</template>