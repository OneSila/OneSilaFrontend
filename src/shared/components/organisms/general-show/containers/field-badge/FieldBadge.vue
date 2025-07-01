<script setup lang="ts">

import { Badge } from '../../../../atoms/badge'
import { BadgeField } from '../../showConfig';

const props = defineProps<{
  field: BadgeField;
  modelValue: string | number;
}>();

function getBadgeData(key: string | number) {
  return props.field.badgeMap[key];
}
</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Badge
      v-if="modelValue && getBadgeData(modelValue)"
      :text="getBadgeData(modelValue).text"
      :color="getBadgeData(modelValue).color"
      :hover-text="getBadgeData(modelValue).hoverText" />
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
