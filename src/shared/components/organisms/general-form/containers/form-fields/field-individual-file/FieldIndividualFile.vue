<script setup lang="ts">

import { IndividualFileFormField } from '../../../formConfig';
import FileUploader from "../../../../file-uploader/FileUploader.vue";

const props = defineProps<{
  field: IndividualFileFormField;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  emit('update:modelValue', event);
};

</script>

<template>
  <div class="field-item">
    <FileUploader :model-value="modelValue" @update:model-value="updateValue"/>
  </div>
</template>
