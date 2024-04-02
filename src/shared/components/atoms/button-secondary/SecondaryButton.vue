<script setup lang="ts">

import { computed } from 'vue';
import { Button} from "../button";

const props = defineProps<{
  loading?: boolean;
  disabled?: boolean;
  customClass?: string;
  btnType?: string;
}>();

const emit = defineEmits<{
  (e: 'click', event: any): void;
}>();

const classs = computed(() => {
  const baseClasses = {
    'button': true,
    'cursor-not-allowed': props.disabled
  };

  if (!props.customClass) {
    return baseClasses;
  }

  const customClassesObj = props.customClass.split(' ').reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {});

  return { ...baseClasses, ...customClassesObj };
});

const onClicked = (event) => {
  !props.disabled && emit('click', event);
};
</script>

<template>
  <Button
    :loading="props.loading"
    :disabled="props.disabled"
    class="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-secondary"
    @click="onClicked"
  >
    <slot></slot>
  </Button>
</template>