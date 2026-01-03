<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { FetchPolicy } from '@apollo/client';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import apolloClient from '../../../../../../../../apollo-client';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { sheinChannelsQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import { sheinCategoriesQuery } from '../../../../../../../shared/api/queries/sheinCategories.js';
import { sheinProductCategoriesQuery, sheinProductsQuery } from '../../../../../../../shared/api/queries/sheinProducts.js';
import { sheinProductTypesForCategoryMappingQuery } from '../../../../../../../shared/api/queries/sheinProductTypes.js';
import { sheinProductIssuesQuery } from '../../../../../../../shared/api/queries/sheinProductIssues.js';
import SheinMarketplaceTabs from './components/SheinMarketplaceTabs.vue';
import SheinCategorySection from './components/SheinCategorySection.vue';
import SheinIssuesSection from './components/SheinIssuesSection.vue';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
import { sheinChannelViewsQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import SheinStatusSection from './components/SheinStatusSection.vue';
import { refreshLatestSheinIssuesMutation, updateSheinProductMutation } from '../../../../../../../shared/api/mutations/salesChannels.js';
import { createSheinProductMutation } from '../../../../../../../shared/api/mutations/sheinProducts.js';
import { Toast } from '../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../shared/utils';
import Swal from 'sweetalert2';

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const loadingChannels = ref(false);
const channels = ref<any[]>([]);
const selectedChannelId = ref<string | null>(null);
const categoriesByChannel = ref<
  Record<string, { id: string | null; remoteId: string | null; salesChannelId: string | null }>
>({});
const categorySectionRef = ref<InstanceType<typeof SheinCategorySection> | null>(null);
const defaultCategoriesByChannel = ref<
  Record<string, { remoteId: string | null; name: string | null }>
>({});

type SheinFailReasonEntry = { language?: string | null; content?: string | null };
type SheinProductIssueNode = {
  id: string;
  createdAt?: string | null;
  failedReason?: SheinFailReasonEntry[] | null;
  remoteProduct?: { id?: string | null } | null;
};

const sheinIssuesLoading = ref(false);
const sheinIssues = ref<{ id: string; createdAt?: string | null; failedReason?: SheinFailReasonEntry[] | null; storeName?: string | null }[]>([]);
const sheinViewSalesChannelByViewId = ref<Record<string, string>>({});
const sheinRemoteProductId = ref<string | null>(null);

const productTypeRuleId = computed(() => {
  const typeProp = props.product?.productpropertySet?.find((property: any) => property.property?.isProductType);
  return typeProp?.valueSelect?.productpropertiesruleSet?.[0]?.id || null;
});

const fetchSheinIssues = async () => {
  const assignments = props.product?.saleschannelviewassignSet ?? [];
  const sheinAssignments = assignments.filter((assign: any) => assign.integrationType === IntegrationTypes.Shein);
  const remoteProductIds = Array.from(
    new Set(
      sheinAssignments
        .map((assign: any) => assign?.remoteProduct?.id)
        .filter((id: any): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  if (!remoteProductIds.length) {
    sheinIssues.value = [];
    return;
  }

  const storeNameByRemoteProductId = sheinAssignments.reduce<Record<string, string>>((acc, assign: any) => {
    const id = assign?.remoteProduct?.id;
    if (typeof id === 'string' && id.length) {
      acc[id] = assign?.salesChannelView?.name || '';
    }
    return acc;
  }, {});

  sheinIssuesLoading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: sheinProductIssuesQuery,
      variables: {
        filter: {
          isActive: { exact: true },
          remoteProduct: { id: { inList: remoteProductIds } },
        },
      },
      fetchPolicy: 'network-only',
    });

    const nodes: SheinProductIssueNode[] = data?.sheinProductIssues?.edges?.map((edge: any) => edge.node) || [];
    sheinIssues.value = nodes.map((node) => ({
      id: node.id,
      createdAt: node.createdAt,
      failedReason: node.failedReason,
      storeName: (node.remoteProduct?.id && storeNameByRemoteProductId[node.remoteProduct.id]) || null,
    }));
  } finally {
    sheinIssuesLoading.value = false;
  }
};

const fetchSheinViewSalesChannelMap = async () => {
  const assignments = props.product?.saleschannelviewassignSet ?? [];
  const sheinAssignments = assignments.filter((assign: any) => assign.integrationType === IntegrationTypes.Shein);
  const viewIds = Array.from(
    new Set(
      sheinAssignments
        .map((assign: any) => assign?.salesChannelView?.id)
        .filter((id: any): id is string => typeof id === 'string' && id.length > 0),
    ),
  );

  if (!viewIds.length) {
    sheinViewSalesChannelByViewId.value = {};
    return;
  }

  try {
    const { data } = await apolloClient.query({
      query: sheinChannelViewsQuery,
      variables: {
        first: Math.min(200, viewIds.length),
        filter: { id: { inList: viewIds } },
      },
      fetchPolicy: 'cache-first',
    });

    const edges = data?.sheinSalesChannelViews?.edges ?? [];
    const map: Record<string, string> = {};
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const viewId = node?.id;
      const salesChannelId = node?.salesChannel?.id;
      if (typeof viewId === 'string' && typeof salesChannelId === 'string') {
        map[viewId] = salesChannelId;
      }
    });
    sheinViewSalesChannelByViewId.value = map;
  } catch (error) {
    sheinViewSalesChannelByViewId.value = {};
  }
};

let remoteProductRequestId = 0;
const fetchSheinRemoteProduct = async () => {
  if (!props.product?.id || !selectedSheinSalesChannelId.value) {
    sheinRemoteProductId.value = null;
    return;
  }

  const requestId = ++remoteProductRequestId;
  sheinRemoteProductId.value = null;
  try {
    const { data } = await apolloClient.query({
      query: sheinProductsQuery,
      variables: {
        first: 1,
        filter: {
          localInstance: { id: { exact: props.product.id } },
          salesChannel: { id: { exact: selectedSheinSalesChannelId.value } },
        },
      },
      fetchPolicy: 'network-only',
    });

    if (requestId !== remoteProductRequestId) {
      return;
    }

    const node = data?.sheinProducts?.edges?.[0]?.node;
    sheinRemoteProductId.value = node?.id || null;
  } catch (error) {
    if (requestId === remoteProductRequestId) {
      sheinRemoteProductId.value = null;
    }
  }
};

const fetchChannels = async () => {
  loadingChannels.value = true;
  try {
    const { data } = await apolloClient.query({
      query: sheinChannelsQuery,
      fetchPolicy: 'cache-first',
    });
    const list = data?.sheinChannels?.edges?.map((edge: any) => edge.node) || [];
    channels.value = list.sort((a: any, b: any) => (a.hostname || '').localeCompare(b.hostname || ''));
  } finally {
    loadingChannels.value = false;
  }
};

const fetchSheinProductCategories = async (fetchPolicy: FetchPolicy = 'cache-first') => {
  if (!props.product.id) {
    return;
  }
  const { data } = await apolloClient.query({
    query: sheinProductCategoriesQuery,
    variables: {
      filter: {
        product: { id: { exact: props.product.id } },
      },
    },
    fetchPolicy,
  });

  const map: Record<string, { id: string | null; remoteId: string | null; salesChannelId: string | null }> = {};
  const edges = data?.sheinProductCategories?.edges || [];
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
  return (
    categoriesByChannel.value[channelId] ||
    (ptrId ? categoriesByChannel.value[ptrId] : null) ||
    null
  );
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
          query: sheinProductTypesForCategoryMappingQuery,
          variables: {
            first: 1,
            filter: {
              localInstance: { id: { exact: productTypeRuleId.value } },
              salesChannel: { id: { exact: filterSalesChannelId } },
            },
          },
          fetchPolicy: 'cache-first',
        });

        const node = data?.sheinProductTypes?.edges?.[0]?.node;
        const remoteId = node?.categoryId || null;
        let name = null;

        if (remoteId) {
          try {
            const { data: categoryData } = await apolloClient.query({
              query: sheinCategoriesQuery,
              variables: {
                first: 1,
                filter: {
                  remoteId: { exact: remoteId },
                },
              },
              fetchPolicy: 'cache-first',
            });
            const categoryNode = categoryData?.sheinCategories?.edges?.[0]?.node;
            if (categoryNode) {
              name = categoryNode.name || remoteId;
            }
          } catch (error) {
            /* ignore */
          }
        }

        return [channelKey, { remoteId, name }] as const;
      } catch (error) {
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
  fetchChannels();
  fetchSheinProductCategories();
  fetchSheinIssues();
  fetchSheinViewSalesChannelMap();
});

watch(
  () => props.product?.saleschannelviewassignSet,
  () => {
    fetchSheinIssues();
    fetchSheinViewSalesChannelMap();
  },
  { deep: true },
);

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

const selectedSheinSalesChannelId = computed(() => selectedChannel.value?.id ?? null);

const selectedSheinRemoteProductId = computed(() => sheinRemoteProductId.value);

watch(
  [() => props.product?.id, selectedSheinSalesChannelId],
  () => {
    void fetchSheinRemoteProduct();
  },
  { immediate: true },
);

const selectedSheinSalesChannelViewId = computed(() => {
  const assignments = props.product?.saleschannelviewassignSet ?? [];
  const sheinAssignments = assignments.filter((assign: any) => assign.integrationType === IntegrationTypes.Shein);
  const targetSalesChannelId = selectedSheinSalesChannelId.value;

  if (targetSalesChannelId) {
    const match = sheinAssignments.find((assign: any) => {
      const viewId = assign?.salesChannelView?.id;
      const salesChannelId = viewId ? sheinViewSalesChannelByViewId.value[viewId] : null;
      return salesChannelId === targetSalesChannelId;
    });
    const viewId = match?.salesChannelView?.id;
    return typeof viewId === 'string' ? viewId : null;
  }

  return null;
});

const selectedCategory = computed(() => resolveCategoryForChannel(selectedChannel.value));

const selectedDefaultCategory = computed(() => {
  if (!selectedChannel.value) return null;
  return defaultCategoriesByChannel.value[selectedChannel.value.id] || null;
});

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

defineExpose({ hasUnsavedChanges, fetchSheinProductCategories });

const onFetchIssuesSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.fetchIssuesSuccess'));
  fetchSheinIssues();
};

const onForceUpdateSuccess = () => {
  Toast.success(t('integrations.salesChannel.toast.forceUpdateSuccess'));
};

const onCreateSuccess = () => {
  Toast.success(t('shared.alert.toast.submitSuccessCreate'));
  fetchSheinRemoteProduct();
};

const onError = (error) => {
  displayApolloError(error);
};
</script>

<template>
  <TabContentTemplate>
    <template #content>
      <div v-if="loadingChannels" class="py-6">
        <LocalLoader :loading="true" />
      </div>
      <div v-else-if="!channels.length" class="text-sm text-gray-600">
        {{ t('products.products.shein.noChannels') }}
      </div>
      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-900">
          <Icon name="circle-info" class="w-4 h-4 flex-shrink-0" />
          <span>{{ t('products.products.shein.categoryMappingInfo') }}</span>
        </div>
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="w-full lg:w-72 lg:flex-shrink-0">
            <SheinMarketplaceTabs
              class="w-full"
              v-model="selectedChannelId"
              :channels="channels"
              :categories="categoriesByChannel"
              :before-change="beforeMarketplaceTabChange"
            />
          </div>
          <div class="flex-1">
            <SheinStatusSection
              class="mb-4"
              :product-id="product.id"
              :sales-channel-id="selectedSheinSalesChannelId"
              :remote-product-id="selectedSheinRemoteProductId"
              :refresh-latest-shein-issues-mutation="refreshLatestSheinIssuesMutation"
              :create-shein-product-mutation="createSheinProductMutation"
              :update-shein-product-mutation="updateSheinProductMutation"
              @fetch-issues-success="onFetchIssuesSuccess"
              @create-success="onCreateSuccess"
              @force-update-success="onForceUpdateSuccess"
              @error="onError"
            />

            <div class="border-t my-4"></div>
            <SheinCategorySection
              ref="categorySectionRef"
              :product-id="product.id"
              :sales-channel-id="selectedCategory?.salesChannelId || selectedChannel?.saleschannelPtr?.id || selectedChannel?.id || null"
              :channel="selectedChannel"
              :category="selectedCategory"
              :default-category="selectedDefaultCategory"
              @saved="handleCategorySaved"
              @deleted="handleCategoryDeleted"
            />
            <div v-if="sheinIssuesLoading" class="py-6">
              <LocalLoader :loading="true" />
            </div>
            <SheinIssuesSection v-else :issues="sheinIssues" />
          </div>
        </div>
      </div>
    </template>
  </TabContentTemplate>
</template>
