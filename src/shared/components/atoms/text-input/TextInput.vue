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
  maxNumber?: number;
  focused?: boolean;
}>();

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
</script>

<template>
  <input
    ref="input"
    class="text-input focus:outline-none focus:border-sky-500 focus:ring-sky-500 block rounded-md px-3 py-2 text-sm placeholder:italic focus:ring-1"
    :type="secret ? 'password' : number ? 'number' : 'text'"
    :min="number ? '1' : undefined"
    :max="number && maxNumber ? maxNumber : undefined"
    :step="number ? '1' : undefined"
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
    @input="(event) => $emit('update:modelValue', (event.target as any).value)"
    @focus="$emit('focus')"
    @keyup.enter="blur"
  />
</template>
