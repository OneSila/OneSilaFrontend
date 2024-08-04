<script setup lang="ts">

import {onMounted, Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createSalesPriceListMutation } from "../../../../shared/api/mutations/salesPrices.js"
import {baseFormConfigConstructor, getFields} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const formConfig: Ref<FormConfig | null> = ref(null);
const { t } = useI18n();
const route = useRoute();

onMounted(() => {
  formConfig.value = {
      ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createSalesPriceListMutation,
      'createSalesPriceList',
      route.query.customerId ? route.query.customerId.toString() : null)
  };
});


const handleFormUpdate = async (form) => {

  if (!formConfig.value) return;

  formConfig.value.fields = getFields(
      route.query.customerId ? route.query.customerId.toString() : null,
      t,
      FormType.CREATE,
      form.autoUpdatePrices);


};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.create' }, name: t('sales.priceLists.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="formConfig"  :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
   </template>
  </GeneralTemplate>
</template>