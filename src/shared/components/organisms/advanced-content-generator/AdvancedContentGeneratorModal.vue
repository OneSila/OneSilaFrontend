<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import { Modal } from '../../atoms/modal';
import { Card } from '../../atoms/card';
import { Button } from '../../atoms/button';
import { Loader } from '../../atoms/loader';
import { Toast } from '../../../modules/toast';
import { processGraphQLErrors } from '../../../utils';
import { integrationsQuery } from '../../../api/queries/integrations.js';
import { productsBulkWebsiteAssignQuery } from '../../../api/queries/products.js';
import { advancedContentGeneratorMutation } from '../../../api/mutations/llm.js';
import { IntegrationTypes } from '../../../../core/integrations/integrations/integrations';
import AdvancedContentGeneratorForm from './AdvancedContentGeneratorForm.vue';
import AdvancedContentGeneratorPreview from './AdvancedContentGeneratorPreview.vue';

interface IntegrationChannel {
  id: string;
  proxyId?: string | null;
  hostname?: string | null;
  type?: string | null;
  active?: boolean | null;
}

interface ProductSummary {
  id: string;
  sku: string;
}

const props = defineProps<{
  modelValue: boolean;
  productIds: string[];
  initialSalesChannelIds?: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'started'): void;
}>();

const { t } = useI18n();

const localOpen = ref(props.modelValue);
const step = ref<'form' | 'preview'>('form');
const loadingPreview = ref(false);
const loadingData = ref(false);
const salesChannels = ref<IntegrationChannel[]>([]);
const products = ref<ProductSummary[]>([]);
const previewPayload = ref<any>(null);
const activeProductIds = ref<string[]>([]);
const formKey = ref(0);

const productMap = computed(() => {
  const map = new Map<string, ProductSummary>();
  products.value.forEach((product) => {
    map.set(product.sku, product);
  });
  return map;
});

const resetState = () => {
  step.value = 'form';
  previewPayload.value = null;
  activeProductIds.value = [];
  formKey.value += 1;
};

const closeModal = () => {
  localOpen.value = false;
  emit('update:modelValue', false);
  resetState();
};

const loadSalesChannels = async () => {
  const { data } = await apolloClient.query({
    query: integrationsQuery,
    fetchPolicy: 'cache-first',
  });
  const channels = data?.integrations?.edges?.map((edge: any) => edge.node) ?? [];
  salesChannels.value = channels.filter((channel: IntegrationChannel) => {
    const type = (channel.type || '').toLowerCase();
    return channel.active && type !== IntegrationTypes.Webhook;
  });
};

const loadProducts = async () => {
  if (!activeProductIds.value.length) {
    products.value = [];
    return;
  }

  const { data } = await apolloClient.query({
    query: productsBulkWebsiteAssignQuery,
    variables: {
      filter: { id: { inList: activeProductIds.value } },
      first: activeProductIds.value.length,
    },
    fetchPolicy: 'network-only',
  });

  products.value = data?.products?.edges?.map((edge: any) => edge.node) ?? [];
};

const loadData = async () => {
  loadingData.value = true;
  try {
    await Promise.all([loadSalesChannels(), loadProducts()]);
  } finally {
    loadingData.value = false;
  }
};

const handleSubmit = async (payload: any) => {
  if (loadingPreview.value) return;
  loadingPreview.value = true;

  try {
    const products = activeProductIds.value.map((id) => ({ id }));
    const { data } = await apolloClient.mutate({
      mutation: advancedContentGeneratorMutation,
      variables: {
        data: {
          products,
          salesChannels: payload.salesChannels,
          override: payload.override,
          preview: payload.preview,
          debug: false,
          additionalInformations: payload.additionalInformations,
        },
      },
    });

    const result = data?.advancedContentGenerator;

    if (payload.preview) {
      previewPayload.value = result?.content ?? null;
      if (!previewPayload.value) {
        Toast.error(t('shared.components.organisms.advancedContentGenerator.previewMissing'));
        return;
      }
      step.value = 'preview';
      emit('started');
      return;
    }

    Toast.success(t('shared.components.organisms.advancedContentGenerator.startedToast'));
    emit('started');
    closeModal();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    Object.values(validationErrors).forEach((message) => Toast.error(message));
  } finally {
    loadingPreview.value = false;
  }
};

watch(
  () => props.modelValue,
  async (value) => {
    localOpen.value = value;
    if (value) {
      activeProductIds.value = [...props.productIds];
      await loadData();
    }
  },
);

watch(
  () => props.productIds,
  async () => {
    if (!localOpen.value || step.value !== 'form') {
      return;
    }
    activeProductIds.value = [...props.productIds];
    if (localOpen.value) {
      await loadProducts();
    }
  },
  { deep: true },
);
</script>

<template>
  <Modal v-model="localOpen" @closed="closeModal">
    <Card class="modal-content w-[80vw] max-w-6xl max-h-[80vh] overflow-y-auto">
      <Loader :loading="loadingPreview" />
      <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
        <h3 class="text-xl font-semibold">
          {{ t('shared.components.organisms.advancedContentGenerator.title') }}
        </h3>
      </div>

      <div v-if="loadingData" class="text-center py-10 text-gray-500">
        {{ t('shared.labels.loading') }}
      </div>

      <AdvancedContentGeneratorForm
        v-else-if="step === 'form'"
        :key="formKey"
        :product-count="props.productIds.length"
        :sales-channels="salesChannels"
        :initial-sales-channel-ids="props.initialSalesChannelIds"
        @submit="handleSubmit"
        @cancel="closeModal"
      />

      <AdvancedContentGeneratorPreview
        v-else
        :preview="previewPayload"
        :sales-channels="salesChannels"
        :product-map="productMap"
        @close="closeModal"
      />
    </Card>
  </Modal>
</template>
