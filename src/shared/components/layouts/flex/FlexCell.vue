<script setup lang="ts">
defineProps<{ grow?: boolean; center?: boolean }>();
</script>

<template>
  <div
    class="flex-cell"
    :class="{
      'flex-grow': grow,
      'self-center': center,
    }"
  >
    <slot />
  </div>
</template>

<style scoped></style>
