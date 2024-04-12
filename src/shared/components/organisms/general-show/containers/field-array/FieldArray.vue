<script setup lang="ts">

import { FieldNestedText } from './../field-nested-text';
import {ArrayField, NestedTextField} from '../../showConfig';
import { accessNestedProperty } from '../../../general-show/showConfig';
import { FieldType} from "../../../../../utils/constants";

const props = defineProps<{
  field: ArrayField;
  modelValue: any[];
}>();

const buildNestedField = (item) => {
  return  {
    ...props.field,
    type: FieldType.NestedText,
    clickIdentifiers : props.field.clickIdentifiers,
    showLabel: false
  };

};

</script>

<template>
  <div>
    <div v-for="(item, index) in modelValue" :key="index">

      <FieldNestedText
        :field="buildNestedField(item) as NestedTextField"
        :model-value="item" />

    </div>
  </div>
</template>
