<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref } from 'vue'
import {Label} from "../label";

const props = defineProps<{
  modelValue?: any;
  label?: string;
  mandatory?: boolean;
}>();

const date = ref(props.modelValue);

const emit = defineEmits({
  'update:modelValue': (value: any) => true,
});
const onUpdated = (value) => {
    emit('update:modelValue', value);
}

</script>

<template>
  <div>
    <Label v-if="label" class="font-semibold text-md">{{ label }}<span v-if="mandatory">*</span></Label>
    <VueDatePicker v-model="date" :format="'MM/dd/yyyy'" range  @update:model-value="onUpdated" />
  </div>
</template>