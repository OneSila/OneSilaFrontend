<script setup lang="ts">

import {ImageFormField, ValueFormField} from '../../../formConfig';
import {ImageAssigner} from "../../../../image-assigner";
import {Selector} from "../../../../../atoms/selector";

const props = defineProps<{
  field: ImageFormField;
  modelValue: any;
}>();

const emit = defineEmits(['update:modelValue']);

const updateValue = (event) => {
  // let only the id or null
  console.log(event)
  let image = event;
  if (image !== null) {
    image = { id: image.id }
  }
  console.log(image)

  emit('update:modelValue', image);
};

</script>

<template>
  <div class="field-item">
    <ImageAssigner :model-value="modelValue" @update:model-value="updateValue"/>
  </div>
</template>
