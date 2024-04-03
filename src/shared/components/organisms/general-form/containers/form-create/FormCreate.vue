<script setup lang="ts">

import {reactive, defineProps, watch, ref, Ref} from 'vue';
import { useRouter } from 'vue-router';
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
  }>(),
  { fieldsToClear: null },
);

const emits = defineEmits(['formUpdated']);
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

const router = useRouter();

const handleUpdateErrors = (validationErrors) => {
  errors.value = validationErrors;

  console.log(validationErrors)
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
        console.log(form);
        form[field] = null;
        console.log(form);
      }
    });
  }
}, { deep: true });

</script>

<template>
  <div class="px-4 py-6 sm:p-8">
    <div class="grid max-w grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
      <FormLayout :config="config" :form="form" :errors="errors" />
    </div>
  </div>
  <SubmitButtons v-if="!config.hideButtons" :form="form" :config="config" @update-errors="handleUpdateErrors" />
</template>
