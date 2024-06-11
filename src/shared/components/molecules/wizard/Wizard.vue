<script setup lang="ts">

import { ref, defineExpose } from 'vue';
import { Icon } from "../../atoms/icon";
import { useI18n } from "vue-i18n";
import { CancelButton } from "../../atoms/button-cancel";
import { PrimaryButton } from "../../atoms/button-primary";
import { Card } from "../../atoms/card";
import { useEnterKeyboardListener } from "../../../modules/keyboard";

interface Step {
  title: string;
  name: string;
}

const { t } = useI18n();
const props = withDefaults(
  defineProps<{
    steps: Step[]
    allowNextStep?: boolean
    addSkip?: boolean
    showButtons?: boolean
  }>(),
  { allowNextStep: true },
);


const emit = defineEmits(['onFinish', 'onNextStep', 'onBack', 'updateCurrentStep']);

const currentStep = ref(0);

const goToStep = (stepIndex) => {
  if (stepIndex >= 0 && stepIndex < props.steps.length) {
    currentStep.value = stepIndex;
    emit('updateCurrentStep', stepIndex);
  }
};
const nextStep = () => {
  if (!props.allowNextStep) {
    return;
  }
  const stepIndex = currentStep.value + 1;
  goToStep(stepIndex);
  emit(stepIndex === props.steps.length ? 'onFinish' : 'onNextStep');
};

const previousStep = () => {
  if (currentStep.value > 0) {
    const stepIndex = currentStep.value - 1;
    goToStep(stepIndex);
    emit('onBack');
  }
};

const jumpToStep = (index) => {
  if (index < currentStep.value) {
    goToStep(index);
  }
};

const stepClasses = (index) => ({
  'flex items-center px-6 py-4 text-sm font-semibold': true,
  'text-primary': index === currentStep.value,
  'text-gray-500 group-hover:text-gray-900': index > currentStep.value
});

const stepIconClasses = (index) => ({
  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full': true,
  'bg-primary': index < currentStep.value,
  'border-2': index >= currentStep.value,
  'border-primary': index === currentStep.value,
  'border-gray-300 group-hover:border-gray-400': index > currentStep.value
});

defineExpose({
  nextStep,
  goToStep
});

useEnterKeyboardListener(nextStep);

</script>

<template>
  <Card>
    <nav aria-label="Progress">
    <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
      <li v-for="(step, index) in steps" :key="step.title" class="relative md:flex md:flex-1" :class="{'cursor-pointer': index < currentStep}" @click="jumpToStep(index)">
        <span :class="stepClasses(index)">
            <span :class="stepIconClasses(index)">
              <Icon v-if="index < currentStep" name="check" class="h-6 w-6 text-white" aria-hidden="true" />
              <span v-else>0{{ index + 1 }}</span>
            </span>
            <span class="ml-4 text-sm font-semibold">{{ step.title }}</span>
        </span>
        <template v-if="index !== steps.length - 1">
          <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
            <svg class="h-full w-full text-gray-300" viewBox="0 0 22 80" fill="none" preserveAspectRatio="none">
              <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor" stroke-linejoin="round" />
            </svg>
          </div>
        </template>
      </li>
    </ol>
  </nav>
  <div class="tab-content mt-4">
    <slot :name="steps[currentStep].name"></slot>
  </div>
  <div v-if="showButtons" class="flex justify-end mt-8">
    <CancelButton
      v-if="addSkip"
      @click="goToStep(steps.length - 1)"
    >
      {{ t('shared.button.skip') }}
    </CancelButton>
    <CancelButton
      v-if="currentStep > 0"
      @click="previousStep"
    >
      {{ t('shared.button.back') }}
    </CancelButton>
    <PrimaryButton
      :disabled="!allowNextStep"
      @click="nextStep"
    >
      {{ currentStep === steps.length - 1 ? t('shared.button.finish') : t('shared.button.next') }}
    </PrimaryButton>
  </div>
  </Card>
</template>
