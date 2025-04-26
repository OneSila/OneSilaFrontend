<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from "../configs";
import { AiBulkTranslator } from "../../../../shared/components/organisms/ai-bulk=translator";
import { ref } from "vue";
import apolloClient from "../../../../../apollo-client";
import { Toast } from "../../../../shared/modules/toast";
import { assignEanCodesMutation } from "../../../../shared/api/mutations/eanCodes.js";

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
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

            <button
              class="text-center bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 text-sm font-medium disabled:opacity-50 font-semibold"
              :disabled="!selectedEntities.length"
              @click="handleBulkAssign(selectedEntities)"
            >
              {{ t('products.eanCodes.labels.assignBulk') }}
            </button>
          </div>
        </template>
    </GeneralListing>
    </template>
  </GeneralTemplate>
</template>