<script setup lang="ts">
withDefaults(
  defineProps<{
    vertical?: boolean;
    gap?: string;
    wrap?: boolean;
    center?: boolean;
    middle?: boolean;
    between?: boolean;
    end?: boolean;
  }>(),
  { gap: '0' },
);
</script>

<template>
  <div
    class="flex"
    :class="{
      'flex-col': vertical,
      'items-center': (vertical && center) || (!vertical && middle),
      'justify-center': (vertical && middle) || (!vertical && center),
      'justify-end': !vertical && end,
      'justify-between': between,
      'flex-wrap': wrap,
      [`space-y-${gap}`]: vertical,
      [`space-x-${gap}`]: !vertical,
    }"
  >
    <slot />
  </div>
</template>
