<script setup lang="ts">
import { defineProps } from 'vue';
import { Selector } from '../../../../../atoms/selector';
import { BooleanFormField } from '../../../formConfig';

const props = defineProps<{
  field: BooleanFormField;
  modelValue: boolean | null | undefined;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (newValue) => {
  emit('update:modelValue', newValue);
};

const dropdownPosition = props.field.dropdownPosition || 'top';
const disabled = props.field.disabled === true;
</script>

<template>
  <div class="field-item">
    <Selector
      :model-value="modelValue === true"
      :options="[]"
      @update:modelValue="updateValue"
      :dropdown-position="dropdownPosition"
      :placeholder="field.placeholder"
      :mandatory="!field.strict"
      label-by="name"
      value-by="id"
      :removable="false"
      boolean
      :disabled="disabled"
    />
  </div>
</template>
