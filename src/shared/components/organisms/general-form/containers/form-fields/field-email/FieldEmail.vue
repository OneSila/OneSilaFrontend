<script setup lang="ts">

import { ref } from 'vue';
import {EmailFormField} from '../../../formConfig';
import {EmailInput} from "../../../../../atoms/input-email";

const props = defineProps<{
  field: EmailFormField;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);
const email = ref(props.modelValue)

const updateValue = (value) => {
  emit('update:modelValue', value);
};

</script>

<template>
  <div class="field-item">
    <EmailInput
        v-model:model-value="email"
        :placeholder="field.placeholder"
        :icon="field.icon"
        :disabled="field.disabled"
        :focused="field.focused"
        :required="field.required"
        @update:model-value="updateValue" />
  </div>
</template>
