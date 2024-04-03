<script setup lang="ts">

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


const onClicked = (event) => {
  !props.disabled && emit('click', event);
};
</script>

<template>
  <Button
    :loading="props.loading"
    :disabled="props.disabled"
    class="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-primary"
    @click="onClicked"
  >
    <slot></slot>
  </Button>
</template>