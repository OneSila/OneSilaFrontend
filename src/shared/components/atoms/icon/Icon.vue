<script setup lang="ts">
const props = withDefaults(
  defineProps<{ name: string; size?: string; spin?: boolean }>(),
  { size: 'lg' },
);
</script>

<template>
  <FontAwesomeIcon :icon="props.name" :size="props.size" :spin="spin" />
</template>
