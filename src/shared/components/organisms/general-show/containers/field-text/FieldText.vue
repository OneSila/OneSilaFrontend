<script setup lang="ts">

import { Link } from '../../../../atoms/link';
import { TextField } from '../../showConfig';

const props = defineProps<{
  field: TextField;
  modelValue?: string | number;
}>();

</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <Link v-if="field.clickable" :path="field.clickUrl">{{ modelValue }}</Link>
    <span v-else>{{ modelValue }}</span>
  </div>
</template>
