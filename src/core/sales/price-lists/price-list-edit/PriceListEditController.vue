<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {getSalesPriceListQuery} from "../../../../shared/api/queries/salesPrices.js";
import {updateSalesPriceListMutation} from "../../../../shared/api/mutations/salesPrices.js";


const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = {
    ...baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updateSalesPriceListMutation,
    'updateSalesPriceList',
    route.query.customerId ? route.query.customerId.toString() : null
  ),
}

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getSalesPriceListQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'salesPriceList',
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: id.value.toString()
    },
    ...baseForm.fields
  ]
};

const date = ref([]);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.edit' }, name: t('sales.priceLists.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>