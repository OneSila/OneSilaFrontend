<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { generateProductAiContentMutation } from '../../../api/mutations/llm.js'
import {processGraphQLErrors} from "../../../utils";
import {Toast} from "../../../modules/toast";
import { Icon } from "../../atoms/icon";
import { Button } from "../../atoms/button";

interface Props {
  productId: string | number;
  languageCode: string | null;
  contentAiGenerateType: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'generated', content: string): void;
}>();

const { t } = useI18n();

const mutationVariables = computed(() => ({
  data: {
    id: props.productId,
    languageCode: props.languageCode,
    contentAiGenerateType: props.contentAiGenerateType,
  },
}));

const aiGenerating = ref(false);
const simulatedAiProgress = ref(0);

const steps = computed(() => [
  t("shared.components.organisms.aiContentGenerator.step1"),
  t("shared.components.organisms.aiContentGenerator.step2"),
  t("shared.components.organisms.aiContentGenerator.step3"),
  t("shared.components.organisms.aiContentGenerator.step4"),
]);

let progressInterval: ReturnType<typeof setInterval> | null = null;

const startSimulatedProgress = () => {
  aiGenerating.value = true;
  simulatedAiProgress.value = 0;
  progressInterval = setInterval(() => {
    if (simulatedAiProgress.value < steps.value.length) {
      simulatedAiProgress.value += 1;
    } else {
      clearInterval(progressInterval!);
      progressInterval = null;
    }
  }, 1000);
};

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
});

const onContentGenerated = (data: any) => {

  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }

  aiGenerating.value = false;
  const content = data?.data?.generateProductAiContent?.content;
  if (content) {
    emit("generated", content);
  }

  const points = data?.data?.generateProductAiContent?.points;
  if (points) {
    Toast.success(
      t('shared.components.organisms.aiContentGenerator.success', { points: data.data.generateProductAiContent.points })
    );
  }

  const errorMessages = data?.data?.generateProductAiContent?.messages || [];
  for (const error of errorMessages) {
    Toast.error(error.message);
  }

};


const onGenerateError = (error) => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  aiGenerating.value = false;

  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
  }
};

const handleClick = (mutate: Function) => {
  startSimulatedProgress();
  mutate();
};

</script>

<template>
  <ApolloMutation
    :mutation="generateProductAiContentMutation"
    :variables="mutationVariables"
    @done="onContentGenerated"
    @error="onGenerateError"
  >
    <template v-slot="{ mutate, loading }">
      <div class="relative">
        <Button class="btn btn-sm btn-outline-primary" @click="() => handleClick(mutate)">
          <template v-if="loading">
            <span class="spinner" />
          </template>
          <template v-else>
            {{ t('shared.button.generate') }}
          </template>
        </Button>
      </div>

      <div v-if="aiGenerating">
        <div class="fixed inset-0 bg-black opacity-50 z-40"></div>
        <div class="fixed inset-0 flex items-center justify-center z-50">
          <div class="bg-gray-50 rounded-lg py-6 px-10 shadow-lg w-96">
            <h3 class="text-lg text-center font-bold mb-2">
              {{ t("shared.components.organisms.aiContentGenerator.title") }}
            </h3>
            <hr />
            <ul class="mt-2">
              <li
                v-for="(step, index) in steps"
                :key="index"
                class="flex items-center mb-1 py-2 px-4"
              >
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
  </ApolloMutation>
</template>


<style scoped>

.spinner {
  width: 15px;
  height: 15px;
  border: 2px solid #1F2937;
  border-top: 2px solid #4343d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

</style>