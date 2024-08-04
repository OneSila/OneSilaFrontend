<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import {baseFormConfigConstructor, getFields} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {getSalesPriceListQuery} from "../../../../shared/api/queries/salesPrices.js";
import {updateSalesPriceListMutation} from "../../../../shared/api/mutations/salesPrices.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));
const formConfig: Ref<FormConfig | null> = ref(null);


onMounted(() => {

const baseForm = {
    ...baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updateSalesPriceListMutation,
    'updateSalesPriceList',
    route.query.customerId ? route.query.customerId.toString() : null
  ),
}

  formConfig.value = {
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
});

const handleFormUpdate = async (form) => {

  if (!formConfig.value) return;

  formConfig.value.fields = getFields(
    route.query.customerId ? route.query.customerId.toString() : null,
    t,
    FormType.EDIT,
    form.autoUpdatePrices);

}

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.edit' }, name: t('sales.priceLists.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
   </template>
  </GeneralTemplate>
</template>