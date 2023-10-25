<script setup lang="ts">
const props = withDefaults(
  defineProps<{ level?: string; bold?: boolean; semiBold?: boolean }>(),
  { level: '3' },
);

const classMap = {
  'text-3xl': props.level === '1',
  'text-2xl': props.level === '2',
  'text-xl': props.level === '3',
  'text-lg': props.level === '4',
  'text-md': props.level === '5',
  'text-sm': props.level === '6',
  'font-bold': props.bold,
  'font-semibold': props.semiBold,
};
</script>

<template>
  <component :is="`h${level}`" class="title" :class="classMap"
    ><slot
  /></component>
</template>
