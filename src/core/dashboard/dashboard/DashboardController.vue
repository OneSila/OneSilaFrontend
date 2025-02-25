<script lang="ts" setup>

import { ref } from 'vue';
import { OnboardingCards } from "./containers/onboarding-cards";
import { getOnboardingStatus, injectAuth } from "../../../shared/modules/auth";
import { OnboardingStatus } from "../../../shared/utils/constants";
import { DashboardCards } from "./containers/dashboard-cards";

const auth = injectAuth();
const status = ref(getOnboardingStatus(auth));

const onUpdateStatus = () => {
  status.value = OnboardingStatus.DONE;
}

</script>

<template>
    <div>
      <OnboardingCards v-if="status === OnboardingStatus.COMPLETE_DASHBOARD_CARDS || status === OnboardingStatus.DASHBOARD_CARDS_PRESENTATION"
                       :status="status" class="my-4" @update-status="onUpdateStatus" />

      <DashboardCards />
    </div>
</template>