<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { generateProductAiBulletPointsMutation } from '../../../api/mutations/llm.js';
import { AiProcess } from "../ai-process";

interface Props {
  productId: string | number;
  languageCode: string | null;
  returnOne?: boolean;
  btnClass?: string;
  small?: boolean;
  iconClass?: string;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  returnOne: false,
  btnClass: 'btn-outline-primary',
  small: true,
  iconClass: 'text-purple-600',
  label: 'shared.button.generate',
});
const emit = defineEmits<{
  (e: 'generated', bulletPoints: any[]): void;
}>();

const { t } = useI18n();

const mutationVariables = computed(() => ({
  data: {
    id: props.productId,
    languageCode: props.languageCode,
    returnOne: props.returnOne,
  },
}));

const steps = computed(() => [
  t('shared.components.organisms.aiBulletPointsGenerator.step1'),
  t('shared.components.organisms.aiBulletPointsGenerator.step2'),
  t('shared.components.organisms.aiBulletPointsGenerator.step3'),
]);
</script>

<template>
  <AiProcess
    :variables="mutationVariables"
    :mutation="generateProductAiBulletPointsMutation"
    :steps="steps"
    mutationKey="generateProductBulletPointsAi"
    modal-title="shared.components.organisms.aiBulletPointsGenerator.title"
    successToastKey="shared.components.organisms.aiBulletPointsGenerator.success"
    :btn-class="props.btnClass"
    :small="props.small"
    :icon-class="props.iconClass"
    :label="props.label"
    @bullet-points-processed="points => emit('generated', points)"
  />
</template>
