<script setup lang="ts">

import { Label } from '../../../../atoms/label';
import { Icon } from '../../../../atoms/icon';
import { Link } from '../../../../atoms/link';
import { DateField } from '../../showConfig';

const props = defineProps<{
  field: DateField;
  modelValue: string;
}>();

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Icon v-if="field.icon" :name="field.icon" />
    <Label v-if="field.label && field.showLabel" semi-bold class="mb-2">{{ field.label }}</Label>

    <span>{{ formatDate(modelValue) }}</span>
  </div>
</template>
