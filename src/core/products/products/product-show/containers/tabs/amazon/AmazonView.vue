<script setup lang="ts">
import { computed, ref, onMounted, watch, unref } from 'vue';
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
  amazonProductsQuery,
  amazonChildRemoteProductsQuery,
} from '../../../../../../../shared/api/queries/amazonProducts.js';
import { amazonProductIssuesQuery } from '../../../../../../../shared/api/queries/amazonProductIssues.js';
import { amazonExternalProductIdsQuery } from '../../../../../../../shared/api/queries/amazonExternalProductIds.js';
import {
  resyncAmazonProductMutation,
  refreshAmazonProductIssuesMutation,
  refreshAmazonProductFromRemoteMutation,
} from '../../../../../../../shared/api/mutations/amazonProducts.js';
import { Toast } from '../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../shared/utils';
import apolloClient from '../../../../../../../../apollo-client';
import type { FetchPolicy } from '@apollo/client';
import { ProductType } from '../../../../../../../shared/utils/constants';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
import Swal from 'sweetalert2';

const props = defineProps<{ product: Product }>();
const { t } = useI18n();

type AmazonViewAssignments = Record<string, boolean>;

const amazonViewAssignments = computed<AmazonViewAssignments>(() => {
  const assignments = props.product?.saleschannelviewassignSet ?? [];

  return assignments.reduce((acc: AmazonViewAssignments, assign) => {
    if (
      assign.integrationType !== IntegrationTypes.Amazon ||
      !assign.salesChannelView?.id
    ) {
      return acc;
    }

    acc[assign.salesChannelView.id] = true;

    return acc;
  }, {} as AmazonViewAssignments);
});

const hasAmazonAssignmentData = computed(
  () => Object.keys(amazonViewAssignments.value).length > 0,
);

const getViewAssignmentKey = (view: any) => view?.proxyId || view?.id || null;

const MARKETPLACE_KEY_SEPARATOR = '::';
const createMarketplaceKey = (viewId: string, productId?: string | null) =>
  `${viewId}${MARKETPLACE_KEY_SEPARATOR}${productId ?? ''}`;

const doesProductMatchView = (product: AmazonProduct, view: any) => {
  if (!view || !product?.createdMarketplaces?.length) return false;
  if (hasAmazonAssignmentData.value) {
    const assignmentKey = getViewAssignmentKey(view);
    if (!assignmentKey || !amazonViewAssignments.value[assignmentKey]) {
      return false;
    }
  }
  const identifiers = [view.remoteId, view.id].filter(Boolean);

  return product.createdMarketplaces.some((marketplaceId) => {
    if (!marketplaceId) return false;

    const [marketplaceViewId] = marketplaceId.split(MARKETPLACE_KEY_SEPARATOR);

    return (
      identifiers.includes(marketplaceId) ||
      identifiers.includes(marketplaceViewId)
    );
  });
};

const amazonProducts = ref<AmazonProduct[]>([]);
const fetchAmazonProducts = async (fetchPolicy: FetchPolicy = 'network-only') => {
  const { data } = await apolloClient.query({
    query: amazonProductsQuery,
    variables: { localInstance: props.product.id },
    fetchPolicy,
  });
  amazonProducts.value = data.amazonProducts?.edges?.map((edge: any) => edge.node) || [];
};

onMounted(() => {
  fetchAmazonProducts();
});

interface AmazonProductIssue {
  id: string;
  code?: string | null;
  message?: string | null;
  severity?: string | null;
  isValidationIssue?: boolean | null;
  isSuppressed?: boolean | null;
  enforcementActions?: string[] | null;
  view?: { remoteId: string; name?: string } | null;
  createdAt?: string | null;
  remoteProduct?: { id: string } | null;
}

interface AmazonProduct {
  id: string;
  localInstance?: {
    id: string;
    name?: string | null;
    sku?: string | null;
  } | null;
  createdMarketplaces: string[];
  lastSyncAt?: string | null;
  syncingCurrentPercentage?: number | null;
  issues: AmazonProductIssue[];
  remoteParentProduct?: {
    id: string;
    localInstance?: {
      id: string;
      name?: string | null;
      sku?: string | null;
    } | null;
  } | null;
}

const views = ref<any[]>([]);
const loading = ref(false);
const selectedMarketplaceKey = ref<string | null>(null);

interface MarketplaceEntry {
  key: string;
  viewId: string;
  productId: string | null;
}

const marketplaceEntries = computed<MarketplaceEntry[]>(() => {
  const entries: MarketplaceEntry[] = [];
  views.value.forEach((view: any) => {
    const matchingProducts = amazonProducts.value.filter((product: AmazonProduct) =>
      doesProductMatchView(product, view),
    );

    if (matchingProducts.length) {
      matchingProducts.forEach((product) => {
        entries.push({
          key: createMarketplaceKey(view.id, product.id),
          viewId: view.id,
          productId: product.id,
        });
      });
    } else {
      entries.push({
        key: createMarketplaceKey(view.id, null),
        viewId: view.id,
        productId: null,
      });
    }
  });

  return entries;
});

const fetchViews = async () => {
  loading.value = true;
  const { data } = await apolloClient.query({
    query: amazonChannelViewsQuery,
    fetchPolicy: 'cache-first',
  });
  views.value = data.amazonChannelViews?.edges?.map((edge: any) => edge.node) || [];
  loading.value = false;
};

onMounted(fetchViews);

watch(
  marketplaceEntries,
  (entries) => {
    if (!entries.length) {
      selectedMarketplaceKey.value = null;
      return;
    }

    if (
      selectedMarketplaceKey.value &&
      entries.some((entry) => entry.key === selectedMarketplaceKey.value)
    ) {
      return;
    }

    const defaultEntry =
      entries.find((entry) => {
        const view = views.value.find((v: any) => v.id === entry.viewId);
        return view?.isDefault;
      }) || entries[0];

    selectedMarketplaceKey.value = defaultEntry.key;
  },
  { immediate: true },
);

const selectedView = computed(() =>
  views.value.find(
    (v: any) => v.id === selectedMarketplaceKey.value?.split(MARKETPLACE_KEY_SEPARATOR)[0],
  ),
);

const selectedProduct = computed(() => {
  if (!selectedView.value) return null;
  if (!selectedMarketplaceKey.value) return null;
  const [, productId] = selectedMarketplaceKey.value.split(MARKETPLACE_KEY_SEPARATOR);

  if (productId) {
    return amazonProducts.value.find((product: AmazonProduct) => product.id === productId) || null;
  }
  // console.log(selectedView.value)
  return (
    amazonProducts.value.find((product: AmazonProduct) =>
      doesProductMatchView(product, selectedView.value),
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

interface VariationValidationIssues {
  productId: string;
  localInstance?: {
    id: string;
    name?: string | null;
    sku?: string | null;
  } | null;
  issues: AmazonProductIssue[];
}

type VariationOtherIssues = VariationValidationIssues;

const variationValidationIssues = ref<VariationValidationIssues[]>([]);
const variationOtherIssues = ref<VariationOtherIssues[]>([]);

const fetchVariationValidationIssues = async () => {
  if (!isConfigurable.value || !selectedProduct.value?.id || !selectedView.value?.remoteId) {
    variationValidationIssues.value = [];
    variationOtherIssues.value = [];
    return;
  }

  try {
    const { data: childrenData } = await apolloClient.query({
      query: amazonChildRemoteProductsQuery,
      variables: { remoteParentProductId: selectedProduct.value.id },
      fetchPolicy: 'cache-first',
    });

    const variationProducts =
      childrenData?.amazonProducts?.edges?.map((edge: any) => edge.node) || [];

    if (!variationProducts.length) {
      variationValidationIssues.value = [];
      variationOtherIssues.value = [];
      return;
    }

    const remoteProductIds = Array.from(
      new Set(variationProducts.map((product: any) => product.id).filter(Boolean)),
    );

    if (!remoteProductIds.length) {
      variationValidationIssues.value = [];
      variationOtherIssues.value = [];
      return;
    }

    const [validationIssuesResult, otherIssuesResult] = await Promise.all([
      apolloClient.query({
        query: amazonProductIssuesQuery,
        variables: {
          filter: {
            isValidationIssue: { exact: true },
            view: { remoteId: { exact: selectedView.value.remoteId } },
            remoteProduct: { id: { inList: remoteProductIds } },
          },
        },
        fetchPolicy: 'network-only',
      }),
      apolloClient.query({
        query: amazonProductIssuesQuery,
        variables: {
          filter: {
            isValidationIssue: { exact: false },
            view: { remoteId: { exact: selectedView.value.remoteId } },
            remoteProduct: { id: { inList: remoteProductIds } },
          },
        },
        fetchPolicy: 'network-only',
      }),
    ]);

    const validationIssuesData = validationIssuesResult?.data;
    const otherIssuesData = otherIssuesResult?.data;

    const validationIssues =
      validationIssuesData?.amazonProductIssues?.edges?.map((edge: any) => edge.node) || [];
    const remoteOtherIssues =
      otherIssuesData?.amazonProductIssues?.edges?.map((edge: any) => edge.node) || [];

    const groupedValidationIssues: Record<string, VariationValidationIssues> = {};
    const groupedOtherIssues: Record<string, VariationOtherIssues> = {};

    variationProducts.forEach((product: any) => {
      groupedValidationIssues[product.localInstance.id] = {
        productId: product.id,
        localInstance: product.localInstance ?? null,
        issues: [],
      };
      groupedOtherIssues[product.localInstance.id] = {
        productId: product.id,
        localInstance: product.localInstance ?? null,
        issues: [],
      };
    });

    validationIssues.forEach((issue: any) => {
      const remoteId = issue.remoteProduct?.localInstance?.id;

      if (!remoteId || !groupedValidationIssues[remoteId]) {
        return;
      }

      groupedValidationIssues[remoteId].issues.push({
        id: issue.id,
        code: issue.code,
        message: issue.message,
        severity: issue.severity,
        isValidationIssue: issue.isValidationIssue,
        isSuppressed: issue.isSuppressed,
        enforcementActions: issue.enforcementActions,
        view: issue.view,
        createdAt: issue.createdAt,
      });
    });

    remoteOtherIssues.forEach((issue: any) => {
      const remoteId = issue.remoteProduct?.localInstance?.id;

      if (!remoteId || !groupedOtherIssues[remoteId]) {
        return;
      }

      groupedOtherIssues[remoteId].issues.push({
        id: issue.id,
        code: issue.code,
        message: issue.message,
        severity: issue.severity,
        isValidationIssue: issue.isValidationIssue,
        isSuppressed: issue.isSuppressed,
        enforcementActions: issue.enforcementActions,
        view: issue.view,
        createdAt: issue.createdAt,
      });
    });

    variationValidationIssues.value = Object.values(groupedValidationIssues).filter(
      (entry) => entry.issues.length > 0,
    );

    variationOtherIssues.value = Object.values(groupedOtherIssues).filter(
      (entry) => entry.issues.length > 0,
    );
  } catch (error) {
    variationValidationIssues.value = [];
    variationOtherIssues.value = [];
  }
};

watch(
  [() => isConfigurable.value, () => selectedProduct.value?.id, () => selectedView.value?.remoteId],
  () => {
    fetchVariationValidationIssues();
  },
  { immediate: true },
);

const externalIdRef = ref<InstanceType<typeof AmazonExternalProductIdSection> | null>(null);
const gtinExemptionRef = ref<InstanceType<typeof AmazonGtinExemptionSection> | null>(null);
const browseNodeRef = ref<InstanceType<typeof AmazonBrowseNodeSection> | null>(null);
const variationThemeRef = ref<InstanceType<typeof AmazonVariationThemeSection> | null>(null);

const hasUnsavedChanges = computed(
  () =>
    unref(externalIdRef.value?.hasUnsavedChanges) ||
    unref(gtinExemptionRef.value?.hasUnsavedChanges) ||
    unref(browseNodeRef.value?.hasUnsavedChanges) ||
    unref(variationThemeRef.value?.hasUnsavedChanges) ||
    false,
);

defineExpose({ hasUnsavedChanges, fetchAmazonProducts });

const selectedExternalProductAsin = ref<string | null>(null);

const fetchExternalProductId = async () => {
  if (!selectedView.value?.id || !props.product?.id || !remoteProductId.value) {
    selectedExternalProductAsin.value = null;
    return;
  }

  try {
    const { data } = await apolloClient.query({
      query: amazonExternalProductIdsQuery,
      variables: {
        filter: {
          product: { id: { exact: props.product.id } },
          view: { id: { exact: selectedView.value.id } },
        },
      },
      fetchPolicy: 'cache-first',
    });

    const node = data?.amazonExternalProductIds?.edges?.[0]?.node;
    if (!node) {
      selectedExternalProductAsin.value = null;
      return;
    }

    const asin =
      node.type === 'ASIN'
        ? node.value
        : node.createdAsin || (node.type ? null : node.value);

    selectedExternalProductAsin.value = asin || null;
  } catch (error) {
    selectedExternalProductAsin.value = null;
  }
};

watch(
  [() => selectedView.value?.id, remoteProductId],
  () => {
    if (!selectedView.value?.id || !remoteProductId.value) {
      selectedExternalProductAsin.value = null;
      return;
    }
    fetchExternalProductId();
  },
  { immediate: true },
);

const amazonProductUrl = computed(() => {
  if (!remoteProductId.value || !selectedExternalProductAsin.value) return null;
  const rawBaseUrl =
    selectedView.value?.url ||
    (selectedView.value?.salesChannel?.hostname
      ? `https://${selectedView.value.salesChannel.hostname}`
      : '');

  if (!rawBaseUrl) return null;

  const baseUrl = rawBaseUrl.replace(/\/$/, '');

  return `${baseUrl}/dp/${selectedExternalProductAsin.value}`;
});

const handleMarketplaceSelection = async (newKey: string) => {
  if (hasUnsavedChanges.value) {
    const res = await Swal.fire({
      icon: 'warning',
      text: t('products.products.messages.unsavedChanges'),
      showCancelButton: true,
      confirmButtonText: t('shared.button.cancel'),
      cancelButtonText: t('shared.button.leaveTab'),
    });
    if (res.dismiss !== Swal.DismissReason.cancel) {
      return;
    }
  }
  selectedMarketplaceKey.value = newKey;
};

const onResyncSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.resyncSuccess'));
  fetchAmazonProducts('network-only');
  fetchViews();
};

const onImportSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.importSuccess'));
  fetchAmazonProducts('network-only');
  fetchViews();
};

const onValidateSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.validateSuccess'));
  fetchAmazonProducts('network-only');
  fetchViews();
};

const onFetchIssuesSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.fetchIssuesSuccess'));
  fetchAmazonProducts('network-only');
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
          :model-value="selectedMarketplaceKey"
          :views="views"
          :amazon-products="amazonProducts"
          :assigned-view-ids="amazonViewAssignments"
          @update:modelValue="handleMarketplaceSelection"
        />
          <div class="flex-1 p-6">
            <div v-if="selectedView">
              <AmazonStatusSection
                class="mb-4"
                :selected-product="selectedProduct"
                :last-sync-at="lastSyncAt"
                :syncing-current-percentage="syncingCurrentPercentage"
                :remote-product-id="remoteProductId"
                :amazon-product-url="amazonProductUrl"
                :selected-view="selectedView"
                :resync-amazon-product-mutation="resyncAmazonProductMutation"
                :refresh-amazon-product-issues-mutation="refreshAmazonProductIssuesMutation"
                :refresh-amazon-product-from-remote-mutation="refreshAmazonProductFromRemoteMutation"
                :product-id="props.product.id"
                @resync-success="onResyncSuccess"
                @import-success="onImportSuccess"
                @validate-success="onValidateSuccess"
                @fetch-issues-success="onFetchIssuesSuccess"
                @error="onError"
              />

              <div class="border-t my-4"></div>

              <AmazonIssuesSection
                class="mb-4"
                :validation-issues="validationIssues"
                :other-issues="otherIssues"
                :is-configurable="isConfigurable"
                :variation-validation-issues="variationValidationIssues"
                :variation-other-issues="variationOtherIssues"
              />

              <div class="border-t my-4"></div>

              <AmazonExternalProductIdSection
                class="mb-4"
                ref="externalIdRef"
                :product="product"
                :view="selectedView"
              />

              <div class="border-t my-4"></div>

              <AmazonGtinExemptionSection
                class="mb-4"
                ref="gtinExemptionRef"
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
                ref="browseNodeRef"
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
                ref="variationThemeRef"
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
