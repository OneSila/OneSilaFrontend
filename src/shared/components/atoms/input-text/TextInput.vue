<script setup lang="ts">

import { ref, onMounted } from 'vue';

const props = defineProps<{
  placeholder?: string;
  modelValue?: any;
  error?: boolean;
  transparent?: boolean;
  disabled?: boolean;
  secret?: boolean;
  number?: boolean;
  float?: boolean;
  minNumber?: number;
  maxNumber?: number;
  focused?: boolean;
  allowAutocomplete?: boolean;
}>();

const emit = defineEmits({
  'update:modelValue': (value: any) => true,
  'focus': () => true,
  'blur': () => true
});

const input: any = ref(null);

const focus = () => {
  input.value?.focus();
};

const blur = () => {
  input.value?.blur();
};

onMounted(() => {
  if (props.focused) {
    focus();
  }
});

defineExpose({
  focus,
});

const handleInput = (event) => {
  let value = event.target.value;
  if (props.number) {
    value = props.float ? parseFloat(value) : parseInt(value, 10);
  }
  emit('update:modelValue', value);
};


</script>

<template>
  <input
    ref="input"
    class="text-input focus:outline-none focus:border-sky-500 focus:ring-sky-500 block rounded-md px-3 py-2 text-sm placeholder:italic focus:ring-1"
    :type="secret ? 'password' : (number || float) ? 'text' : 'text'"
    :step="float ? 'any' : (number ? '1' : undefined)"
    :min="number && minNumber ? minNumber : undefined"
    :max="number && maxNumber ? maxNumber : undefined"
    :class="{
      'border border-gray-300 shadow-sm placeholder:text-gray-400':
        !transparent && !error,
      'border border-red-400 text-red-500 shadow-sm placeholder:text-red-300':
        !transparent && error,
      'cursor-not-allowed': disabled,
    }"
    :placeholder="placeholder"
    :value="modelValue"
    :disabled="disabled"
    :autocomplete="allowAutocomplete ? 'on' : 'off'"
    @input="handleInput"
    @focus="$emit('focus')"
    @keyup.enter="blur"
  />
</template>
