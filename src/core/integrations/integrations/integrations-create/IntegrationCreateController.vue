<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Wizard } from '../../../../shared/components/molecules/wizard';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Modal } from '../../../../shared/components/atoms/modal';
import { MagentoInfoCard, ShopifyInfoCard, WebhookInfoCard, WoocommerceInfoCard } from './containers/type-step/info-cards';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import {
  AuthenticationMethod,
  AmazonChannelInfo,
  EbayChannelInfo,
  getAmazonDefaultFields,
  getMagentoDefaultFields,
  getMiraklDefaultFields,
  getShopifyDefaultFields,
  getWebhookDefaultFields,
  getWoocommerceDefaultFields,
  IntegrationCreateWizardForm,
  IntegrationTypes,
  MagentoChannelInfo,
  MiraklChannelInfo,
  ShopifyChannelInfo,
  WebhookChannelInfo,
  WoocommerceChannelInfo,
} from '../integrations';
import { TypeStep } from './containers/type-step';
import { GeneralInfoStep } from './containers/general-info-step';
import { SalesChannelStep } from './containers/sales-channel-step';
import { MagentoChannelInfoStep } from './containers/integration-specific-step/magento';
import { ShopifyChannelInfoStep } from './containers/integration-specific-step/shopify';
import { WoocommerceChannelInfoStep } from './containers/integration-specific-step/woocommerce';
import { AmazonChannelInfoStep } from './containers/integration-specific-step/amazon';
import { WebhookChannelInfoStep } from './containers/integration-specific-step/webhook';
import { MiraklChannelInfoStep } from './containers/integration-specific-step/mirakl';
import {
  createAmazonSalesChannelMutation,
  createEbaySalesChannelMutation,
  createMagentoSalesChannelMutation,
  createManualSalesChannelMutation,
  createMiraklSalesChannelMutation,
  createSheinSalesChannelMutation,
  createShopifySalesChannelMutation,
  createWoocommerceSalesChannelMutation,
  getAmazonRedirectUrlMutation,
  getEbayRedirectUrlMutation,
  getShopifyRedirectUrlMutation,
  getSheinRedirectUrlMutation,
} from '../../../../shared/api/mutations/salesChannels.js';
import { createWebhookIntegrationMutation } from '../../../../shared/api/mutations/webhookIntegrations.js';
import { Toast } from '../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../shared/utils';
import apolloClient from '../../../../../apollo-client';

const { t } = useI18n();
const router = useRouter();
const DEFAULT_MIRAKL_SUB_TYPE = IntegrationTypes.Mirakl;

interface SelectedIntegrationDefinition {
  key: string;
  type: string;
  subtype: string | null;
  name: string;
}

const selectedIntegrationChoice = ref<string>(IntegrationTypes.None);
const selectedIntegrationDefinition = ref<SelectedIntegrationDefinition | null>(null);
const wizardRef = ref();
const step = ref(0);
const loading = ref(false);
const showInfoModal = ref(false);
const infoComponent = ref();

const resolvedIntegrationType = computed<IntegrationTypes>(() => {
  if (selectedIntegrationDefinition.value?.type) {
    return selectedIntegrationDefinition.value.type as IntegrationTypes;
  }

  return selectedIntegrationChoice.value as IntegrationTypes;
});

const selectedMiraklSubType = computed(() => {
  if (resolvedIntegrationType.value !== IntegrationTypes.Mirakl) {
    return null;
  }

  return selectedIntegrationDefinition.value?.subtype || DEFAULT_MIRAKL_SUB_TYPE;
});

const selectedIntegrationDisplayName = computed(() => {
  if (selectedIntegrationDefinition.value?.name) {
    return selectedIntegrationDefinition.value.name;
  }

  switch (resolvedIntegrationType.value) {
    case IntegrationTypes.Magento:
      return t('integrations.create.wizard.step1.magentoTitle');
    case IntegrationTypes.Shopify:
      return t('integrations.create.wizard.step1.shopifyTitle');
    case IntegrationTypes.Woocommerce:
      return t('integrations.create.wizard.step1.woocommerceTitle');
    case IntegrationTypes.Amazon:
      return t('integrations.create.wizard.step1.amazonTitle');
    case IntegrationTypes.Ebay:
      return t('integrations.create.wizard.step1.ebayTitle');
    case IntegrationTypes.Shein:
      return t('integrations.create.wizard.step1.sheinTitle');
    case IntegrationTypes.Webhook:
      return t('integrations.create.wizard.step1.webhookTitle');
    default:
      return t('integrations.create.wizard.step4.title');
  }
});

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
    startingStock: null,
  }
});

const specificChannelInfo = ref<ShopifyChannelInfo | MagentoChannelInfo | WoocommerceChannelInfo | AmazonChannelInfo | WebhookChannelInfo | EbayChannelInfo | MiraklChannelInfo | {}>({});

watch(resolvedIntegrationType, (newType) => {
  for (const key in specificChannelInfo.value) {
    delete specificChannelInfo.value[key];
  }

  if (newType === IntegrationTypes.Shopify) {
    Object.assign(specificChannelInfo.value, getShopifyDefaultFields());
  } else if (newType === IntegrationTypes.Magento) {
    Object.assign(specificChannelInfo.value, getMagentoDefaultFields());
  } else if (newType === IntegrationTypes.Woocommerce) {
    Object.assign(specificChannelInfo.value, getWoocommerceDefaultFields());
  } else if (newType === IntegrationTypes.Amazon) {
    Object.assign(specificChannelInfo.value, getAmazonDefaultFields());
  } else if (newType === IntegrationTypes.Mirakl) {
    Object.assign(specificChannelInfo.value, getMiraklDefaultFields());
  } else if (newType === IntegrationTypes.Webhook) {
    Object.assign(specificChannelInfo.value, getWebhookDefaultFields());
  } else if (newType === IntegrationTypes.Ebay || newType === IntegrationTypes.Shein) {
    specificChannelInfo.value = {};
  } else {
    specificChannelInfo.value = {};
  }
}, { immediate: true });

watch(selectedMiraklSubType, (newSubType) => {
  if (resolvedIntegrationType.value === IntegrationTypes.Mirakl && newSubType) {
    (specificChannelInfo.value as MiraklChannelInfo).subType = newSubType;
  }
}, { immediate: true });

const stepFourLabel = computed(() => {
  if (resolvedIntegrationType.value === IntegrationTypes.Magento) {
    return t('integrations.create.wizard.step4.magento.title');
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Shopify) {
    return t('integrations.create.wizard.step4.shopify.title');
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Woocommerce) {
    return t('integrations.create.wizard.step4.woocommerce.title');
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Amazon) {
    return t('integrations.create.wizard.step4.amazon.title');
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Webhook) {
    return t('integrations.create.wizard.step4.webhook.title');
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Mirakl) {
    return t('integrations.create.wizard.step4.marketplace.title', { marketplace: selectedIntegrationDisplayName.value });
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Ebay) {
    return t('integrations.create.wizard.step4.ebay.title');
  }

  if (resolvedIntegrationType.value === IntegrationTypes.Shein) {
    return t('integrations.create.wizard.step4.shein.title');
  }

  return t('integrations.create.wizard.step4.title');
});

const wizardSteps = computed(() => {
  const steps = [
    { title: t('integrations.create.wizard.step1.title'), name: 'typeStep' },
    { title: t('integrations.create.wizard.step2.title'), name: 'generalInfoStep' },
  ];

  if (
    resolvedIntegrationType.value !== IntegrationTypes.Webhook &&
    resolvedIntegrationType.value !== IntegrationTypes.Manual
  ) {
    steps.push({ title: t('integrations.create.wizard.step3.title'), name: 'salesChannelStep' });
  }

  if (
    resolvedIntegrationType.value !== IntegrationTypes.Ebay &&
    resolvedIntegrationType.value !== IntegrationTypes.Shein &&
    resolvedIntegrationType.value !== IntegrationTypes.Manual
  ) {
    steps.push({ title: stepFourLabel.value, name: 'specificChannelStep' });
  }

  return steps;
});

const updateStep = (val) => {
  step.value = val;
};

const openInfoModal = () => {
  if (resolvedIntegrationType.value === IntegrationTypes.Magento) {
    infoComponent.value = MagentoInfoCard;
  } else if (resolvedIntegrationType.value === IntegrationTypes.Shopify) {
    infoComponent.value = ShopifyInfoCard;
  } else if (resolvedIntegrationType.value === IntegrationTypes.Woocommerce) {
    infoComponent.value = WoocommerceInfoCard;
  } else if (resolvedIntegrationType.value === IntegrationTypes.Webhook) {
    infoComponent.value = WebhookInfoCard;
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

function isWoocommerceChannelInfo(value: any): value is WoocommerceChannelInfo {
  return value && typeof value.apiKey === 'string' && typeof value.apiSecret === 'string';
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

function isMiraklChannelInfo(value: any): value is MiraklChannelInfo {
  return value && (typeof value.shopId === 'number' || value.shopId === null) && typeof value.apiKey === 'string';
}

const allowNextStep = computed(() => {
  const stepName = wizardSteps.value[step.value]?.name;

  if (stepName === 'typeStep' && selectedIntegrationChoice.value === IntegrationTypes.None) {
    return false;
  }

  if (stepName === 'generalInfoStep') {
    const hostname = form.generalInfo.hostname;
    if (!hostname || hostname.trim() === '') {
      return false;
    }

    const excludedTypes = [IntegrationTypes.Amazon, IntegrationTypes.Webhook, IntegrationTypes.Ebay, IntegrationTypes.Shein, IntegrationTypes.Manual];
    if (!excludedTypes.includes(resolvedIntegrationType.value)) {
      const urlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-./?%&=]*)?$/;
      if (!urlPattern.test(hostname)) {
        return false;
      }
    }
  }

  if (
    stepName === 'specificChannelStep' &&
    resolvedIntegrationType.value === IntegrationTypes.Magento &&
    isMagentoChannelInfo(specificChannelInfo.value)
  ) {
    const key = specificChannelInfo.value.hostApiKey;
    if (!key || key.trim() === '') {
      return false;
    }

    if (specificChannelInfo.value.authenticationMethod === AuthenticationMethod.PASSWORD) {
      const username = specificChannelInfo.value.hostApiUsername;
      if (!username || username.trim() === '') {
        return false;
      }
    }
  }

  if (
    stepName === 'specificChannelStep' &&
    resolvedIntegrationType.value === IntegrationTypes.Woocommerce &&
    isWoocommerceChannelInfo(specificChannelInfo.value)
  ) {
    const key = specificChannelInfo.value.apiKey;
    const secret = specificChannelInfo.value.apiSecret;
    if (!key || key.trim() === '' || !secret || secret.trim() === '') {
      return false;
    }
  }

  if (
    stepName === 'specificChannelStep' &&
    resolvedIntegrationType.value === IntegrationTypes.Amazon &&
    !isAmazonChannelInfo(specificChannelInfo.value)
  ) {
    return false;
  }

  if (
    stepName === 'specificChannelStep' &&
    resolvedIntegrationType.value === IntegrationTypes.Mirakl &&
    isMiraklChannelInfo(specificChannelInfo.value)
  ) {
    const shopId = specificChannelInfo.value.shopId;
    const apiKey = specificChannelInfo.value.apiKey;
    if (shopId === null || Number.isNaN(shopId) || !apiKey || apiKey.trim() === '') {
      return false;
    }
  }

  if (stepName === 'specificChannelStep' && resolvedIntegrationType.value === IntegrationTypes.Webhook) {
    const info = specificChannelInfo.value as WebhookChannelInfo;
    if (!info.url || info.url.trim() === '' || !info.topic || info.topic.trim() === '') {
      return false;
    }
  }

  return true;
});

const hasInfoCard = computed(() =>
  resolvedIntegrationType.value === IntegrationTypes.Magento ||
  resolvedIntegrationType.value === IntegrationTypes.Woocommerce ||
  resolvedIntegrationType.value === IntegrationTypes.Shopify ||
  resolvedIntegrationType.value === IntegrationTypes.Webhook
);

const getIntegrationComponent = () => {
  if (resolvedIntegrationType.value === IntegrationTypes.Magento) {
    return MagentoChannelInfoStep;
  }
  if (resolvedIntegrationType.value === IntegrationTypes.Shopify) {
    return ShopifyChannelInfoStep;
  }
  if (resolvedIntegrationType.value === IntegrationTypes.Woocommerce) {
    return WoocommerceChannelInfoStep;
  }
  if (resolvedIntegrationType.value === IntegrationTypes.Amazon) {
    return AmazonChannelInfoStep;
  }
  if (resolvedIntegrationType.value === IntegrationTypes.Mirakl) {
    return MiraklChannelInfoStep;
  }
  if (resolvedIntegrationType.value === IntegrationTypes.Webhook) {
    return WebhookChannelInfoStep;
  }
  return null;
};

const getIntegrationMutation = () => {
  switch (resolvedIntegrationType.value) {
    case IntegrationTypes.Magento:
      return createMagentoSalesChannelMutation;
    case IntegrationTypes.Shopify:
      return createShopifySalesChannelMutation;
    case IntegrationTypes.Woocommerce:
      return createWoocommerceSalesChannelMutation;
    case IntegrationTypes.Amazon:
      return createAmazonSalesChannelMutation;
    case IntegrationTypes.Mirakl:
      return createMiraklSalesChannelMutation;
    case IntegrationTypes.Manual:
      return createManualSalesChannelMutation;
    case IntegrationTypes.Webhook:
      return createWebhookIntegrationMutation;
    case IntegrationTypes.Ebay:
      return createEbaySalesChannelMutation;
    case IntegrationTypes.Shein:
      return createSheinSalesChannelMutation;
    default:
      return null;
  }
};

const getIntegrationMutationKey = () => {
  switch (resolvedIntegrationType.value) {
    case IntegrationTypes.Magento:
      return 'createMagentoSalesChannel';
    case IntegrationTypes.Shopify:
      return 'createShopifySalesChannel';
    case IntegrationTypes.Woocommerce:
      return 'createWoocommerceSalesChannel';
    case IntegrationTypes.Amazon:
      return 'createAmazonSalesChannel';
    case IntegrationTypes.Mirakl:
      return 'createMiraklSalesChannel';
    case IntegrationTypes.Manual:
      return 'createManualSalesChannel';
    case IntegrationTypes.Webhook:
      return 'createWebhookIntegration';
    case IntegrationTypes.Ebay:
      return 'createEbaySalesChannel';
    case IntegrationTypes.Shein:
      return 'createSheinSalesChannel';
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
      loading.value = false;
      return;
    }

    const shouldIncludeStartingStock = [
      IntegrationTypes.Magento,
      IntegrationTypes.Woocommerce,
      IntegrationTypes.Amazon,
      IntegrationTypes.Mirakl,
      IntegrationTypes.Ebay,
      IntegrationTypes.Shein,
    ].includes(resolvedIntegrationType.value);

    const salesChannelData = resolvedIntegrationType.value !== IntegrationTypes.Webhook
      ? { ...form.salesChannelInfo }
      : {};

    if (!shouldIncludeStartingStock) {
      delete (salesChannelData as any).startingStock;
    }

    const dataInput = resolvedIntegrationType.value === IntegrationTypes.Manual
      ? {
          hostname: form.generalInfo.hostname,
          active: form.generalInfo.active,
        }
      : {
          ...form.generalInfo,
          ...salesChannelData,
          ...specificChannelInfo.value
        };

    if (
      resolvedIntegrationType.value === IntegrationTypes.Shopify &&
      (specificChannelInfo.value as ShopifyChannelInfo)?.vendorProperty?.id == null
    ) {
      if ('vendorProperty' in specificChannelInfo.value) {
        delete (dataInput as any).vendorProperty;
      }
    }

    if (resolvedIntegrationType.value === IntegrationTypes.Mirakl) {
      (dataInput as MiraklChannelInfo).subType = selectedMiraklSubType.value || DEFAULT_MIRAKL_SUB_TYPE;
    }

    const { data } = await apolloClient.mutate({
      mutation,
      variables: { data: dataInput },
    });

    if (data && data[mutationKey]) {
      Toast.success(t('integrations.create.success'));
      loading.value = false;
      await handleSalesChannelSuccess(data[mutationKey], resolvedIntegrationType.value);
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

  const messages = result?.messages || [];
  if (messages.length) {
    messages.forEach((msg: any) => {
      Toast.error(msg.message);
    });
  } else {
    Toast.error(t('integrations.salesChannel.shopify.installed.genericError'));
  }

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

const handleEbaySalesChannelSuccess = async (channelData: any) => {
  const id = channelData.id;

  const { data } = await apolloClient.mutate({
    mutation: getEbayRedirectUrlMutation,
    variables: {
      data: { id },
    },
  });

  const result = data?.getEbayRedirectUrl;

  if (result?.redirectUrl) {
    window.location.href = result.redirectUrl;
    return;
  }

  const messages = result?.messages || [];
  messages.forEach((msg: any) => {
    Toast.error(msg.message);
  });

  router.push({
    name: 'integrations.integrations.show',
    params: { type: IntegrationTypes.Ebay, id },
  });
};

const handleSheinSalesChannelSuccess = async (channelData: any) => {
  const id = channelData.id;

  const { data } = await apolloClient.mutate({
    mutation: getSheinRedirectUrlMutation,
    variables: {
      data: { id },
    },
  });

  const result = data?.getSheinRedirectUrl;

  if (result?.redirectUrl) {
    window.location.href = result.redirectUrl;
    return;
  }

  const messages = result?.messages || [];
  messages.forEach((msg: any) => {
    Toast.error(msg.message);
  });

  router.push({
    name: 'integrations.integrations.show',
    params: { type: IntegrationTypes.Shein, id },
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

  if (integrationType === IntegrationTypes.Ebay) {
    await handleEbaySalesChannelSuccess(channelData);
    return;
  }

  if (integrationType === IntegrationTypes.Shein) {
    await handleSheinSalesChannelSuccess(channelData);
    return;
  }

  if (integrationType === IntegrationTypes.Mirakl) {
    router.push({
      name: 'integrations.integrations.show',
      params: { type: IntegrationTypes.Mirakl, id: channelData.id },
    });
    return;
  }

  if (integrationType === IntegrationTypes.Manual) {
    router.push({
      name: 'integrations.integrations.show',
      params: { type: IntegrationTypes.Manual, id: channelData.id },
    });
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
          <TypeStep
            :type="selectedIntegrationChoice"
            @update:type="val => selectedIntegrationChoice = val"
            @update:selection="val => selectedIntegrationDefinition = val"
            @go-next="wizardRef?.nextStep()"
          />
        </template>

        <template #generalInfoStep>
          <GeneralInfoStep
              :general-info="form.generalInfo"
              :integration-type="resolvedIntegrationType"
              :max-requests-per-minute="resolvedIntegrationType === IntegrationTypes.Shopify || resolvedIntegrationType === IntegrationTypes.Webhook ? 120 : undefined"
              :show-ssl="
                resolvedIntegrationType !== IntegrationTypes.Shopify &&
                resolvedIntegrationType !== IntegrationTypes.Amazon &&
                resolvedIntegrationType !== IntegrationTypes.Mirakl &&
                resolvedIntegrationType !== IntegrationTypes.Manual
              "
              :show-throttling="resolvedIntegrationType !== IntegrationTypes.Manual"
              :show-active="resolvedIntegrationType === IntegrationTypes.Manual"
          />
        </template>

        <template #salesChannelStep>
          <SalesChannelStep
            :sales-channel-info="form.salesChannelInfo"
            :integration-type="resolvedIntegrationType"
          />
        </template>

        <template #specificChannelStep>
          <component
            v-if="
              resolvedIntegrationType !== IntegrationTypes.Ebay &&
              resolvedIntegrationType !== IntegrationTypes.Shein &&
              resolvedIntegrationType !== IntegrationTypes.Manual
            "
            :is="getIntegrationComponent()"
            :channel-info="specificChannelInfo"
            v-bind="resolvedIntegrationType === IntegrationTypes.Mirakl
              ? { marketplaceName: selectedIntegrationDisplayName }
              : {}"
          />
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
  </GeneralTemplate></template>
