<script setup lang="ts">
import { Icon } from '../../../../atoms/icon';
import { IconField } from '../../showConfig';

const props = defineProps<{
  field: IconField;
  modelValue: string | number;
}>();

function getIconData(key: string | number) {
  return props.field.iconMap[key];
}

function colorClass(color?: string) {
  switch (color) {
    case 'green':
      return 'text-green-500';
    case 'yellow':
      return 'text-yellow-500';
    case 'orange':
      return 'text-orange-500';
    case 'red':
      return 'text-red-500';
    default:
      return '';
  }
}
</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Icon
      v-if="modelValue && getIconData(modelValue)"
      :name="getIconData(modelValue).name"
      :size="getIconData(modelValue).size"
      :class="colorClass(getIconData(modelValue).color)"
      :title="getIconData(modelValue).hoverText" />
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
