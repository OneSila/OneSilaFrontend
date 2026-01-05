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
import { ref } from "vue";
import apolloClient from "../../../../../apollo-client";
import { Toast } from "../../../../shared/modules/toast";
import { assignEanCodesMutation } from "../../../../shared/api/mutations/eanCodes.js";
import { bulkRefreshInspectorMutation } from "../../../../shared/api/mutations/products.js";
import { BulkProductPropertyAssigner } from "../../../../shared/components/organisms/bulk=product-property-assigner";
import { BulkProductWebsiteAssigner } from "../../../../shared/components/organisms/bulk=product-website-assigner";

const { t } = useI18n();

const auth = injectAuth();
const searchConfig = searchConfigConstructor(t, auth.user.company?.hasAmazonIntegration);
const listingConfig = listingConfigConstructor(t, true);
const generalListingRef = ref<any>(null);

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
          <div class="flex items-center space-x-2">
            <AiBulkTranslator
              :type="'products'"
              :selected-entities="selectedEntities"
              @started="clearSelection"
            />

            <BulkProductPropertyAssigner
              :selected-entities="selectedEntities"
              @started="clearSelection"
            />

            <BulkProductWebsiteAssigner
              :selected-entities="selectedEntities"
              @started="clearSelection"
            />

            <AdvancedContentGenerator
              :product-ids="selectedEntities"
              :use-default-button-styles="false"
              btn-class="inline-flex items-center rounded bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-800 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-100 whitespace-nowrap"
              icon-class="text-indigo-600"
              @started="clearSelection"
            />

            <button
              class="inline-flex items-center rounded bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-800 shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-100 disabled:opacity-50"
              :disabled="!selectedEntities.length"
              @click="handleBulkAssign(selectedEntities)"
            >
              <Icon name="barcode" size="sm" class="mr-2 text-blue-600" />
              {{ t('products.eanCodes.labels.assignBulk') }}
            </button>

            <button
              class="inline-flex items-center rounded bg-amber-50 px-4 py-1 text-sm font-semibold text-amber-800 shadow-sm ring-1 ring-inset ring-amber-300 hover:bg-amber-100 disabled:opacity-50"
              :disabled="!selectedEntities.length"
              @click="handleBulkRefreshInspector(selectedEntities)"
            >
              <Icon name="refresh" size="sm" class="mr-2 text-amber-600" />
              {{ t('products.products.inspector.actions.bulkRefresh') }}
            </button>
          </div>
        </template>
    </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
