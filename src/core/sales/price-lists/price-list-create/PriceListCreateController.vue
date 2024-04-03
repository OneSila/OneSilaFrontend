<script setup lang="ts">

import  { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createSalesPriceListMutation } from "../../../../shared/api/mutations/salesPrices.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const { t } = useI18n();
const route = useRoute();

const baseForm = {
      ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createSalesPriceListMutation,
      'createSalesPriceList',
      route.query.customerId ? route.query.customerId.toString() : null
    ),
  }

const formConfig = ref(baseForm);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.priceLists.list' }, name: t('sales.priceLists.title') },
                   { path: { name: 'sales.priceLists.create' }, name: t('sales.priceLists.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>