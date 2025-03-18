<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import {useI18n} from "vue-i18n";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  aiGenerating?: boolean;
  toolbarOptions?: any[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const { t } = useI18n();
const content = ref(props.modelValue || '');

const defaultToolbarOptions = [
  [{ font: ['sans-serif', 'serif', 'monospace'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote'],
  ['clean']
];

const finalToolbarOptions = computed(() => props.toolbarOptions || defaultToolbarOptions);

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
      contentType="html"
      theme="snow"
      :toolbar="finalToolbarOptions"
      :placeholder="placeholder || 'Type here...'"
      :read-only="disabled || aiGenerating"
      style="min-height: 250px;"
    />
</template>

<style scoped>

:deep(ol > li[data-list="bullet"]::before) {
  content: "• " !important;
  left: -1.5rem;
  color: inherit;
}

</style>