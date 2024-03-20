<script setup lang="ts">

import { reactive, defineProps, watch } from 'vue';
import { useRouter } from 'vue-router';
import { FormLayout } from './../form-layout';
import { FormConfig, HiddenFormField, cleanUpDataForMutation } from '../../formConfig';
import { FieldType } from "../../../../../utils/constants";
import {SubmitButtons} from "../submit-buttons";

const props = withDefaults(
  defineProps<{
    config: FormConfig;
    fieldsToClear?: string[] | null;
    defaults?: Record<string, string> // this will be used to populate defaults (took from url or given directly from config)
  }>(),
  { fieldsToClear: null },
);
const emits = defineEmits(['formUpdated']);

const form = reactive(props.config.fields.reduce((acc, field) => {
  if (field.type === FieldType.Hidden) {
    const hiddenField = field as HiddenFormField;
    acc[field.name] = hiddenField.value;
  } else {
  if (field.default !== undefined && field.default !== null) {
    acc[field.name] = field.default;
  } else {
    acc[field.name] = null;
  }
  }
  return acc;
}, {}));

const router = useRouter();

watch(form, (newForm) => {
  emits('formUpdated', newForm);
}, { deep: true });

watch(() => props.fieldsToClear, (fields) => {
  if (fields && fields.length > 0) {
    fields.forEach(field => {
      if (form[field] !== undefined) {
        console.log(form);
        form[field] = null;
        console.log(form);
      }
    });
  }
}, { deep: true });

</script>

<template>
  <div>
    <FormLayout :config="config" :form="form" />
    <SubmitButtons v-if="!config.hideButtons" :form="form" :config="config" />
  </div>
</template>
