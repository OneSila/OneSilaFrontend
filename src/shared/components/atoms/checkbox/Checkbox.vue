<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  modelValue?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);
const internalValue = ref(props.modelValue || false);
const syncingFromProps = ref(false);
watch(
  () => props.modelValue,
  (newVal) => {
    syncingFromProps.value = true;
    internalValue.value = newVal;
  }
);

watch(internalValue, (newVal) => {
  if (syncingFromProps.value) {
    syncingFromProps.value = false;
    return;
  }
  emit('update:modelValue', newVal);
});

const onChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target) {
    internalValue.value = target.checked;
    emit('update:modelValue', target.checked);
  }
};

const checkboxClasses = computed(() => {
  return `
    h-4 w-4
    text-primary
    bg-white
    border-gray-400
    rounded
    focus:ring-primary
    ${
      internalValue.value
        ? 'bg-primary border-primary'
        : 'bg-white border-gray-400'
    }
    transition
    duration-150
    ease-in-out
  `;
});
</script>

<template>
  <label class="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      :checked="internalValue"
      :disabled="props.disabled"
      class="form-checkbox h-4 w-4 text-primary transition duration-150 ease-in-out"
      :class="checkboxClasses"
      @change="onChange"
    />
    <span class="ml-2 text-sm text-white-dark">
      <slot></slot>
    </span>
  </label>
</template>
