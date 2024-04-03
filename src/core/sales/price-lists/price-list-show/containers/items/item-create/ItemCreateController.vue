<script setup lang="ts">

import { useI18n} from 'vue-i18n';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../../../../shared/components/organisms/general-form/formConfig';
import { createSalesPriceListItemMutation } from "../../../../../../../shared/api/mutations/salesPrices.js"
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { ref} from "vue";
import { useRoute, useRouter } from "vue-router";
import { baseFormConfigConstructor} from "../configs";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const priceListId = ref(route.params.priceListId);

const formConfig = {
    ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createSalesPriceListItemMutation,
      'createSalesPriceListItem',
      priceListId.value.toString(),
    ),
    submitAndContinueUrl: { name: 'sales.priceLists.items.edit', params: { priceListId: priceListId.value } }
  };


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
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>