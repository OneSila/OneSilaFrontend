<script setup lang="ts">

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
    <span>{{ formatDate(modelValue) }}</span>
  </div>
</template>
