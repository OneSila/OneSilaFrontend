<script setup lang="ts">
defineProps<{ name: string; modelValue?: boolean }>()
</script>

<template>
  <label class="radio-input">
    <input type="radio" :name="name" :checked="modelValue" @change="(event) => $emit('update:modelValue', (event.target as any).checked)" />

    <span class="ml-2"><slot /></span>
  </label>
</template>
