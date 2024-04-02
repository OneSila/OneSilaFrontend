<script setup lang="ts">

import { Button} from "../button";

import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  loading: Boolean,
  disabled: Boolean
});

const emit = defineEmits(['click']);

const onClicked = (event) => {
  emit('click', event);
};
</script>

<template>
  <Button
    :loading="props.loading"
    :disabled="props.disabled"
    class="rounded-md px-3 py-2 text-sm font-semibold text-gray-900"
    @click="onClicked"
  >
    <slot></slot>
  </Button>
</template>
