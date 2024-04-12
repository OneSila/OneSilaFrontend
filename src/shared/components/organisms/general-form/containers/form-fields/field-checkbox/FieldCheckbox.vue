<script setup lang="ts">

import { Checkbox } from '../../../../../atoms/checkbox';
import { CheckboxFormField } from '../../../formConfig';

const props = defineProps<{
  field: CheckboxFormField;
  modelValue?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const updateValue = (newValue) => {
  emit('update:modelValue', newValue ? true : props.field.uncheckedValue === 'false' ? false : null);
};

</script>

<template>
  <div class="field-checkbox">
    <Checkbox
      :model-value="modelValue === true"
      @update:modelValue="updateValue"
      :disabled="field.disabled"
    />
  </div>
</template>
