<script setup lang="ts">
import {  computed } from 'vue';
import { generateProductAiContentMutation } from '../../../api/mutations/llm.js'
import { AiProcess } from "../ai-process";
import { useI18n } from "vue-i18n";

interface Props {
  productId: string | number;
  languageCode: string | null;
  contentAiGenerateType: string;
  salesChannelType?: string;
  btnClass?: string;
  small?: boolean;
  iconClass?: string;
  label?: string;
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  btnClass: 'btn-outline-primary',
  small: true,
  iconClass: 'text-purple-600',
  label: 'shared.button.generate',
});
const emit = defineEmits<{
  (e: 'generated', content: string): void;
}>();


const mutationVariables = computed(() => {
  const data: Record<string, any> = {
    id: props.productId,
    languageCode: props.languageCode,
    contentAiGenerateType: props.contentAiGenerateType,
  };
  if (props.salesChannelType && props.salesChannelType !== 'default') {
    data.salesChannelType = props.salesChannelType.toUpperCase();
  }
  return { data };
});

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
    :btn-class="props.btnClass"
    :small="props.small"
    :icon-class="props.iconClass"
    :label="props.label"
    @processed="content => emit('generated', content)"
  />
</template>