<script setup lang="ts">

import {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType, updateFieldConfigs, FieldConfigs } from '../../../../shared/components/organisms/general-form/formConfig';
import { createPurchaseOrderMutation } from "../../../../shared/api/mutations/purchasing.js"
import {baseFormConfigConstructor, invoiceAddressOnTheFlyConfig, shippingAddressOnTheFlyConfig} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const route = useRoute();
const { t } = useI18n();
const supplierId = ref(null);
const querySupplierId = route.query.supplierId ? route.query.supplierId.toString() : null;


const formConfig = ref({
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPurchaseOrderMutation,
    'createPurchaseOrder',
      querySupplierId,
      route.query.source ? route.query.source.toString() : null
  ),
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.orders.list' }, name: t('purchasing.orders.title') },
                   { path: { name: 'purchasing.orders.create' }, name: t('purchasing.orders.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="querySupplierId === null" :config="formConfig as FormConfig"/>
     <GeneralForm v-else :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>