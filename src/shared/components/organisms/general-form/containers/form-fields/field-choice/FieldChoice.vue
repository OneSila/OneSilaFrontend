<script setup lang="ts">

import { Selector } from '../../../../../atoms/selector';
import { ChoiceFormField } from '../../../formConfig';

const props = defineProps<{
  field: ChoiceFormField;
  modelValue: any;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (newValue) => {
  emit('update:modelValue', newValue);
};

const dropdownPosition = props.field.dropdownPosition || 'top';
const mandatory = props.field.mandatory !== undefined ? props.field.mandatory : false;
const multiple = props.field.multiple || false;
const filterable = props.field.filterable || false;
const removable = props.field.removable !== undefined ? props.field.removable : true;
const limit = props.field.limit || undefined;

</script>

<template>
  <div class="field-choice">
    <Selector
      :model-value="modelValue"
      @update:modelValue="updateValue"
      :options="field.options"
      :label-by="field.labelBy"
      :value-by="field.valueBy"
      :placeholder="field.placeholder"
      :dropdown-position="dropdownPosition"
      :mandatory="mandatory"
      :multiple="multiple"
      :filterable="filterable"
      :removable="removable"
      :limit="limit"
      :disabled="props.field.disabled"
    />
  </div>
</template>
