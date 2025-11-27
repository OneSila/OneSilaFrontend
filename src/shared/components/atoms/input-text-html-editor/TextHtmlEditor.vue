<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { QuillEditor, Quill } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { useI18n } from 'vue-i18n';

const Block: any = Quill.import('blots/block');

class DivWrapperBlot extends Block {
  static blotName = 'divWrapper';
  static tagName = 'DIV';

  static create(value: Record<string, string> | string | null) {
    const node = super.create() as HTMLElement;

    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, attrValue]) => {
        node.setAttribute(key, attrValue);
      });
    }

    return node;
  }

  static formats(node: HTMLElement) {
    if (!node.hasAttributes()) {
      return null;
    }

    return Array.from(node.attributes).reduce<Record<string, string>>((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {});
  }

  format(name: string, value: unknown) {
    const node = this.domNode as HTMLElement;

    if (name === DivWrapperBlot.blotName) {
      if (!value) {
        Array.from(node.attributes).forEach((attr) => {
          node.removeAttribute(attr.name);
        });
      } else if (typeof value === 'object' && value !== null) {
        Array.from(node.attributes).forEach((attr) => {
          node.removeAttribute(attr.name);
        });

        Object.entries(value as Record<string, string>).forEach(([key, attrValue]) => {
          node.setAttribute(key, attrValue);
        });
      }
    } else {
      super.format(name, value);
    }
  }
}

Quill.register(DivWrapperBlot, true);

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
    'divWrapper',
  ],
}));


const normalizeHtmlForComparison = (value: string) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  return trimmedValue
    .replace(/\r\n/g, '\n')
    .replace(/(\s*)([^\s=]+)=('([^']*)')/g, (_, whitespace, attrName, __, attrValue) => {
      const escapedValue = attrValue.replace(/"/g, '&quot;');
      return `${whitespace}${attrName}="${escapedValue}"`;
    });
};

const validateHtml = (value: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  const parsed = doc.body.innerHTML.trim();
  const normalizedInput = normalizeHtmlForComparison(value);
  invalidHtml.value = parsed !== normalizedInput;
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
      :placeholder="placeholder || t('shared.components.atoms.textHtmlEditor.placeholder')"
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
