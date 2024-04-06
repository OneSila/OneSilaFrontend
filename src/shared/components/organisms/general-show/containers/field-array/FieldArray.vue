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
    clickUrl: buildClickUrl(item),
    showLabel: false
  };

};

const buildClickUrl = (item) => {
  if (!props.field.clickable || !props.field.clickIdentifiers) {
    return props.field.clickUrl;
  }

  const params = props.field.clickIdentifiers.reduce((acc, identifier) => {
    const key = Object.keys(identifier)[0];
    acc[key] = accessNestedProperty(item, identifier[key]);
    return acc;
  }, {});

  return {
    ...props.field.clickUrl,
    params
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
