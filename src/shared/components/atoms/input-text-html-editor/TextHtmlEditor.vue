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
      matchVisual: false, // good to keep, avoids weird <br> issues
    },
  },
  // Only allow the formats you actually need
  formats: [
    'header',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'blockquote',
  ],
}));


const validateHtml = (value: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  const parsed = doc.body.innerHTML.trim();
  invalidHtml.value = parsed !== value.trim();
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
  <div v-bind="$attrs">
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
  </div>
</template>

<style scoped>

:deep(ol > li[data-list="bullet"]::before) {
  content: "• " !important;
  left: -1.5rem;
  color: inherit;
}

:deep(ol) {
  list-style: none;
  margin-left: 1.5rem;
}

:deep(ul) {
  list-style: disc;
  margin-left: 1.5rem;
}

</style>
