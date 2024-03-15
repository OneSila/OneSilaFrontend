<script setup lang="ts">

import { Label } from '../../../../atoms/label';
import { Icon } from '../../../../atoms/icon';
import { PhoneField } from '../../showConfig';

const props = defineProps<{
  field: PhoneField;
  modelValue: string;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Icon v-if="field.icon" :name="field.icon" />
    <Label v-if="field.label && field.showLabel" semi-bold class="mb-2">{{ field.label }}</Label>

    <a v-if="field.clickable && modelValue" :href="`tel:${modelValue}`">{{ modelValue }}</a>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
