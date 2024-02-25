<script setup lang="ts">
import { defineProps } from 'vue';
import { Selector } from '../../../../../atoms/selector';
import { Label } from '../../../../../atoms/label';
import { BooleanFormField } from '../../../formConfig';

const props = defineProps<{
  field: BooleanFormField;
  modelValue: boolean;
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
    <Label semi-bold class="mb-2">{{ field.label }}</Label>
    <div>
      <Selector
        :model-value="modelValue"
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
  </div>
</template>
