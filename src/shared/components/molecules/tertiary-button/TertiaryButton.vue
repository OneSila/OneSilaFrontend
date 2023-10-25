<script setup lang="ts">
import { Button } from '../../atoms/button'

defineProps<{ inverse?: boolean; disabled?: boolean; }>()
</script>

<template>
  <Button
    class="tertiary-button border-2 rounded-md py-1"
    :class="{
      'bg-gray-500 hover:bg-gray-600 border-gray-500 hover:border-gray-600 text-white': inverse && !disabled,
      'text-gray-500 hover:text-gray-600 border-gray-500 hover:border-gray-600': !inverse  && !disabled,
      'bg-gray-200 hover:bg-gray-200 text-white cursor-not-allowed': inverse && disabled,
      'text-gray-300 hover:text-gray-300 cursor-not-allowed': !inverse  && disabled,
    }"
    :disabled="disabled"
  >
    <slot />
  </Button>
</template>

<style scoped>
</style>
