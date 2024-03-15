<script setup lang="ts">

import { ref } from 'vue';
import {PhoneFormField} from '../../../formConfig';
import {PhoneNumberInput} from "../../../../../atoms/input-phone-number";

const props = defineProps<{
  field: PhoneFormField;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);
const phoneNumber = ref(props.modelValue)

const updateValue = (value) => {
  emit('update:modelValue', value);
};

</script>

<template>
  <div class="field-item">
    <PhoneNumberInput class="mb-2" v-model:model-value="phoneNumber" @update:model-value="updateValue" />
  </div>
</template>
