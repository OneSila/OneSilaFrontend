<script setup lang="ts">
import {  computed } from 'vue';
import { generateProductAiContentMutation } from '../../../api/mutations/llm.js'
import { AiProcess } from "../ai-process";
import { useI18n } from "vue-i18n";

interface Props {
  productId: string | number;
  languageCode: string | null;
  contentAiGenerateType: string;
}

const { t } = useI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'generated', content: string): void;
}>();


const mutationVariables = computed(() => ({
  data: {
    id: props.productId,
    languageCode: props.languageCode,
    contentAiGenerateType: props.contentAiGenerateType,
  },
}));

const steps = computed(() => [
  t("shared.components.organisms.aiContentGenerator.step1"),
  t("shared.components.organisms.aiContentGenerator.step2"),
  t("shared.components.organisms.aiContentGenerator.step3"),
  t("shared.components.organisms.aiContentGenerator.step4"),
]);

</script>

<template>
  <AiProcess
    :variables="mutationVariables"
    :mutation="generateProductAiContentMutation"
    :steps="steps"
    mutationKey="generateProductAiContent"
    modal-title="shared.components.organisms.aiContentGenerator.title"
    successToastKey="shared.components.organisms.aiContentGenerator.success"
    @processed="content => emit('generated', content)"
  />
</template>