<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Icon } from "../../../../shared/components/atoms/icon";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from "../configs";
import { injectAuth } from "../../../../shared/modules/auth";
import { AiBulkTranslator } from "../../../../shared/components/organisms/ai-bulk=translator";
import { AdvancedContentGenerator } from "../../../../shared/components/organisms/advanced-content-generator";
import ProductContentImportModal from "../../../../shared/components/organisms/import-content/ProductContentImportModal.vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import apolloClient from "../../../../../apollo-client";
import { Toast } from "../../../../shared/modules/toast";
import { assignEanCodesMutation } from "../../../../shared/api/mutations/eanCodes.js";
import { bulkRefreshInspectorMutation } from "../../../../shared/api/mutations/products.js";
import { integrationsQuery } from "../../../../shared/api/queries/integrations.js";
import { BulkProductPropertyAssigner } from "../../../../shared/components/organisms/bulk=product-property-assigner";
import { BulkProductWebsiteAssigner } from "../../../../shared/components/organisms/bulk=product-website-assigner";
import { IntegrationTypes } from "../../../integrations/integrations/integrations";

const { t } = useI18n();

const auth = injectAuth();
const searchConfig = searchConfigConstructor(t, auth.user.company?.hasAmazonIntegration);
const listingConfig = listingConfigConstructor(t, true);
const generalListingRef = ref<any>(null);
const salesChannels = ref<any[]>([]);
const bulkActionsVisibleCount = ref(1);
const bulkActionsIndex = ref(0);
const bulkActionsTotal = 7;

const updateBulkActionsVisibleCount = () => {
  const width = window.innerWidth;
  let count = 1;

  if (width >= 1536) {
    count = bulkActionsTotal;
  } else if (width >= 1280) {
    count = 5;
  } else if (width >= 1024) {
    count = 4;
  } else if (width >= 768) {
    count = 2;
  } else if (width >= 640) {
    count = 1;
  }

  bulkActionsVisibleCount.value = Math.min(count, bulkActionsTotal);
  bulkActionsIndex.value = Math.min(bulkActionsIndex.value, Math.max(0, bulkActionsTotal - bulkActionsVisibleCount.value));
};

const bulkActionsMaxStart = computed(() => Math.max(0, bulkActionsTotal - bulkActionsVisibleCount.value));
const showBulkArrows = computed(() => bulkActionsTotal > bulkActionsVisibleCount.value);
const canBulkScrollLeft = computed(() => bulkActionsIndex.value > 0);
const canBulkScrollRight = computed(() => bulkActionsIndex.value < bulkActionsMaxStart.value);

const scrollBulkActions = (direction: -1 | 1) => {
  bulkActionsIndex.value = Math.min(
    Math.max(0, bulkActionsIndex.value + direction),
    bulkActionsMaxStart.value
  );
};

const isBulkActionVisible = (index: number) =>
  index >= bulkActionsIndex.value && index < bulkActionsIndex.value + bulkActionsVisibleCount.value;

const clearSelection = () => {
  generalListingRef.value?.clearSelected?.()
}

const handleBulkAssign = async (selectedEntities: any[]) => {
  const products = selectedEntities.map((entity) => ({
    id: entity,
  }));

  if (!products.length) return;

  try {
    const { data } = await apolloClient.mutate({
      mutation: assignEanCodesMutation,
      variables: { data: { products } },
    });

    const assigned = data?.assignEanCodes?.length || 0;

    if (assigned > 0) {
      Toast.success(t('products.eanCodes.alert.toast.success.assignBulk', { count: assigned }));
    } else {
      Toast.error(t('products.eanCodes.alert.toast.warning.noAvailable'));
    }

    clearSelection();
  } catch (e) {
    Toast.error(t('products.eanCodes.alert.toast.error.assignBulk'));
    console.error(e);
  }
};

const handleBulkRefreshInspector = async (selectedEntities: string[]) => {
  const products = selectedEntities.map((entity) => ({
    id: entity,
  }));

  if (!products.length) return;

  try {
    const { data } = await apolloClient.mutate({
      mutation: bulkRefreshInspectorMutation,
      variables: { instance: { products } },
    });

    if (data?.bulkRefreshInspector) {
      Toast.success(t('products.products.inspector.alert.bulkRefreshSuccess'));
      clearSelection();
    } else {
      Toast.error(t('products.products.inspector.alert.bulkRefreshError'));
    }
  } catch (e) {
    Toast.error(t('products.products.inspector.alert.bulkRefreshError'));
    console.error(e);
  }
};

const loadSalesChannels = async () => {
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'cache-first' });
    salesChannels.value = data?.integrations.edges
      .map((e: any) => e.node)
      .filter((c: any) => c.type !== IntegrationTypes.Webhook) || [];
  } catch (e) {
    console.error('Failed to load sales channels', e);
  }
};

onMounted(() => {
  loadSalesChannels();
  updateBulkActionsVisibleCount();
  window.addEventListener('resize', updateBulkActionsVisibleCount);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateBulkActionsVisibleCount);
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'products.products.list' }, name: t('products.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'products.products.create' }">
          <Button type="button" class="btn btn-primary">
              {{  t('products.products.create.title') }}
          </Button>
        </Link>
      </div>
    </template>


    <template v-slot:content>
     <GeneralListing
           ref="generalListingRef"
           :searchConfig="searchConfig"
           :config="listingConfig"
           :query="listingQuery"
           :query-key="listingQueryKey"
          >
        <template #bulkActions="{ selectedEntities }">
          <div class="flex items-center gap-2 py-1 pr-2">
            <button
              v-if="showBulkArrows"
              type="button"
              class="inline-flex items-center rounded bg-white p-1 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!canBulkScrollLeft"
              :aria-label="t('shared.button.back')"
              @click="scrollBulkActions(-1)"
            >
              <Icon name="chevron-left" size="sm" aria-hidden="true" />
            </button>

            <div class="flex items-center gap-2">
              <div v-show="isBulkActionVisible(0)">
                <AiBulkTranslator
                  :type="'products'"
                  :selected-entities="selectedEntities"
                  @started="clearSelection"
                />
              </div>

              <div v-show="isBulkActionVisible(1)">
                <BulkProductPropertyAssigner
                  :selected-entities="selectedEntities"
                  @started="clearSelection"
                />
              </div>

              <div v-show="isBulkActionVisible(2)">
                <BulkProductWebsiteAssigner
                  :selected-entities="selectedEntities"
                  @started="clearSelection"
                />
              </div>

              <div v-show="isBulkActionVisible(3)">
                <AdvancedContentGenerator
                  :product-ids="selectedEntities"
                  :use-default-button-styles="false"
                  btn-class="inline-flex items-center rounded bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-800 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-100 whitespace-nowrap"
                  icon-class="text-indigo-600"
                  @started="clearSelection"
                />
              </div>

              <div v-show="isBulkActionVisible(4)">
                <ProductContentImportModal
                  :product-ids="selectedEntities"
                  :current-language="null"
                  :current-sales-channel="null"
                  :sales-channels="salesChannels"
                  :use-default-button-styles="false"
                  btn-class="inline-flex items-center rounded bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-800 shadow-sm ring-1 ring-inset ring-emerald-300 hover:bg-emerald-100 disabled:opacity-50 whitespace-nowrap"
                  icon-name="file-import"
                  icon-class="text-emerald-600 mr-2"
                  @imported="clearSelection"
                />
              </div>

              <div v-show="isBulkActionVisible(5)">
                <button
                  class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100 disabled:opacity-50"
                  :disabled="!selectedEntities.length"
                  @click="handleBulkAssign(selectedEntities)"
                >
                  <Icon name="barcode" size="sm" class="mr-2 text-blue-600" />
                  {{ t('products.eanCodes.labels.assignBulk') }}
                </button>
              </div>

              <div v-show="isBulkActionVisible(6)">
                <button
                  class="inline-flex items-center rounded bg-amber-50 px-4 py-1 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-100 disabled:opacity-50"
                  :disabled="!selectedEntities.length"
                  @click="handleBulkRefreshInspector(selectedEntities)"
                >
                  <Icon name="refresh" size="sm" class="mr-2 text-amber-600" />
                  {{ t('products.products.inspector.actions.bulkRefresh') }}
                </button>
              </div>
            </div>

            <button
              v-if="showBulkArrows"
              type="button"
              class="inline-flex items-center rounded bg-white p-1 text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="!canBulkScrollRight"
              :aria-label="t('shared.button.next')"
              @click="scrollBulkActions(1)"
            >
              <Icon name="chevron-right" size="sm" aria-hidden="true" />
            </button>
          </div>
        </template>
    </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
