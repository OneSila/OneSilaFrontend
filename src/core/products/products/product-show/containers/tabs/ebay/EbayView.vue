<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import apolloClient from '../../../../../../../../apollo-client';
import { ebayChannelViewsQuery, ebayProductTypesQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import { ebayProductCategoriesQuery } from '../../../../../../../shared/api/queries/ebayProducts.js';
import { ebayCategoriesQuery } from '../../../../../../../shared/api/queries/ebayCategories.js';
import EbayMarketplaceTabs from './components/EbayMarketplaceTabs.vue';
import EbayCategorySection from './components/EbayCategorySection.vue';
import type { FetchPolicy } from '@apollo/client';
import { Icon } from '../../../../../../../shared/components/atoms/icon';

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const loadingViews = ref(false);
const views = ref<any[]>([]);
const selectedViewId = ref<string | null>(null);
const categoriesByView = ref<
  Record<string, { id: string | null; remoteId: string | null; salesChannelId: string | null }>
>({});
const categorySectionRef = ref<InstanceType<typeof EbayCategorySection> | null>(null);
const defaultCategoriesByView = ref<
  Record<string, { remoteId: string | null; name: string | null }>
>({});

const productTypeRuleId = computed(() => {
  const typeProp = props.product?.productpropertySet?.find((property: any) => property.property?.isProductType);
  return typeProp?.valueSelect?.productpropertiesruleSet?.[0]?.id || null;
});

const fetchViews = async () => {
  loadingViews.value = true;
  try {
    const { data } = await apolloClient.query({
      query: ebayChannelViewsQuery,
      fetchPolicy: 'cache-first',
    });
    const list = data?.ebaySalesChannelViews?.edges?.map((edge: any) => edge.node) || [];
    views.value = list.sort((a: any, b: any) => {
      if (a.isDefault === b.isDefault) return 0;
      return a.isDefault ? -1 : 1;
    });
  } finally {
    loadingViews.value = false;
  }
};

const fetchEbayProductCategories = async (fetchPolicy: FetchPolicy = 'cache-first') => {
  if (!props.product.id) {
    return;
  }
  const { data } = await apolloClient.query({
    query: ebayProductCategoriesQuery,
    variables: {
      filter: {
        product: { id: { exact: props.product.id } },
      },
    },
    fetchPolicy,
  });
  const map: Record<string, { id: string | null; remoteId: string | null; salesChannelId: string | null }> = {};
  const edges = data?.ebayProductCategories?.edges || [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const viewId = node?.view?.id;
    if (viewId) {
      map[viewId] = {
        id: node.id,
        remoteId: node.remoteId,
        salesChannelId: node.salesChannel?.id || null,
      };
    }
  });
  categoriesByView.value = map;
};

let defaultCategoriesRequestId = 0;
const fetchDefaultCategories = async () => {
  if (!productTypeRuleId.value || !views.value.length) {
    defaultCategoriesByView.value = {};
    return;
  }

  const requestId = ++defaultCategoriesRequestId;
  const entries = await Promise.all(
    views.value.map(async (view: any) => {
      if (!view?.id) {
        return [view?.id ?? '', { remoteId: null, name: null }] as const;
      }

      try {
        const { data } = await apolloClient.query({
          query: ebayProductTypesQuery,
          variables: {
            first: 1,
            filter: {
              localInstance: { id: { exact: productTypeRuleId.value } },
              marketplace: { id: { exact: view.id } },
            },
          },
          fetchPolicy: 'cache-first',
        });

        const node = data?.ebayProductTypes?.edges?.[0]?.node;
        const remoteId = node?.remoteId || null;
        let name = node?.translatedName || node?.name || null;

        if (remoteId && view.defaultCategoryTreeId) {
          try {
            const { data: categoryData } = await apolloClient.query({
              query: ebayCategoriesQuery,
              variables: {
                filter: {
                  marketplaceDefaultTreeId: { exact: view.defaultCategoryTreeId },
                  remoteId: { exact: remoteId },
                },
              },
              fetchPolicy: 'cache-first',
            });
            const categoryNode = categoryData?.ebayCategories?.edges?.[0]?.node;
            if (categoryNode) {
              name = categoryNode.fullName || categoryNode.name || name;
            }
          } catch (error) {
            /* ignore */
          }
        }

        return [view.id, { remoteId, name }] as const;
      } catch (error) {
        return [view.id, { remoteId: null, name: null }] as const;
      }
    }),
  );

  if (requestId !== defaultCategoriesRequestId) {
    return;
  }

  const map: Record<string, { remoteId: string | null; name: string | null }> = {};
  entries.forEach(([viewId, info]) => {
    if (viewId) {
      map[viewId] = info;
    }
  });
  defaultCategoriesByView.value = map;
};

onMounted(() => {
  fetchViews();
  fetchEbayProductCategories();
});

watch(
  views,
  (list) => {
    if (!list.length) {
      selectedViewId.value = null;
      return;
    }
    if (selectedViewId.value && list.some((view) => view.id === selectedViewId.value)) {
      return;
    }
    const defaultView = list.find((view: any) => view.isDefault);
    selectedViewId.value = defaultView?.id || list[0].id;
  },
  { immediate: true },
);

watch(
  [views, productTypeRuleId],
  () => {
    void fetchDefaultCategories();
  },
  { immediate: true },
);

const selectedView = computed(() =>
  views.value.find((view: any) => view.id === selectedViewId.value) || null,
);

const selectedCategory = computed(() => {
  if (!selectedView.value) return null;
  return categoriesByView.value[selectedView.value.id] || null;
});

const selectedDefaultCategory = computed(() => {
  if (!selectedView.value) return null;
  return defaultCategoriesByView.value[selectedView.value.id] || null;
});

const handleCategorySaved = (
  payload: { id: string; remoteId: string; salesChannelId: string | null }
) => {
  if (!selectedView.value) return;
  categoriesByView.value = {
    ...categoriesByView.value,
    [selectedView.value.id]: {
      id: payload.id,
      remoteId: payload.remoteId,
      salesChannelId: payload.salesChannelId || selectedView.value.salesChannel?.id || null,
    },
  };
};

const handleCategoryDeleted = () => {
  if (!selectedView.value) return;
  categoriesByView.value = {
    ...categoriesByView.value,
    [selectedView.value.id]: { id: null, remoteId: null, salesChannelId: null },
  };
};

const hasUnsavedChanges = computed(
  () => categorySectionRef.value?.hasUnsavedChanges ?? false,
);

defineExpose({ hasUnsavedChanges, fetchEbayProductCategories });
</script>

<template>
  <TabContentTemplate>
    <template #content>
      <div v-if="loadingViews" class="py-6">
        <LocalLoader :loading="true" />
      </div>
      <div v-else-if="!views.length" class="text-sm text-gray-600">
        {{ t('products.products.ebay.noViews') }}
      </div>
      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-900">
          <Icon name="circle-info" class="w-4 h-4 flex-shrink-0" />
          <span>{{ t('products.products.ebay.categoryMappingInfo') }}</span>
        </div>
        <div class="flex flex-col lg:flex-row gap-6">
          <div class="w-full lg:w-72 lg:flex-shrink-0">
            <EbayMarketplaceTabs
              class="w-full"
              v-model="selectedViewId"
              :views="views"
              :categories="categoriesByView"
            />
          </div>
          <div class="flex-1">
            <EbayCategorySection
              ref="categorySectionRef"
              :product-id="product.id"
              :sales-channel-id="selectedCategory?.salesChannelId || selectedView?.salesChannel?.id || null"
              :view="selectedView"
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
