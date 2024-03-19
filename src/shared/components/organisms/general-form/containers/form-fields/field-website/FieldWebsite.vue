<script setup lang="ts">

import { ref } from 'vue';
import {WebsiteFormField} from '../../../formConfig';
import {WebsiteInput} from "../../../../../atoms/input-website";

const props = defineProps<{
  field: WebsiteFormField;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);
const website = ref(props.modelValue)

const updateValue = (value) => {
  emit('update:modelValue', value);
};

</script>

<template>
  <div class="field-item">
    <WebsiteInput
        v-model:model-value="website"
        :placeholder="field.placeholder"
        :icon="field.icon"
        :disabled="field.disabled"
        :focused="field.focused"
        :required="field.required"
        @update:model-value="updateValue" />
  </div>
</template>
