<script setup lang="ts">

import { TextEditor } from '../../../../../atoms/input-text-editor';
import {TextareaFormField} from '../../../formConfig';

const props = defineProps<{
  field: TextareaFormField;
  modelValue: any;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  let newValue = event.target.value;
  emit('update:modelValue', newValue);
};

</script>

<template>
  <div class="field-item">
    <TextEditor
      class="w-full h-32"
      :model-value="modelValue"
      @input="updateValue"
      :placeholder="field.placeholder"
      :error="field.error"
      :transparent="field.transparent"
      :disabled="field.disabled"
      :gutter-x="field.gutterX"
      :gutter-y="field.gutterY"
      :gutterless="field.gutterless"
      :blur-on-enter-keypress="field.blurOnEnterKeypress"
      :scroll="field.scroll"
    />
  </div>
</template>
