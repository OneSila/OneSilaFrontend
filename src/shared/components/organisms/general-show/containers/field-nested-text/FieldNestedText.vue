<script setup lang="ts">
import { computed } from 'vue';
import { FieldText } from '../field-text';
import {NestedTextField, TextField} from '../../showConfig';
import { accessNestedProperty } from '../../../general-show/showConfig';
import { FieldType } from "../../../../../utils/constants";

const props = defineProps<{
  field: NestedTextField;
  modelValue: any;
}>();

const nestedValue = computed(() => accessNestedProperty(props.modelValue, props.field.keys));

const modifiedField = computed(() => ({
  ...props.field,
  type: FieldType.Text,
  clickUrl: buildClickUrl()
}));

const buildClickUrl = () => {
  if (!props.field.clickable || !props.field.clickIdentifiers) {
    return props.field.clickUrl;
  }

  const params = props.field.clickIdentifiers.reduce((acc, identifier) => {
    const key = Object.keys(identifier)[0];
    acc[key] = accessNestedProperty(props.modelValue, identifier[key]);
    return acc;
  }, {});

  return {
    ...props.field.clickUrl,
    params
  };
};

</script>


<template>
  <FieldText v-if="nestedValue !== null" :field="modifiedField as TextField" :model-value="nestedValue" />
</template>