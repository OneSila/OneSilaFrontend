<script setup lang="ts">
defineProps<{ placeholder?: string; transparent?: boolean; disabled?: boolean; }>()
</script>

<template>
  <input
    type="file"
    class="file-input placeholder:italic placeholder:text-gray-400 block py-2 px-3 focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 text-sm"
    :class="{ 'border border-gray-300 rounded-md shadow-sm': !transparent, 'cursor-not-allowed': disabled }"
    :placeholder="placeholder"
    :disabled="disabled"
    @change="(event) => $emit('uploaded', (event.target as any).files)"
  />
</template>
