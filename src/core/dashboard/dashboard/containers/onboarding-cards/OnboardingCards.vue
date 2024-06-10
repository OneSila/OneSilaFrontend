<script setup lang="ts">
import {defineEmits, defineProps, onMounted, ref, watch} from 'vue';
import { useI18n } from 'vue-i18n';
import { OnboardingCard } from './../onboarding-card';
import { customersQuery, suppliersQuery } from "../../../../../shared/api/queries/contacts.js";
import { purchaseOrdersQuery, supplierProductsQuery } from "../../../../../shared/api/queries/purchasing.js";
import { productsQuery } from "../../../../../shared/api/queries/products.js";
import { ordersQuery } from "../../../../../shared/api/queries/salesOrders.js";
import { inventoriesQuery } from "../../../../../shared/api/queries/inventory.js";
import { membersQuery } from "../../../../../shared/api/queries/me.js";
import { OnboardingCardObject } from "../onboarding-card/OnboardingCard.vue";
import { Card } from "../../../../../shared/components/atoms/card";
import {VOnboardingWrapper, useVOnboarding, StepEntity} from 'v-onboarding';
import 'v-onboarding/dist/style.css';
import {OnboardingStatus} from "../../../../../shared/utils/constants";
import apolloClient from "../../../../../../apollo-client";
import {goToStepMutation} from "../../../../../shared/api/mutations/auth.js";
import {injectAuth, refreshUser} from "../../../../../shared/modules/auth";
import {Modal } from "../../../../../shared/components/atoms/modal";
import {CompleteOnboardingModal } from "../complete-onboarding-modal";

const { t } = useI18n();
const auth = injectAuth();

const props = defineProps<{ status: string }>();
const emit = defineEmits(['update-status']);

const isCompleted = ref(false);
const showCreateCompleteModal = ref(false);

const cards: OnboardingCardObject[] = [
  { key: 'supplier', title: t('dashboard.onboarding.cards.createSupplier.title'), query: suppliersQuery, path: 'purchasing.suppliers.create' },
  { key: 'supplierProduct', title: t('dashboard.onboarding.cards.createSupplierProduct.title'), query: supplierProductsQuery, path: 'purchasing.product.create' },
  { key: 'purchaseOrder', title: t('dashboard.onboarding.cards.addFirstPurchaseOrder.title'), query: purchaseOrdersQuery, path: 'purchasing.orders.create'},
  { key: 'inventory', title: t('dashboard.onboarding.cards.addFirstInventory.title'), query: inventoriesQuery, path: 'inventory.inventory.create' },
  { key: 'customer', title: t('dashboard.onboarding.cards.createCustomer.title'), query: customersQuery, path: 'sales.customers.create' },
  { key: 'product', title: t('dashboard.onboarding.cards.createFirstProduct.title'), query: productsQuery, path: 'products.products.create'},
  { key: 'salesOrder', title: t('dashboard.onboarding.cards.addFirstSalesOrder.title'), query: ordersQuery, path: 'sales.orders.create' },
  { key: 'member', title: t('dashboard.onboarding.cards.inviteAnotherMember.title'), query: membersQuery, path: 'profile.company' }
];

const steps: StepEntity[]  = [
  { attachTo: { element: '#supplier' }, content: { title: '', description: t('dashboard.onboarding.cards.createSupplier.details') } },
  { attachTo: { element: '#supplierProduct' }, content: { title: '', description: t('dashboard.onboarding.cards.createSupplierProduct.details') } },
  { attachTo: { element: '#purchaseOrder' }, content: { title: '', description: t('dashboard.onboarding.cards.addFirstPurchaseOrder.details') } },
  { attachTo: { element: '#inventory' }, content: { title: '', description: t('dashboard.onboarding.cards.addFirstInventory.details') } },
  { attachTo: { element: '#customer' }, content: { title: '', description: t('dashboard.onboarding.cards.createCustomer.details') } },
  { attachTo: { element: '#product' }, content: { title: '', description: t('dashboard.onboarding.cards.createFirstProduct.details') } },
  { attachTo: { element: '#salesOrder' }, content: { title: '', description: t('dashboard.onboarding.cards.addFirstSalesOrder.details') } },
  { attachTo: { element: '#member' }, content: { title: '', description: t('dashboard.onboarding.cards.inviteAnotherMember.details') } },
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

const completedStatus = ref({
  supplier: false,
  customer: false,
  supplierProduct: false,
  product: false,
  salesOrder: false,
  purchaseOrder: false,
  inventory: false,
  member: false
});

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
  progressPercentage.value = (completed / total) * 100;
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
  }
}


onMounted(() => {
  if (props.status === OnboardingStatus.DASHBOARD_CARDS_PRESENTATION) {
    start();
  }
});

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
      <OnboardingCard v-for="card in cards" :id="card.key" :key="card.key"  :card="card" @update-status="updateStatus(card.key, $event)" />
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
