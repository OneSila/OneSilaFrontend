<template>
  <div :class="computedClass">
    <img :src="src" :alt="alt" class="h-full w-full object-cover" />
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

const { src, alt, classModifier } = defineProps(['src', 'alt', 'classModifier']);

const computedClass = computed(() => {
  return classModifier ? classModifier : 'absolute inset-0';
});
</script>
