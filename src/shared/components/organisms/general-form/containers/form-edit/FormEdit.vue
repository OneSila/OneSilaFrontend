<script setup lang="ts">

import {reactive, defineProps, watch} from 'vue';
import { useRouter } from 'vue-router';
import { FormLayout } from './../form-layout';
import { FormConfig, HiddenFormField, cleanUpDataForMutation} from '../../formConfig';
import { FieldType } from "../../../../../utils/constants";
import {SubmitButtons} from "../submit-buttons";

const props = withDefaults(
  defineProps<{
    config: FormConfig;
    fieldsToClear?: string[] | null
  }>(),
  { fieldsToClear: null },
);
const emits = defineEmits(['formUpdated']);

const form = reactive({});
const router = useRouter();

const updateForm = (data: any) => {
  const dataToEdit = props.config.queryDataKey ? data[props.config.queryDataKey] : data;

  props.config.fields.forEach(field => {
    if (field.type === FieldType.Hidden) {
      const hiddenField = field as HiddenFormField;
      form[field.name] = hiddenField.value;
    } else if (field.type === FieldType.ProxyChoice) {
      if (field.multiple) {
        form[field.name] = field.options
          .filter(option => dataToEdit[option[field.valueBy]] === true)
          .map(option => option[field.valueBy]);
      } else {
        form[field.name] = field.options
          .find(option => dataToEdit[option[field.valueBy]] === true)?.[field.valueBy];
      }
    } else if (dataToEdit.hasOwnProperty(field.name)) {
      form[field.name] = dataToEdit[field.name];
    } else {
      if (field.default) {
        form[field.name] = field.default;
     }
    }

  });

  return true;
};

watch(form, (newForm) => {
  emits('formUpdated', newForm);
}, { deep: true });


watch(() => props.fieldsToClear, (fields) => {
  if (fields && fields.length) {
    fields.forEach(field => {
      if (form[field] !== undefined) {
        form[field] = null;
      }
    });
  }
}, { deep: true });

</script>


<template>
  <div>
    <template v-if="config.queryData">
      <div v-if="updateForm(config.queryData)">
        <FormLayout :config="config" :form="form" />
      </div>
    </template>
    <ApolloQuery v-else :query="config.query" :variables="config.queryVariables">
      <template v-slot="{ result: { loading, error, data } }">
        <div v-if="data && updateForm(data)">
          <FormLayout :config="config" :form="form" />
        </div>
        <p v-if="loading">Loading...</p>
        <p v-if="error">{{ error.message }}</p>
      </template>
    </ApolloQuery>

    <SubmitButtons v-if="!config.hideButtons" :form="form" :config="config" />
  </div>
</template>