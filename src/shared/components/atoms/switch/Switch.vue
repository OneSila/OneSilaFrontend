<script setup lang="ts">
import Toggle from '@vueform/toggle/dist/toggle';

defineProps<{ label?: string; modelValue: any; disabled?: boolean }>();

</script>

<template>
  <div class="switch">
    <label v-if="label" id="switch-label" class="mr-2">{{ label }}</label>
    <Toggle
      labelledby="switch-label"
      :model-value="modelValue"
      :disabled="disabled"
      @change="(event) => $emit('update:modelValue', event)"
    />
  </div>
</template>
