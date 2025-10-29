<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import apolloClient from '../../../../../../../../apollo-client';
import { ebayChannelViewsQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import { ebayProductCategoriesQuery } from '../../../../../../../shared/api/queries/ebayProducts.js';
import EbayMarketplaceTabs from './components/EbayMarketplaceTabs.vue';
import EbayCategorySection from './components/EbayCategorySection.vue';
import type { FetchPolicy } from '@apollo/client';

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const loadingViews = ref(false);
const views = ref<any[]>([]);
const selectedViewId = ref<string | null>(null);
const categoriesByView = ref<Record<string, { id: string | null; remoteId: string | null }>>({});
const categorySectionRef = ref<InstanceType<typeof EbayCategorySection> | null>(null);

const fetchViews = async () => {
  loadingViews.value = true;
  try {
    const { data } = await apolloClient.query({
      query: ebayChannelViewsQuery,
      fetchPolicy: 'cache-first',
    });
    views.value = data?.ebaySalesChannelViews?.edges?.map((edge: any) => edge.node) || [];
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
  const map: Record<string, { id: string | null; remoteId: string | null }> = {};
  const edges = data?.ebayProductCategories?.edges || [];
  edges.forEach((edge: any) => {
    const node = edge?.node;
    const viewId = node?.view?.id;
    if (viewId) {
      map[viewId] = {
        id: node.id,
        remoteId: node.remoteId,
      };
    }
  });
  categoriesByView.value = map;
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

const selectedView = computed(() =>
  views.value.find((view: any) => view.id === selectedViewId.value) || null,
);

const selectedCategory = computed(() => {
  if (!selectedView.value) return null;
  return categoriesByView.value[selectedView.value.id] || null;
});

const handleCategorySaved = (payload: { id: string; remoteId: string }) => {
  if (!selectedView.value) return;
  categoriesByView.value = {
    ...categoriesByView.value,
    [selectedView.value.id]: {
      id: payload.id,
      remoteId: payload.remoteId,
    },
  };
};

const handleCategoryDeleted = () => {
  if (!selectedView.value) return;
  categoriesByView.value = {
    ...categoriesByView.value,
    [selectedView.value.id]: { id: null, remoteId: null },
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
      <div v-else class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-1/3">
          <EbayMarketplaceTabs
            v-model="selectedViewId"
            :views="views"
            :categories="categoriesByView"
          />
        </div>
        <div class="lg:w-2/3">
          <EbayCategorySection
            ref="categorySectionRef"
            :product-id="product.id"
            :sales-channel-id="selectedView?.salesChannel?.id || null"
            :view="selectedView"
            :category="selectedCategory"
            @saved="handleCategorySaved"
            @deleted="handleCategoryDeleted"
          />
        </div>
      </div>
    </template>
  </TabContentTemplate>
</template>
