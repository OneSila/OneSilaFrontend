<script setup lang="ts">
import { defineProps } from 'vue';
import { Label } from '../../../../../atoms/label';
import { TextInput } from '../../../../../atoms/text-input';
import { ValueFormField } from '../../../formConfig';

const props = defineProps<{
  field: ValueFormField;
  modelValue: any;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  const newValue = event.target.value;
  emit('update:modelValue', newValue);
};

</script>

<template>
    <Label semi-bold>{{ field.label }}</Label>
    <div>
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
