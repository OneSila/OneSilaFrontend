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
  beforeStart?: () => Promise<boolean> | boolean;
  btnClass?: string;
  small?: boolean;
  iconClass?: string;
  label?: string;
  returnOneBulletPoint?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  btnClass: 'btn-outline-success',
  small: true,
  iconClass: 'text-purple-600',
  label: 'shared.button.translate',
  returnOneBulletPoint: false,
});
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

  if (props.returnOneBulletPoint) {
    data.returnOneBulletPoint = props.returnOneBulletPoint;
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
    :label="props.label"
    mutationKey="generateAiTranslation"
    modal-title="shared.components.organisms.aiContentTranslator.title"
    successToastKey="shared.components.organisms.aiContentTranslator.success"
    :btn-class="props.btnClass"
    :small="props.small"
    :icon-class="props.iconClass"
    :before-start="props.beforeStart"
    @processed="text => emit('translated', text)"
  />
</template>
