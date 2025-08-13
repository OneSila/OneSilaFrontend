<script setup lang="ts">

import {reactive, watch, ref, Ref} from 'vue';
import { FormLayout } from './../form-layout';
import { FormConfig, HiddenFormField, cleanUpDataForMutation } from '../../formConfig';
import { FieldType } from "../../../../../utils/constants";
import {SubmitButtons} from "../submit-buttons";
import { Toast } from "../../../../../modules/toast";

const props = withDefaults(
  defineProps<{
    config: FormConfig;
    fieldsToClear?: string[] | null;
    defaults?: Record<string, string>
    outsideErrors?: Record<string, string> | null
  }>(),
  { fieldsToClear: null },
);

const emit = defineEmits(['formUpdated', 'submit']);
const errors: Ref<Record<string, string> | null> = ref(null);

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

if (props.defaults) {
  let anyDefaultUpdated = false;

  for (const [key, value] of Object.entries(props.defaults)) {
    if (form[key] === null || form[key] === undefined) {
      form[key] = value;
      anyDefaultUpdated = true;
    }
  }

  if (anyDefaultUpdated) {
    emit('formUpdated', form);
  }
}



const handleUpdateErrors = (validationErrors) => {
  errors.value = validationErrors;

  if (validationErrors['__all__']) {
    Toast.error(validationErrors['__all__']);
  }
}

watch(form, (newForm) => {
  emit('formUpdated', newForm);
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
    <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
      <FormLayout :config="config" :form="form" :errors="outsideErrors !== null && outsideErrors !== undefined ? outsideErrors : errors" />
    </div>
  </div>
  <slot name="additional-fields" />
  <SubmitButtons v-if="!config.hideButtons" :form="form" :config="config" @submit="emit('submit')" @update-errors="handleUpdateErrors" >
    <template #additional-button>
      <slot name="additional-button" />
    </template>
  </SubmitButtons>
</template>
