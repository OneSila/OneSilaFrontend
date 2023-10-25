<script setup lang="ts">
withDefaults(defineProps<{ columns?: string; gap?: string }>(), {
  columns: '1',
  gap: '0',
});
</script>

<template>
  <div
    class="grid"
    :class="{
      [`grid-cols-${columns}`]: columns,
      [`gap-${gap}`]: gap,
    }"
  >
    <slot />
  </div>
</template>
