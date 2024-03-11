<script setup lang="ts">
import { defineProps } from 'vue';
import { TextInput } from '../../../../../atoms/text-input';
import { ValueFormField } from '../../../formConfig';

const props = defineProps<{
  field: ValueFormField;
  modelValue: any;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  let newValue = event.target.value;

  if (props.field.number) {
    const parsedValue = parseInt(newValue, 10);
    newValue = isNaN(parsedValue) ? parseFloat(newValue) : parsedValue;
  }

  emit('update:modelValue', newValue);
};

</script>

<template>
  <div class="field-item">
    <TextInput
      class="w-full"
      :model-value="modelValue"
      @input="updateValue"
      :placeholder="field.placeholder"
      :error="field.error"
      :transparent="field.transparent"
      :disabled="field.disabled"
      :secret="field.secret"
      :number="field.number"
      :maxNumber="field.maxNumber"
      :minNumber="field.minNumber"
    />
  </div>
</template>
