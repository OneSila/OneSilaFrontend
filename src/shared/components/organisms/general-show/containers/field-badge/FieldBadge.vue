<script setup lang="ts">

import { Badge } from '../../../../atoms/badge'
import { BadgeField } from '../../showConfig';

const props = defineProps<{
  field: BadgeField;
  modelValue: unknown;
}>();

type BadgeValue = { text: string; color: string; hoverText?: string };

const isBadgeValue = (value: unknown): value is BadgeValue => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  return 'text' in value && 'color' in value;
};

function getBadgeData(key: string | number) {
  return props.field.badgeMap[key];
}
</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Badge
      v-if="isBadgeValue(modelValue)"
      :text="modelValue.text"
      :color="modelValue.color"
      :hover-text="modelValue.hoverText" />
    <Badge
      v-else-if="(typeof modelValue === 'string' || typeof modelValue === 'number') && getBadgeData(modelValue)"
      :text="getBadgeData(modelValue).text"
      :color="getBadgeData(modelValue).color"
      :hover-text="getBadgeData(modelValue).hoverText" />
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
