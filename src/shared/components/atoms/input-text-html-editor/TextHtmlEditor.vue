<script setup lang="ts">
import { ref, watch } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const content = ref(props.modelValue || '');

watch(() => props.modelValue, (newVal) => {
  content.value = newVal || '';

});

watch(content, (newVal) => {
  emit('update:modelValue', newVal);
});

</script>

<template>
  <QuillEditor
    v-model:content="content"
    :contentType="'html'"
    theme="snow"
    toolbar="essential"
    :placeholder="placeholder || 'Type here...'"
    :read-only="disabled"
    style="min-height: 150px;"
  />
</template>
