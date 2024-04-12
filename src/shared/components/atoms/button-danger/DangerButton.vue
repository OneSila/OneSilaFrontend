<script setup lang="ts">

import { Button} from "../button";

const props = defineProps<{ loading?: boolean; disabled?: boolean; customClass?: string;  }>();

const emit = defineEmits(['click']);

const onClicked = (event) => {
  emit('click', event);
};
</script>

<template>
  <Button
    :loading="props.loading"
    :disabled="props.disabled"
    :custom-class="customClass"
    class="rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-danger"
    @click="onClicked"
  >
    <slot></slot>
  </Button>
</template>
