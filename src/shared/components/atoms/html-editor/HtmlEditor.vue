<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps<{
  placeholder?: string;
  height?: string;
  modelValue?: any;
  transparent?: boolean;
  error?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', text: string): void;
}>();

const editor: Ref<any> = ref(null);

const toolbar = [
  [{ header: [2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
];

const onContentUpdated = () => {
  const body = editor.value?.getHTML();

  const regex = /(<([^>]+)>)/gi;
  const hasText = !!body.replace(regex, '').trim().length;

  const text = !hasText ? '' : body;

  emit('update:modelValue', text);
};

onMounted(() => {
  if (props.modelValue) {
    editor.value?.pasteHTML(props.modelValue, 'silent');
  }
});
</script>

<template>
  <QuillEditor
    ref="editor"
    class="html-editor bg-white"
    theme="snow"
    content-type="html"
    content=""
    :read-only="disabled"
    :style="{ color: error ? 'red' : '' }"
    :placeholder="placeholder"
    :class="{ [`h-${height}`]: height }"
    :toolbar="toolbar"
    @update:content="onContentUpdated"
  />
</template>
