<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useI18n } from 'vue-i18n';
import { Icon } from '../icon';

type ToolbarItem = string | { header?: Array<number | boolean>; list?: string };
type ToolbarGroup = ToolbarItem[];
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const props = defineProps<{
  modelValue?: string | null;
  placeholder?: string;
  disabled?: boolean;
  aiGenerating?: boolean;
  toolbarOptions?: ToolbarGroup[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const { t } = useI18n();
const invalidHtml = ref(false);
const editorRevision = ref(0);

const headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

const defaultToolbarOptions: ToolbarGroup[] = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote'],
  ['clean'],
];

const finalToolbarOptions = computed(() => props.toolbarOptions || defaultToolbarOptions);

const normalizeEmptyHtml = (value?: string | null) => {
  const trimmed = (value || '').trim();

  if (!trimmed || trimmed === '<p><br></p>' || trimmed === '<p></p>' || trimmed === '<br>') {
    return '';
  }

  return trimmed;
};

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
  if (!value.trim()) {
    invalidHtml.value = false;
    return;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  const parsed = doc.body.innerHTML.trim();
  const normalizedInput = normalizeHtmlForComparison(value);
  invalidHtml.value = parsed !== normalizedInput;
};

const toolbarHasItem = (matcher: (item: ToolbarItem) => boolean, toolbar = finalToolbarOptions.value) =>
  toolbar.some((group) => group.some(matcher));

const toolbarHasControl = (control: string, toolbar = finalToolbarOptions.value) =>
  toolbarHasItem((item) => item === control, toolbar);

const toolbarHasList = (list: string, toolbar = finalToolbarOptions.value) =>
  toolbarHasItem((item) => typeof item === 'object' && item.list === list, toolbar);

const toolbarHasHeaders = (toolbar = finalToolbarOptions.value) =>
  toolbarHasItem((item) => typeof item === 'object' && Array.isArray(item.header), toolbar);

const initialToolbarOptions = finalToolbarOptions.value;
const initialHasBulletList = toolbarHasList('bullet', initialToolbarOptions);
const initialHasOrderedList = toolbarHasList('ordered', initialToolbarOptions);

const editor = useEditor({
  content: normalizeEmptyHtml(props.modelValue),
  editable: !(props.disabled || props.aiGenerating),
  extensions: [
    StarterKit.configure({
      blockquote: toolbarHasControl('blockquote', initialToolbarOptions) ? {} : false,
      bold: toolbarHasControl('bold', initialToolbarOptions) ? {} : false,
      bulletList: initialHasBulletList ? { keepMarks: true } : false,
      code: false,
      codeBlock: false,
      dropcursor: false,
      gapcursor: false,
      heading: toolbarHasHeaders(initialToolbarOptions) ? { levels: headingLevels } : false,
      horizontalRule: false,
      italic: toolbarHasControl('italic', initialToolbarOptions) ? {} : false,
      listItem: initialHasBulletList || initialHasOrderedList ? {} : false,
      orderedList: initialHasOrderedList ? { keepMarks: true } : false,
      strike: false,
    }),
    ...(toolbarHasControl('underline', initialToolbarOptions) ? [Underline] : []),
    Placeholder.configure({
      placeholder: () => props.placeholder || t('shared.components.atoms.textHtmlEditor.placeholder'),
    }),
  ],
  editorProps: {
    attributes: {
      class: 'min-h-[250px] max-h-[320px] overflow-auto rounded-b-md bg-white px-3 py-2 text-sm text-gray-700 outline-none dark:bg-[#121e32] dark:text-[#888ea8]',
    },
  },
  onUpdate: ({ editor }) => {
    const nextValue = editor.isEmpty ? '' : normalizeEmptyHtml(editor.getHTML());

    validateHtml(nextValue);
    editorRevision.value += 1;

    if (nextValue !== normalizeEmptyHtml(props.modelValue)) {
      emit('update:modelValue', nextValue);
    }
  },
  onSelectionUpdate: () => {
    editorRevision.value += 1;
  },
});

watch(
  () => props.modelValue,
  (newVal) => {
    const normalizedValue = normalizeEmptyHtml(newVal);

    validateHtml(normalizedValue);

    if (!editor.value || normalizedValue === normalizeEmptyHtml(editor.value.getHTML())) {
      return;
    }

    editor.value.commands.setContent(normalizedValue, false);
  },
  { immediate: true }
);

watch(
  () => props.disabled || props.aiGenerating,
  (readOnly) => {
    editor.value?.setEditable(!readOnly);
  }
);

const isActive = (name: string, attributes?: Record<string, unknown>) => {
  editorRevision.value;
  return !!editor.value?.isActive(name, attributes);
};

const currentBlock = computed(() => {
  editorRevision.value;

  const activeHeading = headingLevels.find((level) => editor.value?.isActive('heading', { level }));
  return activeHeading ? `heading-${activeHeading}` : 'paragraph';
});

const isEditorLocked = computed(() => props.disabled || props.aiGenerating);

const setBlock = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;

  if (!editor.value) {
    return;
  }

  if (value === 'paragraph') {
    editor.value.chain().focus().setParagraph().run();
    return;
  }

  const level = Number(value.replace('heading-', '')) as HeadingLevel;
  editor.value.chain().focus().setHeading({ level }).run();
};

const runCommand = (command: string) => {
  if (!editor.value) {
    return;
  }

  const chain = editor.value.chain().focus();

  if (command === 'bold') chain.toggleBold().run();
  if (command === 'italic') chain.toggleItalic().run();
  if (command === 'underline') chain.toggleUnderline().run();
  if (command === 'bulletList') chain.toggleBulletList().run();
  if (command === 'orderedList') chain.toggleOrderedList().run();
  if (command === 'blockquote') chain.toggleBlockquote().run();
  if (command === 'clean') chain.unsetAllMarks().clearNodes().run();
};
</script>

<template>
  <div v-bind="$attrs" class="text-html-editor">
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-1 rounded-t-md border border-[#e0e6ed] bg-white p-2 dark:border-[#17263c] dark:bg-[#121e32]"
    >
      <select
        v-if="toolbarHasHeaders()"
        class="form-select h-8 w-auto min-w-[112px] py-1 text-xs"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.heading')"
        :disabled="isEditorLocked"
        :value="currentBlock"
        @change="setBlock"
      >
        <option value="paragraph">{{ t('shared.components.atoms.textHtmlEditor.toolbar.normal') }}</option>
        <option v-for="level in headingLevels" :key="level" :value="`heading-${level}`">
          H{{ level }}
        </option>
      </select>

      <button
        v-if="toolbarHasControl('bold')"
        type="button"
        class="html-editor-toolbar-button font-bold"
        :class="{ 'html-editor-toolbar-button-active': isActive('bold') }"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.bold')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.bold')"
        :disabled="isEditorLocked"
        @click="runCommand('bold')"
      >
        <Icon name="bold" size="sm" />
      </button>
      <button
        v-if="toolbarHasControl('italic')"
        type="button"
        class="html-editor-toolbar-button italic"
        :class="{ 'html-editor-toolbar-button-active': isActive('italic') }"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.italic')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.italic')"
        :disabled="isEditorLocked"
        @click="runCommand('italic')"
      >
        <Icon name="italic" size="sm" />
      </button>
      <button
        v-if="toolbarHasControl('underline')"
        type="button"
        class="html-editor-toolbar-button underline"
        :class="{ 'html-editor-toolbar-button-active': isActive('underline') }"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.underline')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.underline')"
        :disabled="isEditorLocked"
        @click="runCommand('underline')"
      >
        <Icon name="underline" size="sm" />
      </button>
      <button
        v-if="toolbarHasList('ordered')"
        type="button"
        class="html-editor-toolbar-button"
        :class="{ 'html-editor-toolbar-button-active': isActive('orderedList') }"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.orderedList')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.orderedList')"
        :disabled="isEditorLocked"
        @click="runCommand('orderedList')"
      >
        <Icon name="list-ol" size="sm" />
      </button>
      <button
        v-if="toolbarHasList('bullet')"
        type="button"
        class="html-editor-toolbar-button"
        :class="{ 'html-editor-toolbar-button-active': isActive('bulletList') }"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.bulletList')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.bulletList')"
        :disabled="isEditorLocked"
        @click="runCommand('bulletList')"
      >
        <Icon name="list-ul" size="sm" />
      </button>
      <button
        v-if="toolbarHasControl('blockquote')"
        type="button"
        class="html-editor-toolbar-button"
        :class="{ 'html-editor-toolbar-button-active': isActive('blockquote') }"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.blockquote')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.blockquote')"
        :disabled="isEditorLocked"
        @click="runCommand('blockquote')"
      >
        <Icon name="quote-left" size="sm" />
      </button>
      <button
        v-if="toolbarHasControl('clean')"
        type="button"
        class="html-editor-toolbar-button"
        :title="t('shared.components.atoms.textHtmlEditor.toolbar.clean')"
        :aria-label="t('shared.components.atoms.textHtmlEditor.toolbar.clean')"
        :disabled="isEditorLocked"
        @click="runCommand('clean')"
      >
        <Icon name="remove-format" size="sm" />
      </button>
    </div>

    <EditorContent
      v-if="editor"
      :editor="editor"
      class="rounded-b-md border border-t-0 border-[#e0e6ed] dark:border-[#17263c]"
    />
    <p v-if="invalidHtml" class="mt-2 text-sm text-red-600">
      {{ t('shared.components.atoms.textHtmlEditor.invalidHtml') }}
    </p>
  </div>
</template>

<style scoped>
.html-editor-toolbar-button {
  @apply h-8 min-w-8 rounded border border-[#e0e6ed] bg-white px-2 text-xs leading-8 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#17263c] dark:bg-[#121e32] dark:text-[#888ea8] dark:hover:bg-[#1b2e4b];
}

.html-editor-toolbar-button-active {
  @apply border-primary bg-primary text-white hover:bg-primary dark:border-primary dark:bg-primary dark:text-white dark:hover:bg-primary;
}

.text-html-editor :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  @apply pointer-events-none float-left h-0 text-gray-400;
  content: attr(data-placeholder);
}

.text-html-editor :deep(.ProseMirror ul) {
  @apply ml-6 list-disc;
}

.text-html-editor :deep(.ProseMirror ol) {
  @apply ml-6 list-decimal;
}

.text-html-editor :deep(.ProseMirror blockquote) {
  @apply border-l-4 border-[#e0e6ed] pl-3 italic dark:border-[#17263c];
}

.text-html-editor :deep(.ProseMirror h1) {
  @apply text-2xl font-bold;
}

.text-html-editor :deep(.ProseMirror h2) {
  @apply text-xl font-bold;
}

.text-html-editor :deep(.ProseMirror h3) {
  @apply text-lg font-bold;
}

.text-html-editor :deep(.ProseMirror h4),
.text-html-editor :deep(.ProseMirror h5),
.text-html-editor :deep(.ProseMirror h6) {
  @apply font-bold;
}
</style>
