<script setup lang="ts">
import { RecursiveAccordion } from '../../../shared/components/molecules/recursive-accordion';

defineProps<{
  title: string;
  value: unknown;
  startExpanded?: boolean;
}>();
</script>

<template>
  <div class="py-3">
    <span class="block font-medium">{{ title }}</span>
    <div class="mt-3">
      <RecursiveAccordion :value="value" :start-expanded="startExpanded" />
    </div>
  </div>
</template>
