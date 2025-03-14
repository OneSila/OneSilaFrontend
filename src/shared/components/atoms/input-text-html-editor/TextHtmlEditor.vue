<script setup lang="ts">
import {onUnmounted, ref, watch, computed} from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import {useI18n} from "vue-i18n";
import {Icon} from "../icon";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  aiGenerating?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const { t } = useI18n();
const content = ref(props.modelValue || '');

const toolbarOptions = [
  [{ font: ['sans-serif', 'serif', 'monospace'] }],
  [{ header: [1, 2, 3, 4, 5, 6,  false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote'],
  ['clean']
];

watch(() => props.modelValue, (newVal) => {
  content.value = newVal || '';

});

watch(content, (newVal) => {
  emit('update:modelValue', newVal);
});

// Simulate AI progress (0 to 4 steps)
const simulatedAiProgress = ref(0);
let progressInterval: number | undefined = undefined;

watch(() => props.aiGenerating, (newVal) => {
  if (newVal) {
    simulatedAiProgress.value = 0;
    // Simulate progress increment every second.
    progressInterval = window.setInterval(() => {
      if (simulatedAiProgress.value < 4) {
        simulatedAiProgress.value += 1;
      }
    }, 1500);
  } else {
    simulatedAiProgress.value = 0;
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = undefined;
    }
  }
});

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
});


const steps = computed(() => [
  t("shared.components.molecules.textHtmlEditor.aiGenerator.step1"),
  t("shared.components.molecules.textHtmlEditor.aiGenerator.step2"),
  t("shared.components.molecules.textHtmlEditor.aiGenerator.step3"),
  t("shared.components.molecules.textHtmlEditor.aiGenerator.step4"),
]);

</script>

<template>
  <div class="relative">
    <QuillEditor
      v-model:content="content"
      contentType="html"
      theme="snow"
       :toolbar="toolbarOptions"
      :placeholder="placeholder || 'Type here...'"
      :read-only="disabled || aiGenerating"
      style="min-height: 250px;"
    />

    <div v-if="aiGenerating" class="absolute inset-0 flex items-center justify-start">
      <!-- Removed outer background -->
      <div class="bg-gray-50  rounded-lg py-6 px-10 shadow-lg">
        <h3 class="text-lg text-center font-bold mb-2">
          {{ t("shared.components.molecules.textHtmlEditor.aiGenerator.title") }}
        </h3>
        <hr>
        <ul class="mt-2">
          <li v-for="(step, index) in steps" :key="index" class="flex items-center mb-1 py-2 px-4">
            <template v-if="simulatedAiProgress > index">
              <Icon name="check-circle" class="text-green-600 w-5 h-5 mr-2" />
              <span class="text-green-600">{{ step }}</span>
            </template>
            <template v-else>
              <Icon name="circle" class="text-gray-400 w-5 h-5 mr-2" />
              <span class="text-gray-400">{{ step }}</span>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>

:deep(ol > li[data-list="bullet"]::before) {
  content: "• " !important;
  left: -1.5rem;
  color: inherit;
}

</style>