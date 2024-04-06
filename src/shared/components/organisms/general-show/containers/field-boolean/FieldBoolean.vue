<script setup lang="ts">
import { defineProps } from 'vue';
import { Icon } from '../../../../atoms/icon';
import { BooleanField } from '../../showConfig';

const props = defineProps<{
  field: BooleanField;
  modelValue: boolean;
}>();


</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Icon v-if="modelValue" name="check-circle" class="ml-2 text-green-500" />
    <Icon v-else name="times-circle" class="ml-2 text-red-500" />
  </div>
</template>
