<script setup lang="ts">
import { defineEmits, defineProps, onMounted, ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { OnboardingCard } from './../onboarding-card';
import { productsQuery } from "../../../../../shared/api/queries/products.js";
import { membersQuery } from "../../../../../shared/api/queries/me.js";
import { Card } from "../../../../../shared/components/atoms/card";
import {VOnboardingWrapper, useVOnboarding, StepEntity} from 'v-onboarding';
import 'v-onboarding/dist/style.css';
import { OnboardingStatus, ProductType } from "../../../../../shared/utils/constants";
import apolloClient from "../../../../../../apollo-client";
import {goToStepMutation} from "../../../../../shared/api/mutations/auth.js";
import {injectAuth, refreshUser, setAuthChangingState} from "../../../../../shared/modules/auth";
import {Modal } from "../../../../../shared/components/atoms/modal";
import {CompleteOnboardingModal } from "../complete-onboarding-modal";
import {
  propertySelectValuesQuery,
  productPropertiesRuleItemsQuery,
  productPropertiesRulesListingQuery,
  propertiesQuery,
  productPropertiesQuery
} from "../../../../../shared/api/queries/properties.js";
import { mediaProductThroughQuery } from "../../../../../shared/api/queries/media.js";
import { eanCodesQuery } from "../../../../../shared/api/queries/eanCodes.js";
import { salesPriceListsQuery } from "../../../../../shared/api/queries/salesPrices.js";
import { OrderType } from "../../../../../shared/components/organisms/general-search/searchConfig";
import { OnboardingCardObject } from "../onboarding-card/onboardingCard";

const { t } = useI18n();
const auth = injectAuth();

const props = defineProps<{ status: string }>();
const emit = defineEmits(['update-status']);

const isCompleted = ref(false);
const showCreateCompleteModal = ref(false);

const excludeDemoDataFilter =  { filter: { excludeDemoData: true } }
const propertyTypeFilter =  { filter: { excludeDemoData: true, property: { isProductType: { exact: true } } } }
const propertyValueFilter =  { filter: { excludeDemoData: true, property: { isProductType: { exact: false } } } }
const propertyFilter =  { filter: { excludeDemoData: true, isProductType: { exact: false } } }
const productsFilter =  { filter: { excludeDemoData: true, type: { exact: ProductType.Simple } } }
const productTypeId = ref<string | null>(null);
const productId = ref<string | null>(null);
const propertyRuleId = ref<string | null>(null);

const fetchProductType = async () => {
    const {data} = await apolloClient.query({
      query: propertiesQuery,
      variables: {filter: {isProductType: { exact: true } }}
    })

    if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
      productTypeId.value = data.properties.edges[0].node.id;
    }
}

const fetchLastCreatedProduct = async () => {
  const { data } = await apolloClient.query({
    query: productsQuery,
    variables: {
      filter: { excludeDemoData: true, type: { exact: ProductType.Simple } },
      order: { createdAt: OrderType.DESC },
      first: 1
    }
  });

  if (data?.products?.edges?.length === 1) {
    productId.value = data.products.edges[0].node.id;
  }
};

const fetchLastCreatedPropertyRule = async () => {
  const { data } = await apolloClient.query({
    query: productPropertiesRulesListingQuery,
    variables: {
      filter: { excludeDemoData: true },
      order: { createdAt: OrderType.DESC },
      first: 1
    }
  });

  if (data?.productPropertiesRules?.edges?.length === 1) {
    propertyRuleId.value = data.productPropertiesRules.edges[0].node.id;
  }
};

onMounted(async () => {
  await fetchProductType();
  await fetchLastCreatedProduct();
  await fetchLastCreatedPropertyRule();
  if (props.status === OnboardingStatus.DASHBOARD_CARDS_PRESENTATION) {
    start();
  }
});

const cards = computed((): OnboardingCardObject[] => [
  {
    key: 'member',
    title: t('dashboard.onboarding.cards.member.title'),
    query: membersQuery,
    path: 'profile.company',
    dependencies: []
  },
  {
    key: 'createProductType',
    title: t('dashboard.onboarding.cards.createProductType.title'),
    path: 'properties.properties.show',
    pathParams: { id: productTypeId.value as string },
    pathQuery: { tab: 'values' },
    query: propertySelectValuesQuery,
    variables: propertyTypeFilter,
    dependencies: []
  },
  {
    key: 'product',
    title: t('dashboard.onboarding.cards.product.title'),
    path: 'products.products.create',
    query: productsQuery,
    variables: productsFilter,
    dependencies: ['createProductType']
  },
  {
    key: 'createProperty',
    title: t('dashboard.onboarding.cards.createProperty.title'),
    path: 'properties.properties.create',
    query: propertiesQuery,
    variables: propertyFilter,
    dependencies: ['product']
  },
  {
    key: 'assignPropertyToProductType',
    title: t('dashboard.onboarding.cards.assignPropertyToProductType.title'),
    query: productPropertiesRuleItemsQuery,
    variables: excludeDemoDataFilter,
    path: propertyRuleId.value
      ? 'properties.rule.edit'
      : 'properties.properties.show',
    pathParams: propertyRuleId.value ? { id: propertyRuleId.value as string } : { id: productTypeId.value as string },
    pathQuery: productId.value ? { tab: 'properties' } : { tab: 'values' },
    dependencies: ['createProductType', 'createProperty']
  },
  {
    key: 'setProductPropertyValue',
    title: t('dashboard.onboarding.cards.setProductPropertyValue.title'),
    path: productId.value
      ? 'products.products.show'
      : 'products.products.create',
    pathParams: productId.value ? { id: productId.value } : undefined,
    pathQuery: productId.value ? { tab: 'properties' } : undefined,
    query: productPropertiesQuery,
    variables: propertyValueFilter,
    dependencies: ['product', 'assignPropertyToProductType']
  },
  {
    key: 'uploadProductImage',
    title: t('dashboard.onboarding.cards.uploadProductImage.title'),
    path: productId.value
      ? 'products.products.show'
      : 'products.products.create',
    pathParams: productId.value ? { id: productId.value } : undefined,
    pathQuery: productId.value ? { tab: 'media' } : undefined,
    query: mediaProductThroughQuery,
    variables: excludeDemoDataFilter,
    dependencies: ['product']
  },
  {
    key: 'addEANCode',
    title: t('dashboard.onboarding.cards.addEANCode.title'),
    path: productId.value
      ? 'products.products.show'
      : 'products.eanCodes.list',
    pathParams: productId.value ? { id: productId.value } : undefined,
    pathQuery: productId.value ? { tab: 'eanCodes' } : undefined,
    query: eanCodesQuery,
    variables: excludeDemoDataFilter,
    dependencies: ['product']
  },
  {
    key: 'createPriceList',
    title: t('dashboard.onboarding.cards.createPriceList.title'),
    path: 'sales.priceLists.create',
    query: salesPriceListsQuery,
    variables: excludeDemoDataFilter,
    dependencies: []
  }
]);


// 2. Build completedStatus dynamically from the cards keys.
const completedStatus = ref<Record<string, boolean>>(
  cards.value.reduce((acc, card) => {
    acc[card.key] = false;
    return acc;
  }, {} as Record<string, boolean>)
);

const steps: StepEntity[] = [
  { attachTo: { element: '#member' }, content: { title: '', description: t('dashboard.onboarding.cards.member.details') } },
  { attachTo: { element: '#createProductType' }, content: { title: '', description: t('dashboard.onboarding.cards.createProductType.details') } },
  { attachTo: { element: '#product' }, content: { title: '', description: t('dashboard.onboarding.cards.product.details') } },
  { attachTo: { element: '#createProperty' }, content: { title: '', description: t('dashboard.onboarding.cards.createProperty.details') } },
  { attachTo: { element: '#assignPropertyToProductType' }, content: { title: '', description: t('dashboard.onboarding.cards.assignPropertyToProductType.details') } },
  { attachTo: { element: '#setProductPropertyValue' }, content: { title: '', description: t('dashboard.onboarding.cards.setProductPropertyValue.details') } },
  { attachTo: { element: '#uploadProductImage' }, content: { title: '', description: t('dashboard.onboarding.cards.uploadProductImage.details') } },
  { attachTo: { element: '#addEANCode' }, content: { title: '', description: t('dashboard.onboarding.cards.addEANCode.details') } },
  { attachTo: { element: '#createPriceList' }, content: { title: '', description: t('dashboard.onboarding.cards.createPriceList.details') } },
  { attachTo: { element: '#progressBar' }, content: { title: '', description: t('dashboard.onboarding.cards.progress.details') } }
];


const options = {
  overlay: {
    enabled: true,
    padding: 10,
    borderRadius: 15,
  },
  hideButtons: {
    exit: true
  },
}

watch(completedStatus, (newStatus) => {
  isCompleted.value = Object.values(newStatus).every(status => status);
}, { deep: true });

watch(isCompleted, (completed) => {
  if (completed) {
    showCreateCompleteModal.value = true;
  }
}, { deep: true });
const updateStatus = (key: string, status: boolean) => {
  completedStatus.value[key] = status;
  calculateProgress();
};

const calculateProgress = () => {
  const total = Object.keys(completedStatus.value).length;
  const completed = Object.values(completedStatus.value).filter(status => status).length;
  progressPercentage.value = Math.floor((completed / total) * 100);
};

const progressPercentage = ref(0);
calculateProgress();


const wrapper = ref(null);
const { start } = useVOnboarding(wrapper);

const onPresenationFinish = async () => {
  const {data} = await apolloClient.mutate({
    mutation: goToStepMutation,
    variables: {
      onboardingStatus: OnboardingStatus.COMPLETE_DASHBOARD_CARDS
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

const onFinish = () => {
  emit('update-status')
  showCreateCompleteModal.value = false
}

</script>

<template>
  <Card>
    <VOnboardingWrapper ref="wrapper" :steps="steps" :options="options" @finish="onPresenationFinish" />
    <h1 class="text-xl text-primary">{{ t('dashboard.onboarding.cards.header') }}</h1>

    <div id="progressBar" class="text-right mb-4">
      <span class="text-primary font-semibold">{{ progressPercentage }}%</span>
      <div class="bg-[#ebedf2] dark:bg-[#0e1726] rounded-full w-full h-1.5 mt-1.5">
        <div class="rounded-full bg-primary h-full" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <OnboardingCard v-for="card in cards" :id="card.key" :key="card.key" :card="card" :completed-status="completedStatus" @update-status="updateStatus(card.key, $event)" />
    </div>
    <Modal v-if="isCompleted && status == OnboardingStatus.COMPLETE_DASHBOARD_CARDS" v-model="showCreateCompleteModal" @closed="showCreateCompleteModal = false">
        <CompleteOnboardingModal @continue-clicked="onFinish" />
    </Modal>
  </Card>
</template>

<style scoped>
.bg-primary {
  background-color: #007bff;
}
</style>
