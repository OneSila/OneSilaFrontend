<script setup lang="ts">
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

defineProps<{ modelValue?: any; widget?: boolean; }>()
</script>

<template>
  <ColorPicker :pure-color="modelValue" :is-widget="widget" @update:pure-color="color => $emit('update:modelValue', color)" />
</template>

<style>
.vc-colorpicker {
  box-shadow: none !important;
  box-sizing: initial !important;
  border: 2px solid #999;
}
</style>
