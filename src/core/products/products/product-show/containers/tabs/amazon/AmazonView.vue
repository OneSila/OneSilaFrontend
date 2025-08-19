<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { AssignProgressBar } from '../../../../../../../shared/components/molecules/assign-progress-bar';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import AmazonMarketplaceTabs from './components/AmazonMarketplaceTabs.vue';
import AmazonAsinSection from './components/AmazonAsinSection.vue';
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
    selectedViewId.value = newViews[0].id;
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
          <div class="flex-1 pl-4">
            <div v-if="selectedView">
              <div class="mb-4">
                <div class="flex flex-col sm:flex-row sm:justify-between mb-4">
                  <div v-if="selectedProduct" class="flex flex-col gap-2 text-sm text-gray-500">
                    <div>
                      <span class="font-medium">{{ t('shared.labels.lastSyncAt') }}:</span>
                      {{ formatDate(lastSyncAt) }}
                    </div>
                    <div>
                      <span class="font-medium">{{ t('shared.labels.progress') }}:</span>
                      <div class="w-48 mt-1">
                        <AssignProgressBar :progress="syncingCurrentPercentage ?? 0" />
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-2 sm:mt-0">
                    <ApolloMutation
                      :mutation="resyncAmazonProductMutation"
                      :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView.id }, forceValidationOnly: false }"
                      @done="onResyncSuccess"
                      @error="onError"
                    >
                      <template #default="{ mutate, loading }">
                        <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
                          {{ t('shared.button.resync') }}
                        </Button>
                      </template>
                    </ApolloMutation>
                    <ApolloMutation
                      :mutation="resyncAmazonProductMutation"
                      :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView.id }, forceValidationOnly: true }"
                      @done="onValidateSuccess"
                      @error="onError"
                    >
                      <template #default="{ mutate, loading }">
                        <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
                          {{ t('shared.button.validate') }}
                        </Button>
                      </template>
                    </ApolloMutation>
                    <ApolloMutation
                      v-if="remoteProductId"
                      :mutation="refreshAmazonProductIssuesMutation"
                      :variables="{ remoteProduct: { id: remoteProductId }, view: { id: selectedView.id } }"
                      @done="onFetchIssuesSuccess"
                      @error="onError"
                    >
                      <template #default="{ mutate, loading }">
                        <Button class="btn btn-sm btn-outline-primary" :disabled="loading" @click.stop="mutate">
                          {{ t('shared.button.fetchIssues') }}
                        </Button>
                      </template>
                    </ApolloMutation>
                  </div>
                </div>
              </div>

              <div class="border-t my-4"></div>

              <div class="mb-4">
                <h4 class="font-semibold mb-2">{{ t('products.products.amazon.validationIssues') }}</h4>
                <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.validationIssuesDescription') }}</p>
                <div v-if="validationIssues.length">
                  <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                    <thead>
                      <tr>
                        <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                        <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                        <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.fetchedAt') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="issue in validationIssues" :key="issue.id">
                        <td class="break-words max-w-xs">{{ issue.message }}</td>
                        <td
                          class="capitalize flex items-center gap-1"
                          :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
                        >
                          <Icon
                            :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'"
                            class="w-4 h-4"
                          />
                          {{ issue.severity }}
                        </td>
                        <td>{{ formatDate(issue.createdAt) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-sm text-gray-500">
                  {{ t('shared.labels.noIssues') }}
                </div>
              </div>

              <div class="mb-4">
                <h4 class="font-semibold mb-2">{{ t('products.products.amazon.otherIssues') }}</h4>
                <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.otherIssuesDescription') }}</p>
                <div v-if="otherIssues.length">
                  <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                    <thead>
                      <tr>
                        <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                        <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                        <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.fetchedAt') }}</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                      <tr v-for="issue in otherIssues" :key="issue.id">
                        <td class="break-words max-w-xs">{{ issue.message }}</td>
                        <td
                          class="capitalize flex items-center gap-1"
                          :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
                        >
                          <Icon
                            :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'"
                            class="w-4 h-4"
                          />
                          {{ issue.severity }}
                        </td>
                        <td>{{ formatDate(issue.createdAt) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-sm text-gray-500">
                  {{ t('shared.labels.noIssues') }}
                </div>
              </div>

              <div class="border-t my-4"></div>

              <AmazonAsinSection
                class="mb-4"
                :product="product"
                :view="selectedView"
              />
              <AmazonGtinExemptionSection class="mb-4" />
              <AmazonBrowseNodeSection class="mb-4" />
              <AmazonUnmappedValuesSection
                v-if="remoteProductId"
                class="mb-4"
                :remote-product-id="remoteProductId"
              />
              <AmazonVariationThemeSection v-if="isConfigurable" class="mb-4" />
              <AmazonUnmappedValuesSection class="mb-4" />
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

