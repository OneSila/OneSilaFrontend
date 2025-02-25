<script setup lang="ts">
import {ref, onMounted, watch, computed} from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import apolloClient from "../../../../../../apollo-client";
import {PrimaryButton} from "../../../../../shared/components/atoms/button-primary";
import { OnboardingCardObject } from "./onboardingCard";

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{
  card: OnboardingCardObject;
  completedStatus: Record<string, boolean>;
}>();

const emit = defineEmits(['update-status']);

const isCompleted = ref(false);

const checkStatus = async () => {
  const { data } = await apolloClient.query({
    query: props.card.query,
    variables: props.card.variables || {}
  });

  const dataKey = Object.keys(data)[0];
  const isMembersKey = dataKey === 'users';

  if (isMembersKey) {
    if (data[dataKey].edges.length > 1) {
      isCompleted.value = true;
      emit('update-status', true);
    } else {
      emit('update-status', false);
    }
  } else {
    if (data && data[dataKey].edges.length > 0) {
      isCompleted.value = true;
      emit('update-status', true);
    } else {
      emit('update-status', false);
    }
  }
};

onMounted(() => {
  checkStatus();
});

const handleButtonClick = () => {
  router.push({name: props.card.path, query: props.card.pathQuery, params: props.card.pathParams });
};

watch(() => isCompleted.value, (newVal) => {
  if (newVal) {
    emit('update-status', true);
  }
});

const unmetDependencies = computed(() => {
  return props.card.dependencies?.filter(depKey => !props.completedStatus[depKey]) || [];
});

const isDisabled = computed(() => unmetDependencies.value.length > 0);


</script>

<template>
  <div :class="{'bg-green-100': isCompleted, 'bg-indigo-100': !isCompleted}" class="shadow rounded-lg p-4 flex flex-col items-center">
    <p class="my-4 text-center">{{ card.title }}</p>
    <div v-if="isCompleted" class="text-green-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div v-else>
      <PrimaryButton
        @click="handleButtonClick"
        :disabled="isDisabled"
        class="relative group"
      >
        {{ t('dashboard.onboarding.cards.button') }}

        <!-- Tooltip (Appears Only on Hover) -->
        <span
          v-if="isDisabled"
          class="invisible group-hover:visible absolute w-60 left-1/2 transform -translate-x-1/2 bg-gray-700 text-white text-xs px-3 py-2 rounded shadow-lg mt-8 text-left"
        >
          {{ t('dashboard.onboarding.cards.dependenciesNotMeetWarning') }}
          <br />
          <span v-for="dep in unmetDependencies" :key="dep">
            <br/>- {{ t(`dashboard.onboarding.cards.${dep}.title`) }}
          </span>
        </span>
      </PrimaryButton>
    </div>
  </div>
</template>
