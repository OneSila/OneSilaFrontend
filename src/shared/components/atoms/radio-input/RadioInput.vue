<script setup lang="ts">
defineProps<{ name: string; modelValue?: boolean }>()
</script>

<template>
  <label class="radio-input">
    <input type="radio" :name="name" :checked="modelValue" @change="(event) => $emit('update:modelValue', (event.target as any).checked)" />

    <span><slot /></span>
  </label>
</template>
