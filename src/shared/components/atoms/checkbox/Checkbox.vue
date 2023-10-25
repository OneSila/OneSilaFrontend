<script setup lang="ts">
defineProps<{ modelValue?: boolean }>()
</script>

<template>
  <label class="checkbox">
    <input type="checkbox" :checked="modelValue" @change="(event) => $emit('update:modelValue', (event.target as any).checked)" />

    <span class="ml-2"><slot /></span>
  </label>
</template>
