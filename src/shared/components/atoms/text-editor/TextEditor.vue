<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    modelValue?: any;
    transparent?: boolean;
    disabled?: boolean;
    autogrow?: boolean;
    error?: boolean;
    gutterX?: string;
    gutterY?: string;
    gutterless?: boolean;
    blurOnEnterKeypress?: boolean;
    scroll?: boolean;
  }>(),
  { gutterX: '3', gutterY: '2' },
);

const emit = defineEmits<{
  (e: 'update:modelValue', text: string): void;
  (e: 'blur'): void;
}>();

const editor: Ref<any> = ref(null);

const onInput = (value: string) => {
  emit('update:modelValue', value);

  growEditor(value);
};

const blur = () => {
  if (props.blurOnEnterKeypress) {
    editor.value?.blur();
  }
};

const decideNewLine = (event: Event) => {
  if (props.blurOnEnterKeypress) {
    event.preventDefault();
  }
};

const growEditor = (value: string) => {
  if (editor.value && props.autogrow) {
    editor.value.parentNode.dataset.replicatedValue = value;
  }
};

onMounted(() => {
  growEditor(props.modelValue);
});
</script>

<template>
  <div class="text-editor text-sm">
    <textarea
      ref="editor"
      rows="1"
      class="w-full h-auto focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-2 placeholder:italic placeholder:text-gray-400"
      :class="{
        'bg-transparent': transparent && !error,
        'border border-gray-300 rounded-md shadow-sm': !transparent && !error,
        'text-red-500': error,
        'border border-red-300 rounded-md shadow-sm': !transparent && error,
        'cursor-not-allowed': disabled,
        [`px-${gutterX}`]: gutterX && !gutterless,
        [`py-${gutterY}`]: gutterY && !gutterless,
      }"
      :style="{ 'overflow': scroll ? 'scroll' : 'hidden' }"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="disabled"
      @input="(event) => onInput((event.target as any).value)"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
      @keyup.enter="blur"
      @keydown.enter="decideNewLine"
      ></textarea
    >
  </div>
</template>

<style scoped>
.text-editor {
  display: grid;
}
.text-editor::after {
  content: attr(data-replicated-value) ' ';
  white-space: pre-wrap;
  visibility: hidden;
}
.text-editor > textarea {
  resize: none;
  overflow: hidden;
}
.text-editor > textarea,
.text-editor::after {
  font: inherit;
  grid-area: 1 / 1 / 2 / 2;
}
</style>
