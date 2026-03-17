<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FetchPolicy } from '@apollo/client';
import Swal from 'sweetalert2';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import apolloClient from '../../../../../../../../apollo-client';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { miraklChannelsQuery, miraklChannelViewsQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import { miraklProductCategoriesQuery } from '../../../../../../../shared/api/queries/miraklProducts.js';
import { miraklProductTypesForCategoryMappingQuery } from '../../../../../../../shared/api/queries/miraklProductTypes.js';
import { miraklProductIssuesQuery } from '../../../../../../../shared/api/queries/miraklProductIssues.js';
import MiraklMarketplaceTabs from './components/MiraklMarketplaceTabs.vue';
import MiraklCategorySection from './components/MiraklCategorySection.vue';
import MiraklIssuesSection from './components/MiraklIssuesSection.vue';

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const loadingChannels = ref(false);
const channels = ref<any[]>([]);
const selectedChannelId = ref<string | null>(null);
const categorySectionRef = ref<InstanceType<typeof MiraklCategorySection> | null>(null);
const categoriesByChannel = ref<
  Record<string, { id: string | null; remoteId: string | null; salesChannelId: string | null }>
>({});
const defaultCategoriesByChannel = ref<
  Record<string, { remoteId: string | null; name: string | null }>
>({});

const productTypeRuleId = computed(() => {
  const typeProp = props.product?.productpropertySet?.find((property: any) => property.property?.isProductType);
  return typeProp?.valueSelect?.productpropertiesruleSet?.[0]?.id || null;
});

const fetchChannels = async () => {
  loadingChannels.value = true;
  try {
    const { data } = await apolloClient.query({
      query: miraklChannelsQuery,
      fetchPolicy: 'cache-first',
    });
    const list = data?.miraklChannels?.edges?.map((edge: any) => edge.node) || [];
    channels.value = list.sort((a: any, b: any) => (a.hostname || '').localeCompare(b.hostname || ''));
  } finally {
    loadingChannels.value = false;
  }
};

const fetchMiraklProductCategories = async (fetchPolicy: FetchPolicy = 'cache-first') => {
  if (!props.product.id) {
    return;
  }

  const { data } = await apolloClient.query({
    query: miraklProductCategoriesQuery,
    variables: {
      filter: {
        product: { id: { exact: props.product.id } },
      },
    },
    fetchPolicy,
  });

  const map: Record<string, { id: string | null; remoteId: string | null; salesChannelId: string | null }> = {};
  const edges = data?.miraklProductCategories?.edges || [];

  edges.forEach((edge: any) => {
    const node = edge?.node;
    const salesChannelId = node?.salesChannel?.id;
    if (salesChannelId) {
      map[salesChannelId] = {
        id: node.id,
        remoteId: node.remoteId,
        salesChannelId,
      };
    }
  });

  categoriesByChannel.value = map;
};

const resolveCategoryForChannel = (channel: any) => {
  if (!channel) return null;
  const channelId = channel.id;
  const ptrId = channel?.saleschannelPtr?.id || null;
  return categoriesByChannel.value[channelId] || (ptrId ? categoriesByChannel.value[ptrId] : null) || null;
};

let defaultCategoriesRequestId = 0;
const fetchDefaultCategories = async () => {
  if (!productTypeRuleId.value || !channels.value.length) {
    defaultCategoriesByChannel.value = {};
    return;
  }

  const requestId = ++defaultCategoriesRequestId;
  const entries = await Promise.all(
    channels.value.map(async (channel: any) => {
      const channelKey = channel?.id ?? '';
      const salesChannelPtrId = channel?.saleschannelPtr?.id || null;
      const filterSalesChannelId = salesChannelPtrId || channel?.id || null;

      if (!filterSalesChannelId || !productTypeRuleId.value) {
        return [channelKey, { remoteId: null, name: null }] as const;
      }

      try {
        const { data } = await apolloClient.query({
          query: miraklProductTypesForCategoryMappingQuery,
          variables: {
            first: 1,
            filter: {
              localInstance: { id: { exact: productTypeRuleId.value } },
              salesChannel: { id: { exact: filterSalesChannelId } },
            },
          },
          fetchPolicy: 'cache-first',
        });

        const node = data?.miraklProductTypes?.edges?.[0]?.node;
        return [
          channelKey,
          {
            remoteId: node?.category?.remoteId || null,
            name: node?.category?.name || node?.category?.remoteId || null,
          },
        ] as const;
      } catch (_error) {
        return [channelKey, { remoteId: null, name: null }] as const;
      }
    }),
  );

  if (requestId !== defaultCategoriesRequestId) {
    return;
  }

  const map: Record<string, { remoteId: string | null; name: string | null }> = {};
  entries.forEach(([channelId, info]) => {
    if (channelId) {
      map[channelId] = info;
    }
  });
  defaultCategoriesByChannel.value = map;
};

onMounted(() => {
  void fetchChannels();
  void fetchMiraklProductCategories();
});

watch(
  channels,
  (list) => {
    if (!list.length) {
      selectedChannelId.value = null;
      return;
    }
    if (selectedChannelId.value && list.some((channel) => channel.id === selectedChannelId.value)) {
      return;
    }
    selectedChannelId.value = list[0].id;
  },
  { immediate: true },
);

watch(
  [channels, productTypeRuleId],
  () => {
    void fetchDefaultCategories();
  },
  { immediate: true },
);

const selectedChannel = computed(() =>
  channels.value.find((channel: any) => channel.id === selectedChannelId.value) || null,
);

const selectedChannelSalesChannelId = computed(() =>
  selectedChannel.value?.saleschannelPtr?.id || selectedChannel.value?.id || null,
);

const selectedChannelIntegrationId = computed(() =>
  selectedChannel.value?.integrationPtr?.id || null,
);

const selectedCategory = computed(() => resolveCategoryForChannel(selectedChannel.value));

const selectedDefaultCategory = computed(() => {
  if (!selectedChannel.value) return null;
  return defaultCategoriesByChannel.value[selectedChannel.value.id] || null;
});

const miraklIssuesLoading = ref(false);
const miraklIssues = ref<any[]>([]);
const selectedChannelViewIds = ref<string[]>([]);
let selectedChannelViewsRequestId = 0;
let miraklIssuesRequestId = 0;

const selectedChannelRemoteProductIds = computed(() => {
  if (!selectedChannelViewIds.value.length) {
    return [];
  }

  const assignments = props.product?.saleschannelviewassignSet ?? [];

  return Array.from(
    new Set(
      assignments
        .filter((assign: any) =>
          assign?.integrationType === 'mirakl' &&
          selectedChannelViewIds.value.includes(assign?.salesChannelView?.id) &&
          assign?.remoteProduct?.id,
        )
        .map((assign: any) => assign.remoteProduct.id),
    ),
  );
});

const fetchSelectedChannelViews = async () => {
  if (!selectedChannelSalesChannelId.value) {
    selectedChannelViewIds.value = [];
    return;
  }

  const requestId = ++selectedChannelViewsRequestId;

  try {
    const { data } = await apolloClient.query({
      query: miraklChannelViewsQuery,
      variables: {
        filter: {
          salesChannel: { id: { exact: selectedChannelSalesChannelId.value } },
        },
      },
      fetchPolicy: 'cache-first',
    });

    if (requestId !== selectedChannelViewsRequestId) {
      return;
    }

    selectedChannelViewIds.value = data?.miraklSalesChannelViews?.edges?.map((edge: any) => edge.node.id) || [];
  } catch (_error) {
    if (requestId === selectedChannelViewsRequestId) {
      selectedChannelViewIds.value = [];
    }
  }
};

const fetchMiraklIssues = async () => {
  if (!selectedChannelViewIds.value.length || !selectedChannelRemoteProductIds.value.length) {
    miraklIssues.value = [];
    return;
  }

  miraklIssuesLoading.value = true;
  const requestId = ++miraklIssuesRequestId;

  try {
    const { data } = await apolloClient.query({
      query: miraklProductIssuesQuery,
      variables: {
        filter: {
          remoteProduct: { id: { inList: selectedChannelRemoteProductIds.value } },
          views: { id: { inList: selectedChannelViewIds.value } },
        },
      },
      fetchPolicy: 'network-only',
    });

    if (requestId !== miraklIssuesRequestId) {
      return;
    }

    miraklIssues.value = data?.miraklProductIssues?.edges?.map((edge: any) => edge.node) || [];
  } catch (_error) {
    if (requestId === miraklIssuesRequestId) {
      miraklIssues.value = [];
    }
  } finally {
    if (requestId === miraklIssuesRequestId) {
      miraklIssuesLoading.value = false;
    }
  }
};

watch(
  selectedChannelSalesChannelId,
  () => {
    void fetchSelectedChannelViews();
  },
  { immediate: true },
);

watch(
  [selectedChannelViewIds, () => props.product?.saleschannelviewassignSet],
  () => {
    void fetchMiraklIssues();
  },
  { immediate: true, deep: true },
);

const handleCategorySaved = (payload: { id: string; remoteId: string; salesChannelId: string | null }) => {
  if (!selectedChannel.value) return;
  categoriesByChannel.value = {
    ...categoriesByChannel.value,
    [payload.salesChannelId || selectedChannel.value.id]: {
      id: payload.id,
      remoteId: payload.remoteId,
      salesChannelId: payload.salesChannelId || selectedChannel.value.id,
    },
  };
};

const handleCategoryDeleted = () => {
  if (!selectedChannel.value) return;
  const fallbackId = selectedCategory.value?.salesChannelId || selectedChannel.value.id;
  categoriesByChannel.value = {
    ...categoriesByChannel.value,
    [fallbackId]: { id: null, remoteId: null, salesChannelId: fallbackId },
  };
};

const hasUnsavedChanges = computed(() => categorySectionRef.value?.hasUnsavedChanges ?? false);

const beforeMarketplaceTabChange = async (_newTab: string, _oldTab: string | null) => {
  if (!hasUnsavedChanges.value) return true;
  const res = await Swal.fire({
    icon: 'warning',
    text: t('products.products.messages.unsavedChanges'),
    showCancelButton: true,
    confirmButtonText: t('shared.button.cancel'),
    cancelButtonText: t('shared.button.leaveTab'),
  });
  return res.dismiss === Swal.DismissReason.cancel;
};

defineExpose({ hasUnsavedChanges, fetchMiraklProductCategories });
</script>

<template>
  <TabContentTemplate>
    <template #content>
      <div v-if="loadingChannels" class="py-6">
        <LocalLoader :loading="true" />
      </div>
      <div v-else-if="!channels.length" class="text-sm text-gray-600">
        {{ t('products.products.mirakl.noChannels') }}
      </div>
      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-900">
          <Icon name="circle-info" class="w-4 h-4 flex-shrink-0" />
          <span>{{ t('products.products.mirakl.categoryMappingInfo') }}</span>
        </div>
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="w-full lg:w-72 lg:flex-shrink-0">
            <MiraklMarketplaceTabs
              class="w-full"
              v-model="selectedChannelId"
              :channels="channels"
              :categories="categoriesByChannel"
              :before-change="beforeMarketplaceTabChange"
            />
          </div>
          <div class="flex-1">
            <div class="mb-4">
              <LocalLoader :loading="miraklIssuesLoading" />
              <MiraklIssuesSection
                :issues="miraklIssues"
                :integration-id="selectedChannelIntegrationId"
                :last-differential-issues-fetch="selectedChannel?.lastDifferentialIssuesFetch"
                :last-full-fetch="selectedChannel?.lastFullIssuesFetch"
              />
            </div>

            <div class="border-t my-4"></div>

            <MiraklCategorySection
              ref="categorySectionRef"
              :product-id="product.id"
              :sales-channel-id="selectedCategory?.salesChannelId || selectedChannel?.saleschannelPtr?.id || selectedChannel?.id || null"
              :channel="selectedChannel"
              :category="selectedCategory"
              :default-category="selectedDefaultCategory"
              @saved="handleCategorySaved"
              @deleted="handleCategoryDeleted"
            />
          </div>
        </div>
      </div>
    </template>
  </TabContentTemplate>
</template>
