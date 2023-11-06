<script setup lang="ts">
import { ref, watchEffect } from 'vue';

const props = defineProps<{ modelValue: boolean }>();

const emit = defineEmits<{
  (e: 'closed'): void;
  (e: 'update:modelValue', isOpen: boolean): void;
}>();

const isOpen = ref(props.modelValue);

const close = () => {
  isOpen.value = false;

  emit('closed');
};

watchEffect(() => {
  isOpen.value = props.modelValue;
});
</script>

<template>
</template>
