<script setup lang="ts">
import { Button } from '../../atoms/button';

defineProps<{ loading?: boolean; disabled?: boolean }>();
</script>

<template>
  <Button
    class="link-button"
    :class="{
      'text-blue-500 hover:text-blue-600': !disabled,
      'text-gray-400': disabled,
    }"
    :loading="loading"
    :disabled="disabled"
  >
    <slot />
  </Button>
</template>

<style scoped>
.link-button {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  text-decoration: underline;
  display: inline;
  margin: 0;
}
.link-button:focus {
  outline: thin dotted;
}
.link-button:active,
.link-button:hover {
  outline: 0;
}
</style>
