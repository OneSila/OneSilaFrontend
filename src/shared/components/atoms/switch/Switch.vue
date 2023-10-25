<script setup lang="ts">
import Toggle from '@vueform/toggle/dist/toggle';

defineProps<{ label?: string; modelValue: any; disabled?: boolean }>();

const classes = {
  container:
    'inline-block rounded-full outline-none focus:ring focus:ring-green-500 focus:ring-opacity-30',
  toggle:
    'flex w-12 h-5 rounded-full relative cursor-pointer transition items-center box-content border-2 text-xs leading-none',
  toggleOn: 'bg-green-600 border-green-500 justify-start text-white',
  toggleOff: 'bg-red-500 border-red-500 justify-end text-gray-700',
  toggleOnDisabled:
    'bg-green-200 border-green-200 justify-start text-gray-400 cursor-not-allowed',
  toggleOffDisabled:
    'bg-red-300 border-red-300 justify-end text-gray-400 cursor-not-allowed',
  handle:
    'inline-block bg-white w-5 h-5 top-0 rounded-full absolute transition-all',
  handleOn: 'left-full transform -translate-x-full',
  handleOff: 'left-0',
  handleOnDisabled: 'bg-gray-100 left-full transform -translate-x-full',
  handleOffDisabled: 'bg-gray-100 left-0',
  label: 'text-center w-8 border-box whitespace-nowrap select-none',
};
</script>

<template>
  <div class="switch">
    <label v-if="label" id="switch-label" class="mr-2">{{ label }}</label>
    <Toggle
      labelledby="switch-label"
      :classes="classes"
      :model-value="modelValue"
      :disabled="disabled"
      @change="(event) => $emit('update:modelValue', event)"
    />
  </div>
</template>
