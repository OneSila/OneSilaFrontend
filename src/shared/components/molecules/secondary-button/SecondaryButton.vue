<script setup lang="ts">
import { Button } from '../../atoms/button';

defineProps<{ loading?: boolean; disabled?: boolean }>();
</script>

<template>
  <Button
    class="secondary-button border-2 rounded-md py-1"
    :class="{
      'border-green-500 text-green-500 hover:border-green-600 hover:text-green-600':
        !disabled,
      'border-gray-400 text-gray-400': disabled,
    }"
    :loading="loading"
    :disabled="disabled"
  >
    <slot />
  </Button>
</template>
