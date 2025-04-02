<script setup lang="ts">

import {reactive, computed, ref, onMounted, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Wizard } from "../../../../shared/components/molecules/wizard";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import {
  IntegrationCreateWizardForm,
  IntegrationTypes,
  getMagentoDefaultFields,
  AuthenticationMethod
} from "../integrations";
import { TypeStep } from "./containers/type-step";
import { GeneralInfoStep } from "./containers/general-info-step";
import { SalesChannelStep } from "./containers/sales-channel-step";
import { MagentoChannelInfoStep } from "./containers/integration-specific-step/magento";
import { createMagentoSalesChannelMutation } from "../../../../shared/api/mutations/salesChannels.js";
import { Toast } from "../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../shared/utils";
import apolloClient from "../../../../../apollo-client";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const selectedIntegrationType = ref<IntegrationTypes>(IntegrationTypes.Magento);


const wizardRef = ref();
const step = ref(0);
const loading = ref(false);

const form = reactive<IntegrationCreateWizardForm>({
  generalInfo: {
    hostname: '',
    active: true,
    verifySsl: true,
    requestsPerMinute: 60,
    maxRetries: 3,
  },
  salesChannelInfo: {
    useConfigurableName: false,
    syncContents: true,
    syncEanCodes: true,
    syncPrices: true,
  }
});
const specificChannelInfo = ref(getMagentoDefaultFields());

watch(selectedIntegrationType, (newType) => {
  if (newType === IntegrationTypes.Magento) {
    Object.assign(specificChannelInfo.value, getMagentoDefaultFields());
  } else if (newType === IntegrationTypes.Shopify) {
    Object.assign(specificChannelInfo.value, {});
  }
});

const stepFourLabel = computed(() => {
  if (selectedIntegrationType.value === IntegrationTypes.Magento) {
    return t('integrations.create.wizard.step4.magento.title');
  }
  return t('integrations.create.wizard.step4.title');
});

const wizardSteps = computed(() => [
  { title: t('integrations.create.wizard.step1.title'), name: 'typeStep' },
  { title: t('integrations.create.wizard.step2.title'), name: 'generalInfoStep' },
  { title: t('integrations.create.wizard.step3.title'), name: 'salesChannelStep' },
  { title: stepFourLabel.value, name: 'specificChannelStep' }
]);

const updateStep = (val) => {
  step.value = val;
}

const allowNextStep = computed(() => {

  const stepName = wizardSteps.value[step.value].name;

  if (stepName === 'typeStep' && selectedIntegrationType.value === null) {
    return false;
  }

  if (stepName === 'generalInfoStep') {
    const hostname = form.generalInfo.hostname;
    if (!hostname || hostname.trim() === '') {
      return false;
    }
    // This regex checks for an optional protocol (http/https) and a basic hostname pattern.
    const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
    if (!urlPattern.test(hostname)) {
      return false;
    }
  }

  if (
    stepName === 'specificChannelStep' &&
    selectedIntegrationType.value === IntegrationTypes.Magento
  ) {
    const key = specificChannelInfo.value.hostApiKey;
    if (!key || key.trim() === '') {
      return false;
    }
    // If authentication method is PASSWORD, hostApiUsername is also mandatory.
    if (specificChannelInfo.value.authenticationMethod === AuthenticationMethod.PASSWORD) {
      const username = specificChannelInfo.value.hostApiUsername;
      if (!username || username.trim() === '') {
        return false;
      }
    }
  }

  return true;
});

const getIntegrationComponent = () => {
  if (selectedIntegrationType.value === IntegrationTypes.Magento) {
    return MagentoChannelInfoStep;
  }
  // if (type === IntegrationTypes.Shopify) {
  //   return ShopifySpecificComponent;
  // }
  return null;
};


const getIntegrationMutation = () => {
  switch (selectedIntegrationType.value) {
    case IntegrationTypes.Magento:
      return createMagentoSalesChannelMutation;
      //   case IntegrationTypes.Shopify:
      //     return createShopifyMutation;
    default:
      return null;
  }
}

const handleFinish = async () => {
  loading.value = true;
  try {
    const mutation = getIntegrationMutation();
    if (!mutation) {
      return;
    }
    // Flatten the form fields into a single object
    const dataInput = {
      ...form.generalInfo,
      ...form.salesChannelInfo,
      ...specificChannelInfo.value,
    };

    const { data, errors } = await apolloClient.mutate({
      mutation,
      variables: { data: dataInput },
    });

    if (data && data.createMagentoSalesChannel) {
      Toast.success(t('integrations.create.success'));
      loading.value = false;
      router.push({ name: 'integrations.integrations.list'});
    }
  } catch (err) {
    loading.value = false;
    const graphqlError = err as { graphQLErrors: Array<{ message: string }> };
    if (graphqlError.graphQLErrors) {
      const validationErrors = processGraphQLErrors(graphqlError, t);
      for (const key in validationErrors) {
        if (validationErrors.hasOwnProperty(key)) {
          Toast.error(validationErrors[key]);
        }
      }
    }
  }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
        <Breadcrumbs :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.create' }, name: t('integrations.create.title') }
        ]" />
    </template>

   <template v-slot:content>

     <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div class="text-center">
          <svg class="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-xl font-semibold text-white mt-2">{{ t('shared.labels.loading') }}</p>
        </div>
      </div>
      <Wizard ref="wizardRef" :steps="wizardSteps" :allow-next-step="allowNextStep" :show-buttons="true" @on-finish="handleFinish" @update-current-step="updateStep">

        <template #typeStep>
          <TypeStep :type="selectedIntegrationType" />
        </template>

        <template #generalInfoStep>
          <GeneralInfoStep :general-info="form.generalInfo" />
        </template>

        <template #salesChannelStep>
          <SalesChannelStep :sales-channel-info="form.salesChannelInfo" />
        </template>

        <template #specificChannelStep>
          <component :is="getIntegrationComponent()" :channel-info="specificChannelInfo"/>
        </template>

      </Wizard>
   </template>
  </GeneralTemplate>
</template>