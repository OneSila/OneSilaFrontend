<script setup lang="ts">

import {reactive, defineProps, watch, Ref, ref} from 'vue';
import { useRouter } from 'vue-router';
import { FormLayout } from './../form-layout';
import { FormConfig, HiddenFormField} from '../../formConfig';
import { FieldType } from "../../../../../utils/constants";
import {SubmitButtons} from "../submit-buttons";
import { Toast } from "../../../../../modules/toast";

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
const errors: Ref<Record<string, string> | null> = ref(null);

const initialFormUpdate = (data: any) => {

  // we want to updated only the first time then we can freely update it from outside without coming back to the initial values (example using clear fields)
  if (Object.keys(form).length !== 0) {
    return true;
  }

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
    } else if (dataToEdit === null) {
      form[field.name] = null;
    }
    else if (dataToEdit.hasOwnProperty(field.name)) {
      form[field.name] = dataToEdit[field.name];
    } else {
      if (field.default) {
        form[field.name] = field.default;
     }
    }

  });

  return true;
};

const handleUpdateErrors = (validationErrors) => {
  errors.value = validationErrors;

  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
}

watch(form, (newForm) => {
  emits('formUpdated', newForm);
}, { deep: true });


watch(() => props.fieldsToClear, (fields) => {
  if (fields && fields.length > 0) {
    fields.forEach(field => {
      if (form[field] !== undefined) {
        form[field] = null;
      }
    });
  }
}, { deep: true });

</script>


<template>
  <div class="px-4 py-6 sm:p-8">
      <template v-if="config.queryData">
        <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
          <FormLayout v-if="initialFormUpdate(config.queryData)" :config="config" :form="form" :errors="errors" />
        </div>
      </template>
      <ApolloQuery v-else :query="config.query" :variables="config.queryVariables" class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
        <template v-slot="{ result: { loading, error, data } }">
            <FormLayout v-if="data && !loading && initialFormUpdate(data)" :config="config" :form="form" :errors="errors"/>
            <FormLayout v-else :config="config" :form="form" :errors="errors" />
        </template>
      </ApolloQuery>
  </div>
  <SubmitButtons v-if="!config.hideButtons" :form="form" :config="config" @update-errors="handleUpdateErrors" />

</template>