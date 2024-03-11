<script setup lang="ts">
import { defineProps } from 'vue';
import { Selector } from '../../../../../atoms/selector';
import { QueryFormField } from '../../../formConfig';

const props = defineProps<{
  field: QueryFormField;
  modelValue: any;
}>();
const emit = defineEmits(['update:modelValue']);

const updateValue = (newValue) => {
  emit('update:modelValue', newValue);
};

const dropdownPosition = props.field.dropdownPosition || 'top';
const mandatory = props.field.mandatory !== undefined ? props.field.mandatory : false;
const multiple = props.field.multiple || false;
const filterable = props.field.filterable || false;
const removable = props.field.removable !== undefined ? props.field.removable : true;
const limit = props.field.limit || null;

const cleanedData = (rawData) => {
  if (props.field.isEdge && rawData?.edges) {
    return rawData.edges.map(edge => edge.node);
  }
  return rawData;
};

</script>

<template>
  <div class="field-item">
    <Selector
      v-if="field.disabled"
      :modelValue="modelValue"
      @update:modelValue="updateValue"
      :options="[]"
      :label-by="field.labelBy"
      :value-by="field.valueBy"
      :placeholder="field.placeholder"
      :dropdown-position="dropdownPosition"
      :mandatory="mandatory"
      :multiple="multiple"
      :filterable="filterable"
      :removable="removable"
      :limit="limit"
      :disabled="true"
    />
    <ApolloQuery v-else :query="field.query" :variables="field.queryVariables">
      <template v-slot="{ result: { data } }">
        <Selector
          v-if="data && data[field.dataKey]"
          :modelValue="modelValue"
          @update:modelValue="updateValue"
          :options="cleanedData(data[field.dataKey])"
          :label-by="field.labelBy"
          :value-by="field.valueBy"
          :placeholder="field.placeholder"
          :dropdown-position="dropdownPosition"
          :mandatory="mandatory"
          :multiple="multiple"
          :filterable="filterable"
          :removable="removable"
          :limit="limit"
          :disabled="field.disabled"
        />
      </template>
    </ApolloQuery>
  </div>
</template>
