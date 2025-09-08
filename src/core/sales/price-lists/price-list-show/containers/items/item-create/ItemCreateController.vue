<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { filterAndExtractIds, FormConfig, FormType } from '../../../../../../../shared/components/organisms/general-form/formConfig';
import { createSalesPriceListItemMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { ref, onMounted, Ref} from "vue";
import { useRoute } from "vue-router";
import { baseFormConfigConstructor} from "../configs";
import apolloClient from "../../../../../../../../apollo-client";
import { getSalesPriceListQuery, salesPriceListItemsProductIdsQuery } from "../../../../../../../shared/api/queries/salesPrices.js";

const route = useRoute();
const { t } = useI18n();
const priceListId = ref(route.params.priceListId);
const productIds = ref([]);
const formConfig: Ref<any | null> = ref(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getSalesPriceListQuery,
    variables: { id: priceListId.value.toString() }
  });

  const { data: itemsData } = await apolloClient.query({
    query: salesPriceListItemsProductIdsQuery,
    variables: { filter: { salespricelist: { id: { exact: priceListId.value.toString() } } } }
  });

  if (itemsData && itemsData.salesPriceListItems) {
    productIds.value = filterAndExtractIds(itemsData.salesPriceListItems.edges, ['node', 'product', 'id']);
  }

  if (data && data.salesPriceList) {
    const autoUpdatePrices = data.salesPriceList.autoUpdatePrices;

    formConfig.value = {
      ...baseFormConfigConstructor(
        t,
        FormType.CREATE,
        createSalesPriceListItemMutation,
        'createSalesPriceListItem',
        priceListId.value.toString(),
        productIds.value,
        autoUpdatePrices,
        data.salesPriceList.currency.symbol
      ),
      submitAndContinueUrl: { name: 'sales.priceLists.items.edit', params: { priceListId: priceListId.value } }
    };
  }
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.show', params: { id: priceListId } }, name: t('sales.priceLists.show.title') },
                   { path: { name: 'sales.priceLists.items.create', params: { priceListId: priceListId } }, name: t('sales.priceLists.items.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>