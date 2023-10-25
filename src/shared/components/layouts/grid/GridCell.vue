<script setup lang="ts">
withDefaults(defineProps<{ span?: string }>(), { span: '1' });
</script>

<template>
  <div
    class="grid-cell"
    :class="{
      [`col-span-${span}`]: span,
    }"
  >
    <slot />
  </div>
</template>
