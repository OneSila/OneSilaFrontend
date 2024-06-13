<script lang="ts" setup>

import { GenerateDemoData } from "./containers/generate-demo-data";
import { AddCompany } from "./containers/add-company";
import { AddInvetoryLocation } from "./containers/add-inventory-location";
import { AddCurrency } from "./containers/add-currency";
import { AddVatRate } from "./containers/add-vat-rate";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Wizard } from "../../../shared/components/molecules/wizard";
import { OnboardingStatus } from "../../../shared/utils/constants";
import { getOnboardingStatus, injectAuth, refreshUser } from "../../../shared/modules/auth";
import apolloClient from "../../../../apollo-client";
import { goToStepMutation } from "../../../shared/api/mutations/auth.js";
import { useRouter } from "vue-router";

const { t } = useI18n();
const auth = injectAuth();
const router = useRouter();
const step = ref(0);
const wizardRef = ref();

const indexStepMapping = {
  0: OnboardingStatus.ADD_COMPANY,
  1: OnboardingStatus.ADD_CURRENCY,
  2: OnboardingStatus.CONFIRM_VAT_RATE,
  3: OnboardingStatus.GENERATE_DEMO_DATA,
  4: OnboardingStatus.DASHBOARD_CARDS_PRESENTATION,
}

const wizardSteps = [
  { title: t('dashboard.onboarding.addCompany.title'), name: OnboardingStatus.ADD_COMPANY },
  { title: t('dashboard.onboarding.addCurrency.title'), name: OnboardingStatus.ADD_CURRENCY },
  { title: t('dashboard.onboarding.confirmVatRate.title'), name: OnboardingStatus.CONFIRM_VAT_RATE },
  { title: t('dashboard.onboarding.generateDemoData.title'), name: OnboardingStatus.GENERATE_DEMO_DATA },
];

const updateStep = async (val) => {
  step.value = val;

  const {data} = await apolloClient.mutate({
    mutation: goToStepMutation,
    variables: {
      onboardingStatus: indexStepMapping[val]
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
  }
}

const triggerNextStep = () => {
  wizardRef.value.nextStep();
};

const setStep = () => {
  const status = getOnboardingStatus(auth);
  const stepIndex = wizardSteps.findIndex(step => step.name === status);
  if (wizardRef.value && stepIndex !== -1) {
    step.value = stepIndex;
    wizardRef.value.goToStep(stepIndex);
  }
};
const handleGoToNextStep = () => {
  triggerNextStep();
};


const onFinish = async () => {
  await updateStep(4);
  router.push({ name: 'dashboard' });
}

onMounted(setStep);

</script>

<template>
    <div>
    <Wizard ref="wizardRef" :show-buttons="false" :steps="wizardSteps" @update-current-step="updateStep">
      <template v-slot:ADD_COMPANY>
        <AddCompany @company-added="handleGoToNextStep" />
      </template>
      <template v-slot:ADD_CURRENCY>
        <AddCurrency @currency-added="handleGoToNextStep"/>
      </template>
      <template v-slot:CONFIRM_VAT_RATE>
        <AddVatRate @vat-rate-added="handleGoToNextStep" />
      </template>
      <template v-slot:GENERATE_DEMO_DATA>
        <GenerateDemoData @demo-data-step-done="onFinish" />
      </template>
    </Wizard>
    </div>
</template>