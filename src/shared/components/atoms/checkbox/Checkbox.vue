<script setup lang="ts">

import {computed, ref, watch} from 'vue';
import { Switch } from '@headlessui/vue';

const props = defineProps<{ modelValue?: boolean }>();
const emit = defineEmits(['update:modelValue']);

const innerValue = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  innerValue.value = newValue;
});

watch(innerValue, (newValue) => {
  emit('update:modelValue', newValue);
});

const switchClass = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) {
    return 'bg-gray-200 relative inline-flex h-6 w-11 items-center flex-shrink-0 cursor-pointer rounded-full border-2 border-red-500 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2';
  } else {
    return `${innerValue.value ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`;
  }
});

</script>

<template>
  <Switch v-model="innerValue" :class="switchClass">
    <span :class="[innerValue ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform bg-white rounded-full shadow ring-0 transition duration-200 ease-in-out']">
      <span :class="[innerValue ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in', 'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity']" aria-hidden="true">
        <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
          <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span :class="[innerValue ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out', 'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity']" aria-hidden="true">
        <svg class="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 12 12">
          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
        </svg>
      </span>
    </span>
  </Switch>
</template>
