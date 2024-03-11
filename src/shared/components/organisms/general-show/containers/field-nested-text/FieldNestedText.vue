<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { FieldText } from '../field-text';
import { NestedTextField } from '../../showConfig';
import { accessNestedProperty } from '../../../general-listing/listingConfig';
import { FieldType } from "../../../../../utils/constants";

const props = defineProps<{
  field: NestedTextField;
  modelValue: any;
}>();

const nestedValue = computed(() => accessNestedProperty(props.modelValue, props.field.keys));

const modifiedField = computed(() => ({
  ...props.field,
  type: FieldType.Text
}));

</script>


<template>
  <FieldText v-if="nestedValue !== null" :field="modifiedField" :model-value="nestedValue" />
</template>