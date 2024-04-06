<script setup lang="ts">

import { Label } from '../../../../atoms/label';
import { Icon } from '../../../../atoms/icon';
import { WebsiteField } from '../../showConfig';

const props = defineProps<{
  field: WebsiteField;
  modelValue: string;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <a v-if="field.clickable && modelValue" :href="modelValue" target="_blank">{{ modelValue }}</a>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
