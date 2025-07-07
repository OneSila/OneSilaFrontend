<script setup lang="ts">

import {reactive, computed, ref, onMounted, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Wizard } from "../../../../shared/components/molecules/wizard";
import { Icon } from "../../../../shared/components/atoms/icon";
import { Modal } from "../../../../shared/components/atoms/modal";
import { MagentoInfoCard, WoocommerceInfoCard, ShopifyInfoCard } from "./containers/type-step/info-cards";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute, useRouter} from "vue-router";
import {
  IntegrationCreateWizardForm,
  IntegrationTypes,
  getMagentoDefaultFields,
  AuthenticationMethod,
  MagentoChannelInfo,
  ShopifyChannelInfo,
  AmazonChannelInfo,
  getDefaultFields,
  getShopifyDefaultFields,
  getAmazonDefaultFields
} from "../integrations";
import { TypeStep } from "./containers/type-step";
import { GeneralInfoStep } from "./containers/general-info-step";
import { SalesChannelStep } from "./containers/sales-channel-step";
import { MagentoChannelInfoStep } from "./containers/integration-specific-step/magento";
import { ShopifyChannelInfoStep } from "./containers/integration-specific-step/shopify";
import { AmazonChannelInfoStep } from "./containers/integration-specific-step/amazon";
import {
  createMagentoSalesChannelMutation,
  createShopifySalesChannelMutation,
  createAmazonSalesChannelMutation,
  getShopifyRedirectUrlMutation, getAmazonRedirectUrlMutation
} from "../../../../shared/api/mutations/salesChannels.js";
import { Toast } from "../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../shared/utils";
import apolloClient from "../../../../../apollo-client";
import { cleanShopHostname } from "../configs";
import { refreshSalesChannelWebsitesMutation } from "../../../../shared/api/mutations/salesChannels";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const selectedIntegrationType = ref<IntegrationTypes>(IntegrationTypes.None);


const wizardRef = ref();
const step = ref(0);
const loading = ref(false);
const queryParams = route.query;
const showInfoModal = ref(false);
const infoComponent = ref();

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
    importOrders: true,
  }
});
const specificChannelInfo = ref<ShopifyChannelInfo | MagentoChannelInfo | AmazonChannelInfo | {}>({});

watch(selectedIntegrationType, (newType) => {

  for (const key in specificChannelInfo.value) {
    delete specificChannelInfo.value[key];
  }

  if (newType === IntegrationTypes.Shopify) {
    Object.assign(specificChannelInfo.value, getShopifyDefaultFields());
  } else if (newType === IntegrationTypes.Magento) {
    Object.assign(specificChannelInfo.value, getMagentoDefaultFields());
  } else if (newType === IntegrationTypes.Amazon) {
    Object.assign(specificChannelInfo.value, getAmazonDefaultFields());
  } else {
    specificChannelInfo.value = {};
  }

});

const stepFourLabel = computed(() => {
  if (selectedIntegrationType.value === IntegrationTypes.Magento) {
    return t('integrations.create.wizard.step4.magento.title');
  }

  if (selectedIntegrationType.value === IntegrationTypes.Shopify) {
    return t('integrations.create.wizard.step4.shopify.title');
  }

  if (selectedIntegrationType.value === IntegrationTypes.Amazon) {
    return t('integrations.create.wizard.step4.amazon.title');
  }

  return t('integrations.create.wizard.step4.title');
});

const wizardSteps = computed(() => {
  const baseSteps = [
    { title: t('integrations.create.wizard.step1.title'), name: 'typeStep' },
    { title: t('integrations.create.wizard.step2.title'), name: 'generalInfoStep' },
    { title: t('integrations.create.wizard.step3.title'), name: 'salesChannelStep' },
    { title: stepFourLabel.value, name: 'specificChannelStep' },
  ];

  return baseSteps;
});


const updateStep = (val) => {
  step.value = val;
}

const openInfoModal = () => {
  if (selectedIntegrationType.value === IntegrationTypes.Magento) {
    infoComponent.value = MagentoInfoCard;
  } else if (selectedIntegrationType.value === IntegrationTypes.Shopify) {
    infoComponent.value = ShopifyInfoCard;
  } else if (selectedIntegrationType.value === IntegrationTypes.Woocommerce) {
    infoComponent.value = WoocommerceInfoCard;
  } else {
    infoComponent.value = null;
  }

  if (infoComponent.value) {
    showInfoModal.value = true;
  }
};

const closeInfoModal = () => {
  showInfoModal.value = false;
};

function isMagentoChannelInfo(value: any): value is MagentoChannelInfo {
  return value && typeof value.hostApiKey === 'string';
}

function isAmazonChannelInfo(value: any): value is AmazonChannelInfo {
  return (
    value &&
    typeof value.region === 'string' &&
    value.region.trim() !== '' &&
    typeof value.country === 'string' &&
    value.country.trim() !== ''
  );
}


const allowNextStep = computed(() => {

  const stepName = wizardSteps.value[step.value].name;

  if (stepName === 'typeStep' && selectedIntegrationType.value === IntegrationTypes.None) {
    return false;
  }

  if (stepName === 'generalInfoStep') {
    const hostname = form.generalInfo.hostname;
    if (!hostname || hostname.trim() === '') {
      return false;
    }
    if (selectedIntegrationType.value !== IntegrationTypes.Amazon) {
      // This regex checks for an optional protocol (http/https) and a basic hostname pattern.
      const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
      if (!urlPattern.test(hostname)) {
        return false;
      }
    }
  }

  if (
    stepName === 'specificChannelStep' &&
    selectedIntegrationType.value === IntegrationTypes.Magento &&
    isMagentoChannelInfo(specificChannelInfo.value)
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

  if (
  stepName === 'specificChannelStep' &&
  selectedIntegrationType.value === IntegrationTypes.Amazon &&
  !isAmazonChannelInfo(specificChannelInfo.value)
) {
  return false;
}


  return true;
});

const hasInfoCard = computed(() =>
  selectedIntegrationType.value === IntegrationTypes.Magento ||
  selectedIntegrationType.value === IntegrationTypes.Woocommerce ||
  selectedIntegrationType.value === IntegrationTypes.Shopify
);

const getIntegrationComponent = () => {
  if (selectedIntegrationType.value === IntegrationTypes.Magento) {
    return MagentoChannelInfoStep;
  }
  if (selectedIntegrationType.value === IntegrationTypes.Shopify) {
    return ShopifyChannelInfoStep;
  }
  if (selectedIntegrationType.value === IntegrationTypes.Amazon) {
    return AmazonChannelInfoStep;
  }
  return null;
};


const getIntegrationMutation = () => {
  switch (selectedIntegrationType.value) {
    case IntegrationTypes.Magento:
      return createMagentoSalesChannelMutation;
    case IntegrationTypes.Shopify:
      return createShopifySalesChannelMutation;
    case IntegrationTypes.Amazon:
      return createAmazonSalesChannelMutation;
    default:
      return null;
  }
}

const getIntegrationMutationKey = () => {
  switch (selectedIntegrationType.value) {
    case IntegrationTypes.Magento:
      return 'createMagentoSalesChannel';
    case IntegrationTypes.Shopify:
      return 'createShopifySalesChannel';
    case IntegrationTypes.Amazon:
      return 'createAmazonSalesChannel';
    default:
      return '';
  }
};


const handleFinish = async () => {
  loading.value = true;
  const mutationKey = getIntegrationMutationKey();

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

    if (
      selectedIntegrationType.value === IntegrationTypes.Shopify &&
      (specificChannelInfo.value as ShopifyChannelInfo)?.vendorProperty?.id == null
    ) {
      if ('vendorProperty' in specificChannelInfo.value) {
        delete (dataInput as any).vendorProperty;
      }
    }


    const { data, errors } = await apolloClient.mutate({
      mutation,
      variables: { data: dataInput },
    });

    if (data && data[mutationKey]) {
      Toast.success(t('integrations.create.success'));
      loading.value = false;
      handleSalesChannelSuccess(data[mutationKey], selectedIntegrationType.value);
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

const handleShopifySalesChannelSuccess = async (channelData: any) => {
  const id = channelData.id;

  /*
  const { data } = await apolloClient.mutate({
    mutation: getShopifyRedirectUrlMutation,
    variables: {
      data: { id },
    },
  });

  const result = data?.getShopifyRedirectUrl;

  if (result?.redirectUrl) {
    window.location.href = result.redirectUrl;
    return;
  }

  // If we have errors from OperationInfo
  const messages = result?.messages || [];
  messages.forEach((msg: any) => {
    Toast.error(msg.message);
  });
  */
  try {
    loading.value = true;
    await apolloClient.mutate({
      mutation: refreshSalesChannelWebsitesMutation,
      variables: {
        data: { id },
      },
    });
    Toast.success(t("integrations.show.pullData.success"));
  } catch (error) {
    Toast.error(t("integrations.show.pullData.error"));
    console.error("Pull data failed:", error);
  } finally {
    loading.value = false;
  }

  // Redirect to show page anyway
  router.push({
    name: 'integrations.integrations.show',
    params: { type: IntegrationTypes.Shopify, id },
  });
};

const handleAmazonSalesChannelSuccess = async (channelData: any) => {
  const id = channelData.id;

  const { data } = await apolloClient.mutate({
    mutation: getAmazonRedirectUrlMutation,
    variables: {
      data: { id },
    },
  });

  const result = data?.getAmazonRedirectUrl;

  if (result?.redirectUrl) {
    window.location.href = result.redirectUrl;
    return;
  }

  const messages = result?.messages || [];
  messages.forEach((msg: any) => {
    Toast.error(msg.message);
  });

  // Redirect to show page anyway
  router.push({
    name: 'integrations.integrations.show',
    params: { type: IntegrationTypes.Amazon, id },
  });
};



const handleSalesChannelSuccess = async (channelData: any, integrationType: string) => {
  if (integrationType === IntegrationTypes.Shopify) {
    await handleShopifySalesChannelSuccess(channelData);
    return;
  }

  if (integrationType === IntegrationTypes.Amazon) {
    await handleAmazonSalesChannelSuccess(channelData);
    return;
  }

  // Fallback: all other integrations
  router.push({ name: 'integrations.integrations.list' });
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
      <Modal v-if="showInfoModal" v-model="showInfoModal" @closed="showInfoModal = false">
        <component :is="infoComponent" @close="closeInfoModal" />
      </Modal>
      <Wizard ref="wizardRef" :steps="wizardSteps" :allow-next-step="allowNextStep" :show-buttons="true" @on-finish="handleFinish" @update-current-step="updateStep">

        <template #typeStep>
          <TypeStep :type="selectedIntegrationType" @update:type="val => selectedIntegrationType = val" />
        </template>

        <template #generalInfoStep>
          <GeneralInfoStep
              :general-info="form.generalInfo"
              :integration-type="selectedIntegrationType"
              :max-requests-per-minute="selectedIntegrationType === IntegrationTypes.Shopify ? 120 : undefined"
              :show-ssl="selectedIntegrationType !== IntegrationTypes.Shopify"
          />
        </template>

        <template #salesChannelStep>
          <SalesChannelStep :sales-channel-info="form.salesChannelInfo" />
        </template>

        <template #specificChannelStep>
          <component :is="getIntegrationComponent()" :channel-info="specificChannelInfo"/>
        </template>

        <template #additionalButtons>
          <Icon
            v-if="step > 0 && hasInfoCard"
            class="text-gray-500 cursor-pointer"
            @click.stop="openInfoModal"
            name="circle-info"
            size="lg"
          />
        </template>

      </Wizard>
   </template>
  </GeneralTemplate>
</template>