<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card } from "../../../../../shared/components/atoms/card";
import apolloClient from '../../../../../../apollo-client';
import { useI18n } from 'vue-i18n';
import {injectAuth, refreshUser, setAuthChangingState} from "../../../../../shared/modules/auth";
import ConfettiExplosion from "vue-confetti-explosion";
import { PrimaryButton } from "../../../../../shared/components/atoms/button-primary";
import { goToStepMutation } from "../../../../../shared/api/mutations/auth.js";
import { OnboardingStatus } from "../../../../../shared/utils/constants";

const { t } = useI18n();
const emit = defineEmits(['continue-clicked']);
const auth = injectAuth();

const finishOnboarding = async () => {

  const {data} = await apolloClient.mutate({
    mutation: goToStepMutation,
    variables: {
      onboardingStatus: OnboardingStatus.DONE
    },
  });

  if (data && data.goToStep) {
    const user = data.goToStep;
    refreshUser(auth, {
      username: user.username,
      language: user.language,
      firstName: user.firstName,
      lastName: user.lastName,
      onboardingStatus: user.onboardingStatus,
      company: user.multiTenantCompany,
      companyOwner: user.isMultiTenantCompanyOwner,
      active: user.isActive
    });
    setAuthChangingState(auth, false);
  }

}
const submit = () => {
  emit('continue-clicked');
};

onMounted(finishOnboarding);

</script>

<template>
  <div class="modal-container">
    <Card class="text-center p-10">
      <p class="text-xl text-center">🎉🎉🎉</p>
      <div class="confetti-container">
        <ConfettiExplosion :particleCount="200" :duration="5000" :force="0.9" :stageHeight="500" />
      </div>
      <h2 class="text-xl">{{ t('dashboard.onboarding.completedHeader') }}</h2>
      <p class="mt-4">{{ t('dashboard.onboarding.completedMessage') }}</p>
      <PrimaryButton class="mt-4" @click="submit">{{ t('dashboard.onboarding.startInnovatingButton') }}</PrimaryButton>
    </Card>
  </div>
</template>

<style scoped>
.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.card {
  width: 50%;
}

.confetti-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 30px;
  margin-bottom: 20px;
}
</style>