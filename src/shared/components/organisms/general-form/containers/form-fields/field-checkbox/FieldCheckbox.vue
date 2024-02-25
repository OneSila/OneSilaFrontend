<script setup lang="ts">
import { defineProps } from 'vue';
import { Checkbox } from '../../../../../atoms/checkbox';
import { Label } from '../../../../../atoms/label';
import { CheckboxFormField } from '../../../formConfig';

const props = defineProps<{
  field: CheckboxFormField;
  modelValue: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (newValue) => {
  emit('update:modelValue', newValue ? true : props.field.uncheckedValue === 'false' ? false : null);
};

</script>

<template>
  <div class="field-checkbox">
    <Label class="mr-2">{{ field.label }}</Label>
    <Checkbox
      :model-value="modelValue"
      @update:modelValue="updateValue"
      :disabled="field.disabled"
    />
  </div>
</template>
