<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    size?: string;
    bold?: boolean;
    semiBold?: boolean;
    noWrap?: boolean;
    uppercase?: boolean;
  }>(),
  { size: 'md' },
);
</script>

<template>
  <span
    class="label"
    :class="{
      [`text-${props.size}`]: props.size,
      'font-bold': props.bold,
      'font-semibold': props.semiBold,
      'whitespace-nowrap': props.noWrap,
      uppercase: props.uppercase,
    }"
  >
    <slot />
  </span>
</template>
