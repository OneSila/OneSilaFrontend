<script setup lang="ts">
import { Icon } from '../icon';
import { computed } from 'vue';

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
  <button
    :class="classs"
    type="button"
    @click="onClicked"
  >
    <Icon v-if="loading" name="circle-notch" spin />
    <slot v-else />
  </button>
</template>


<style scoped></style>
