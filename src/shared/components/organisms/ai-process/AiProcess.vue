<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Toast } from "../../../modules/toast";
import { processGraphQLErrors } from "../../../utils";
import { Icon } from "../../atoms/icon";
import { Button } from "../../atoms/button";

const props = withDefaults(
  defineProps<{
    variables: any;
    mutation: any;
    mutationKey: string;
    steps: string[];
    modalTitle: string;
    successToastKey?: string;
    btnClass?: string;
    label?: string;
    small?: boolean;
    beforeStart?: () => Promise<boolean> | boolean;
  }>(),
  {
    btnClass: 'btn-outline-primary',
    label: 'shared.button.generate',
    small: true,
  }
);

const emit = defineEmits<{
  (e: 'processed', result: string): void;
  (e: 'bullet-points-processed', points: any[]): void;
}>();

const { t } = useI18n();

const loading = ref(false);
const simulatedProgress = ref(0);

let progressInterval: ReturnType<typeof setInterval> | null = null;

const startSimulatedProgress = () => {
  loading.value = true;
  simulatedProgress.value = 0;
  progressInterval = setInterval(() => {
    if (simulatedProgress.value < props.steps.length) {
      simulatedProgress.value += 1;
    } else {
      clearInterval(progressInterval!);
      progressInterval = null;
    }
  }, 1000);
};

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval);
});

const onCompleted = (data: any) => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  loading.value = false;

  const result = data?.data?.[props.mutationKey]?.content;
  const bulletPointsResult = data?.data?.[props.mutationKey]?.bulletPoints;
  const points = data?.data?.[props.mutationKey]?.points;

  if (result) {
    emit("processed", result);
  }

  if (bulletPointsResult) {
    emit('bullet-points-processed', bulletPointsResult);
  }

  if (points && props.successToastKey) {
      Toast.success(
      t(props.successToastKey, { points: points })
    );
  }

  const errorMessages = data?.data?.[props.mutationKey]?.messages || [];
  for (const error of errorMessages) {
    Toast.error(error.message);
  }
};

const onError = (error: any) => {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  loading.value = false;

  const validationErrors = processGraphQLErrors(error, t);
  for (const key in validationErrors) {
    if (validationErrors.hasOwnProperty(key)) {
      Toast.error(validationErrors[key]);
    }
  }
};

const handleClick = async (mutate: Function) => {
  if (props.beforeStart) {
    const proceed = await props.beforeStart();
    if (proceed === false) {
      return;
    }
  }
  startSimulatedProgress();
  mutate();
};

</script>

<template>
  <ApolloMutation
    :mutation="props.mutation"
    :variables="props.variables"
    @done="onCompleted"
    @error="onError"
  >
    <template v-slot="{ mutate, loading: gqlLoading }">
      <div class="relative">
        <Button :class="`btn ${props.small ? 'btn-sm' : ''} ${props.btnClass}`" @click="() => handleClick(mutate)">
          <template v-if="gqlLoading">
            <span class="spinner" />
          </template>
          <template v-else>
            <Icon name="gem" size="lg" class="text-purple-600 mr-2"/>
            {{ t(props.label) }}
          </template>
        </Button>
      </div>

      <div v-if="loading">
        <div class="fixed inset-0 bg-black opacity-50 z-40"></div>
        <div class="fixed inset-0 flex items-center justify-center z-50">
          <div class="bg-gray-50 rounded-lg py-6 px-10 shadow-lg w-96">
            <h3 class="text-lg text-center font-bold mb-2">
              {{ t(props.modalTitle) }}
            </h3>
            <hr />
            <ul class="mt-2">
              <li
                v-for="(step, index) in props.steps"
                :key="index"
                class="flex items-center mb-1 py-2 px-4"
              >
                <template v-if="simulatedProgress > index">
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
