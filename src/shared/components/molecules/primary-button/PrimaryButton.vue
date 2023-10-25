<script setup lang="ts">
import { Button } from '../../atoms/button';

defineProps<{ loading?: boolean; disabled?: boolean }>();
</script>

<template>
  <Button
    class="primary-button border-2 rounded-md py-1"
    :class="{
      'border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600':
        !disabled,
      'border-gray-400 text-gray-400': disabled,
    }"
    :loading="loading"
    :disabled="disabled"
  >
    <slot />
  </Button>
</template>
