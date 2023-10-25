<script setup lang="ts">
defineProps<{
  compact?: boolean;
  negative?: boolean;
  positive?: boolean;
  warning?: boolean;
}>();
</script>

<template>
  <div
    class="alert bg-white border-2 rounded-xl"
    :class="{
      'p-4': !compact,
      'p-2': compact,
      'border-red-500 bg-red-100': negative,
      'border-yellow-500 bg-yellow-100': warning,
      'border-green-500 bg-green-100': positive,
    }"
  >
    <slot />
  </div>
</template>
