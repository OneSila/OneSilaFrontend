<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { generateAiTranslationMutation } from '../../../api/mutations/llm.js';
import {AiProcess} from "../ai-process";

interface Props {
  toTranslate: string;
  fromLanguageCode: string;
  toLanguageCode: string;
  product?: any;
  productContentType?: string;
  salesChannelId?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'translated', translatedText: string): void;
}>();

const { t } = useI18n();

const mutationVariables = computed(() => {

  const data: any = {
    toTranslate: props.toTranslate,
    fromLanguageCode: props.fromLanguageCode,
    toLanguageCode: props.toLanguageCode,
  };

  if (props.product) {
    data.product = props.product;
  }
  if (props.productContentType) {
    data.productContentType = props.productContentType;
  }

  if (props.salesChannelId) {
    data.salesChannel = { id: props.salesChannelId };
  }

  return { data };
});


const steps = computed(() => [
  t("shared.components.organisms.aiContentTranslator.step1"),
  t("shared.components.organisms.aiContentTranslator.step2"),
  t("shared.components.organisms.aiContentTranslator.step3"),
]);


</script>

<template>
  <AiProcess
    :variables="mutationVariables"
    :mutation="generateAiTranslationMutation"
    :steps="steps"
    label="shared.button.translate"
    mutationKey="generateAiTranslation"
    modal-title="shared.components.organisms.aiContentTranslator.title"
    successToastKey="shared.components.organisms.aiContentTranslator.success"
    btn-class="btn-outline-success"
    @processed="text => emit('translated', text)"
  />
</template>
