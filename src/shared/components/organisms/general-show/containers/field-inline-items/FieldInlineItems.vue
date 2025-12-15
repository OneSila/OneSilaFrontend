<script setup lang="ts">
import { computed } from 'vue';
import { Badge } from '../../../../atoms/badge';
import type { InlineItemsField } from '../../showConfig';

const props = defineProps<{
  field: InlineItemsField;
  modelValue: any;
}>();

type InlineItem = { text: string; color?: string };

const items = computed<InlineItem[]>(() => {
  const value = props.modelValue;
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((v) => v !== null && v !== undefined && String(v).length > 0)
    .map((v) => {
      if (typeof v === 'object' && v !== null && 'text' in v) {
        return { text: String((v as any).text), color: (v as any).color };
      }
      return { text: String(v), color: props.field.color };
    });
});
</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <div v-if="items.length" class="flex flex-wrap gap-2">
      <Badge v-for="(item, idx) in items" :key="idx" :text="item.text" :color="item.color || field.color || 'gray'" />
    </div>
    <span v-else>-</span>
  </div>
</template>

