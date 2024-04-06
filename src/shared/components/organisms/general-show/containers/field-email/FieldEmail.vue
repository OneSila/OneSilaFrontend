<script setup lang="ts">

import { Label } from '../../../../atoms/label';
import { Icon } from '../../../../atoms/icon';
import { EmailField } from '../../showConfig';

const props = defineProps<{
  field: EmailField;
  modelValue: string;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <a v-if="field.clickable && modelValue" :href="`mailto:${modelValue}`">{{ modelValue }}</a>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
