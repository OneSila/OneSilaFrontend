<script setup lang="ts">
defineProps<{ compact?: boolean }>();
</script>

<template>
  <div
    class="card bg-white rounded-xl shadow-lg"
    :class="{ 'p-4': !compact, 'p-2': compact }"
  >
    <slot />
  </div>
</template>
