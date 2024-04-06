<script setup lang="ts">

import { PhoneField } from '../../showConfig';

const props = defineProps<{
  field: PhoneField;
  modelValue: string;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <a v-if="field.clickable && modelValue" :href="`tel:${modelValue}`">{{ modelValue }}</a>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
