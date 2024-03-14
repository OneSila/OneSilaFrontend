<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
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

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.edit' }, name: t('sales.orders.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>