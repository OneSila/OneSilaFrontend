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

const preventClickOutside = (event) => {
  const modalContent = document.querySelector('.vue-universal-modal-content');
  if (modalContent && !modalContent.contains(event.target)) {
    event.stopPropagation();
    event.preventDefault();
  }
};

const beforeEnter = () => {
  document.addEventListener('click', preventClickOutside, true);
};

const beforeLeave = () => {
  document.removeEventListener('click', preventClickOutside, true);
};

</script>

<template>
  <UniversalModal
    class="modal z-50"
    :model-value="isOpen"
    :close="close"
    @update:model-value="(event) => $emit('update:modelValue', event)"
    @before-enter="beforeEnter"
    @before-leave="beforeLeave"
  >
    <slot />
  </UniversalModal>
</template>
