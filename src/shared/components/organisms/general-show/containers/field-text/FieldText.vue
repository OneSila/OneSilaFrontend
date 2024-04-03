<script setup lang="ts">

import { Label } from '../../../../atoms/label';
import { Icon } from '../../../../atoms/icon';
import { Link } from '../../../../atoms/link';
import { TextField } from '../../showConfig';

const props = defineProps<{
  field: TextField;
  modelValue: string | number;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Icon v-if="field.icon" :name="field.icon" />
    <Label v-if="field.label && field.showLabel" semi-bold class="mb-2">{{ field.label }}</Label>

    <Link v-if="field.clickable" :path="field.clickUrl">{{ modelValue }}</Link>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
