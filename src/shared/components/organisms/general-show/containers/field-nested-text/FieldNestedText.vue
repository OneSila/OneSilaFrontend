<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { FieldText } from '../field-text';
import {NestedTextField, TextField} from '../../showConfig';
import { accessNestedProperty } from '../../../general-show/showConfig';
import { FieldType } from "../../../../../utils/constants";

const props = defineProps<{
  field: NestedTextField;
  modelValue: any;
}>();

const nestedValue = computed(() => accessNestedProperty(props.modelValue, props.field.keys));

console.log(props.modelValue)
console.log(nestedValue)
console.log(props.field.keys)
console.log('-----------------')

const modifiedField = computed(() => ({
  ...props.field,
  type: FieldType.Text
}));

</script>


<template>
  <FieldText v-if="nestedValue !== null" :field="modifiedField as TextField" :model-value="nestedValue" />
</template>