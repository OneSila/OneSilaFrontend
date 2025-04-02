<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { detectRemoteValidPropertiesMutation } from '../../../api/mutations/llm.js';
import { AiProcess } from "../ai-process";

interface Props {
  salesChannelId: string | number;
}

const { t } = useI18n();

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'detected', properties: string): void;
}>();

const mutationVariables = computed(() => ({
  data: {
    id: props.salesChannelId,
  },
}));

const steps = computed(() => [
  t("shared.components.organisms.remotePropertiesDetector.step1"),
  t("shared.components.organisms.remotePropertiesDetector.step2"),
  t("shared.components.organisms.remotePropertiesDetector.step3"),
]);
</script>

<template>
  <AiProcess
    :variables="mutationVariables"
    :mutation="detectRemoteValidPropertiesMutation"
    :steps="steps"
    :small="false"
    :label="'shared.components.organisms.remotePropertiesDetector.button'"
    mutationKey="detectRemoteValidProperties"
    modal-title="shared.components.organisms.remotePropertiesDetector.title"
    successToastKey="shared.components.organisms.remotePropertiesDetector.success"
    btn-class="btn-outline-warning"
    @processed="props => emit('detected', props)"
  />
</template>
