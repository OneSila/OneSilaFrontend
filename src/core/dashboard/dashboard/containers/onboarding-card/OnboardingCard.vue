<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import apolloClient from "../../../../../../apollo-client";
import {PrimaryButton} from "../../../../../shared/components/atoms/button-primary";

export interface OnboardingCardObject {
  key: string;
  title: string;
  query: any;
  variables?: Record<string, any>;
  path: string;
}

const { t } = useI18n();
const router = useRouter();

const props = defineProps<{ card: OnboardingCardObject }>();

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
    if (data[dataKey].length > 1) {
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
  router.push({name: props.card.path});
};

watch(() => isCompleted.value, (newVal) => {
  if (newVal) {
    emit('update-status', true);
  }
});
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
      <PrimaryButton @click="handleButtonClick">
        {{ t('dashboard.onboarding.cards.button') }}
      </PrimaryButton>
    </div>
  </div>
</template>
