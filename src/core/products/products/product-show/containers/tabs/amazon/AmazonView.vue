<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import AmazonMarketplaceTabs from './components/AmazonMarketplaceTabs.vue';
import AmazonStatusSection from './components/AmazonStatusSection.vue';
import AmazonIssuesSection from './components/AmazonIssuesSection.vue';
import AmazonExternalProductIdSection from './components/AmazonExternalProductIdSection.vue';
import AmazonGtinExemptionSection from './components/AmazonGtinExemptionSection.vue';
import AmazonBrowseNodeSection from './components/AmazonBrowseNodeSection.vue';
import AmazonUnmappedValuesSection from './components/AmazonUnmappedValuesSection.vue';
import AmazonVariationThemeSection from './components/AmazonVariationThemeSection.vue';
import { amazonChannelViewsQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import {
  resyncAmazonProductMutation,
  refreshAmazonProductIssuesMutation,
} from '../../../../../../../shared/api/mutations/amazonProducts.js';
import { Toast } from '../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../shared/utils';
import apolloClient from '../../../../../../../../apollo-client';
import { ProductType } from '../../../../../../../shared/utils/constants';

const props = defineProps<{ product: Product; amazonProducts: AmazonProduct[] }>();
const emit = defineEmits(['refreshAmazonProducts']);
const { t } = useI18n();

interface AmazonProductIssue {
  id: string;
  code?: string | null;
  message?: string | null;
  severity?: string | null;
  isValidationIssue?: boolean | null;
  view?: { remoteId: string; name?: string } | null;
  createdAt?: string | null;
}

interface AmazonProduct {
  id: string;
  createdMarketplaces: string[];
  lastSyncAt?: string | null;
  syncingCurrentPercentage?: number | null;
  issues: AmazonProductIssue[];
}

const views = ref<any[]>([]);
const loading = ref(false);
const selectedViewId = ref<string | null>(null);

const fetchViews = async () => {
  loading.value = true;
  const { data } = await apolloClient.query({
    query: amazonChannelViewsQuery,
    fetchPolicy: 'network-only',
  });
  views.value = data.amazonChannelViews?.edges?.map((edge: any) => edge.node) || [];
  loading.value = false;
};

onMounted(fetchViews);

watch(views, (newViews) => {
  if (!selectedViewId.value && newViews.length) {
    const defaultView = newViews.find((v: any) => v.isDefault) || newViews[0];
    selectedViewId.value = defaultView.id;
  }
});

const selectedView = computed(() =>
  views.value.find((v: any) => v.id === selectedViewId.value),
);

const selectedProduct = computed(() => {
  if (!selectedView.value) return null;
  return (
    props.amazonProducts.find((product: AmazonProduct) =>
      product.createdMarketplaces.includes(selectedView.value.remoteId),
    ) || null
  );
});

const remoteProductId = computed(() => selectedProduct.value?.id || null);
const lastSyncAt = computed(() => selectedProduct.value?.lastSyncAt || null);
const syncingCurrentPercentage = computed(
  () => selectedProduct.value?.syncingCurrentPercentage || null,
);

const validationIssues = computed(() => {
  if (!selectedProduct.value || !selectedView.value) return [] as AmazonProductIssue[];
  return (
    selectedProduct.value.issues?.filter(
      (issue) =>
        issue.view?.remoteId === selectedView.value.remoteId && issue.isValidationIssue,
    ) || []
  );
});

const otherIssues = computed(() => {
  if (!selectedProduct.value || !selectedView.value) return [] as AmazonProductIssue[];
  return (
    selectedProduct.value.issues?.filter(
      (issue) =>
        issue.view?.remoteId === selectedView.value.remoteId && !issue.isValidationIssue,
    ) || []
  );
});
const isConfigurable = computed(() => props.product.type === ProductType.Configurable);

const onResyncSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.resyncSuccess'));
  emit('refreshAmazonProducts');
  fetchViews();
};

const onValidateSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.validateSuccess'));
  emit('refreshAmazonProducts');
  fetchViews();
};

const onFetchIssuesSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.fetchIssuesSuccess'));
  emit('refreshAmazonProducts');
  fetchViews();
};

const onError = (error) => {
  displayApolloError(error);
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};
</script>

<template>
  <TabContentTemplate>
    <template #content>
      <LocalLoader :loading="loading" />
      <div v-if="!loading && views.length" class="flex">
        <AmazonMarketplaceTabs
          class="w-72"
          v-model="selectedViewId"
          :views="views"
          :amazon-products="amazonProducts"
        />
          <div class="flex-1 p-6">
            <div v-if="selectedView">
              <AmazonStatusSection
                class="mb-4"
                :selected-product="selectedProduct"
                :last-sync-at="lastSyncAt"
                :syncing-current-percentage="syncingCurrentPercentage"
                :remote-product-id="remoteProductId"
                :selected-view="selectedView"
                :resync-amazon-product-mutation="resyncAmazonProductMutation"
                :refresh-amazon-product-issues-mutation="refreshAmazonProductIssuesMutation"
                @resync-success="onResyncSuccess"
                @validate-success="onValidateSuccess"
                @fetch-issues-success="onFetchIssuesSuccess"
                @error="onError"
              />

              <div class="border-t my-4"></div>

              <AmazonIssuesSection
                class="mb-4"
                :validation-issues="validationIssues"
                :other-issues="otherIssues"
              />

              <div class="border-t my-4"></div>

              <AmazonExternalProductIdSection
                class="mb-4"
                :product="product"
                :view="selectedView"
              />

              <div class="border-t my-4"></div>

              <AmazonGtinExemptionSection
                class="mb-4"
                :product-id="props.product.id"
                :view-id="selectedView?.id"
                :view="selectedView"
              />

              <div class="border-t my-4"></div>

              <AmazonUnmappedValuesSection
                v-if="remoteProductId"
                class="mb-4"
                :remote-product-id="remoteProductId"
              />

              <div v-if="remoteProductId" class="border-t my-4"></div>

              <AmazonBrowseNodeSection
                class="mb-4"
                :product-id="props.product.id"
                :sales-channel-id="selectedView?.salesChannel.id"
                :sales-channel-view-id="selectedView?.id"
                :marketplace-id="selectedView?.remoteId"
                :view="selectedView"
              />

              <div class="border-t my-4"></div>

              <AmazonVariationThemeSection
                v-if="isConfigurable && selectedView"
                class="mb-4"
                :product="product"
                :view="selectedView"
              />
            </div>
          </div>
        </div>
        <div v-else-if="!loading" class="text-sm text-gray-500">
          {{ t('shared.labels.noIssues') }}
        </div>
      </template>
    </TabContentTemplate>
  </template>

