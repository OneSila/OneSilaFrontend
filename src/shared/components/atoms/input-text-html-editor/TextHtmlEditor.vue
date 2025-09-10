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
const invalidHtml = ref(false);

const defaultToolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote'],
  ['clean']
];

const finalToolbarOptions = computed(() => props.toolbarOptions || defaultToolbarOptions);

const editorOptions = computed(() => ({
  modules: {
    toolbar: finalToolbarOptions.value,
    clipboard: {
      allowed: { tags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'] },
    },
  },
}));

const validateHtml = (value: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  invalidHtml.value = doc.querySelector('parsererror') !== null;
};

watch(
  () => props.modelValue,
  (newVal) => {
    content.value = newVal || '';
    validateHtml(content.value);
  },
  { immediate: true }
);

watch(content, (newVal) => {
  emit('update:modelValue', newVal);
  validateHtml(newVal);
});

</script>

<template>
    <QuillEditor
      v-model:content="content"
      contentType="html"
      theme="snow"
      :options="editorOptions"
      :placeholder="placeholder || 'Type here...'"
      :read-only="disabled || aiGenerating"
      style="min-height: 250px;"
    />
      <p v-if="invalidHtml" class="mt-2 text-sm text-red-600">
        {{ t('shared.components.atoms.textHtmlEditor.invalidHtml') }}
      </p>
</template>

<style scoped>

:deep(ol > li[data-list="bullet"]::before) {
  content: "• " !important;
  left: -1.5rem;
  color: inherit;
}

:deep(ul) {
  list-style: disc;
  margin-left: 1.5rem;
}

</style>
