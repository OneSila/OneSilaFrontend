<script setup lang="ts">

import  {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createSalesPriceListMutation } from "../../../../shared/api/mutations/salesPrices.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
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
      <Card class="p-2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>