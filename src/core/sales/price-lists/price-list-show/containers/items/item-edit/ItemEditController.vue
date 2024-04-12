<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import { Ref, ref, onMounted } from "vue";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import {filterAndExtractIds, FormConfig, FormType} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { baseFormConfigConstructor } from "../configs";
import { getSalesPriceListItemQuery, getSalesPriceListQuery } from "../../../../../../../shared/api/queries/salesPrices.js";
import { updateSalesPriceListItemMutation } from "../../../../../../../shared/api/mutations/salesPrices.js";
import apolloClient from '../../../../../../../../apollo-client';


const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const priceListId = ref(route.params.priceListId);
const productIds = ref([]);
const formConfig: Ref<any| null> = ref(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getSalesPriceListQuery,
    variables: { id: priceListId.value.toString() }
  });

  if (data && data.salesPriceList) {
    const autoUpdatePrice = data.salesPriceList.autoUpdate;

    productIds.value = filterAndExtractIds(
      data.salesPriceList.salespricelistitemSet,
      ['product', 'id'],
      ['id'],
      id.value.toString()
    );


    const baseForm = baseFormConfigConstructor(
      t,
      FormType.EDIT,
      updateSalesPriceListItemMutation,
      'updateSalesPriceListItem',
      priceListId.value.toString(),
      autoUpdatePrice,
      productIds.value
    );

    formConfig.value = {
      ...baseForm,
      mutationId: id.value.toString(),
      query: getSalesPriceListItemQuery,
      queryVariables: { id: id.value },
      queryDataKey: 'salesPriceListItem',
      fields: [
        {
          type: FieldType.Hidden,
          name: 'id',
          value: id.value.toString()
        },
        ...baseForm.fields
      ]
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
                   { path: { name: 'sales.priceLists.items.edit', params: { priceListId: priceListId, id: id } }, name: t('sales.priceLists.items.edit.title') }]" />
    </template>

   <template v-slot:content>
      <div class="p-2" v-if="formConfig !== null">
        <GeneralForm :config="formConfig as FormConfig" />
      </div>
   </template>
  </GeneralTemplate>

</template>