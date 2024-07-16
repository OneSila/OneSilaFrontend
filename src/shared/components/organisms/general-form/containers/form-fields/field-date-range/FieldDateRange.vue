<script setup lang="ts">

import { ref } from 'vue';
import { DateRangeFormField } from '../../../formConfig';
import {RangeDateInput} from "../../../../../atoms/input-date-range";

const props = defineProps<{
  field: DateRangeFormField;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);
const phoneNumber = ref(props.modelValue)

const updateValue = (value) => {
  if (value !== undefined) {
      emit('update:modelValue', value);
  }
};

</script>

<template>
  <div class="field-item">
    <RangeDateInput class="mb-2" v-model:model-value="phoneNumber" @update:model-value="updateValue" />
  </div>
</template>
