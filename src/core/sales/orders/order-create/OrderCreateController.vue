<script setup lang="ts">

import  {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FieldConfigs, FormConfig, FormType, updateFieldConfigs} from '../../../../shared/components/organisms/general-form/formConfig';
import { createOrderMutation } from "../../../../shared/api/mutations/salesOrders.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";
import {invoiceAddressOnTheFlyConfig, shippingAddressOnTheFlyConfig} from "../../../purchasing/orders/configs";
import {FieldType} from "../../../../shared/utils/constants";
import {companyInvoiceAddressesQuery, companyShippingAddressesQuery} from "../../../../shared/api/queries/contacts.js";

const { t } = useI18n();
const route = useRoute();

const customerId = ref(null);
const fieldsToClear: Ref<string[] | null> = ref(null);
const queryCustomerId = route.query.customerId ? route.query.customerId.toString() : null;


const  baseForm = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createOrderMutation,
    'createOrder',
    queryCustomerId,
route.query.source ? route.query.source.toString() : null
  ),
};

const formConfig = ref(baseForm);
// const handleFormUpdate = (form) => {
//   fieldsToClear.value = []
//
//   const newCustomerId = typeof form.customer === 'object' && form.customer !== null? form.customer.id : form.customer;
//   if (newCustomerId !== customerId.value) {
//
//     const initialCustomerId = customerId.value;
//     customerId.value = newCustomerId;
//
//     const fieldConfigs: FieldConfigs = {
//       'invoiceAddress': {
//         enabled: {
//           type: FieldType.Query,
//           disabled: false,
//           labelBy: 'fullAddress',
//           valueBy: 'id',
//           query: companyInvoiceAddressesQuery,
//           dataKey: 'invoiceAddresses',
//           isEdge: true,
//           multiple: false,
//           filterable: true,
//           formMapIdentifier: 'id',
//           queryVariables: { "filter": { "company": {"id": {"exact": customerId.value }}}},
//           createOnFlyConfig: invoiceAddressOnTheFlyConfig(t, customerId.value)
//         },
//         disabled: {
//           type: FieldType.Choice,
//           disabled: true,
//           queryVariables: null,
//           createOnFlyConfig: null,
//           options: []
//         }
//       },
//       'shippingAddress': {
//         enabled: {
//           type: FieldType.Query,
//           labelBy: 'fullAddress',
//           valueBy: 'id',
//           query: companyShippingAddressesQuery,
//           dataKey: 'shippingAddresses',
//           isEdge: true,
//           multiple: false,
//           filterable: true,
//           formMapIdentifier: 'id',
//           disabled: false,
//           queryVariables: { "filter": { "company": {"id": {"exact": customerId.value }}}},
//           createOnFlyConfig: shippingAddressOnTheFlyConfig(t, customerId.value)
//         },
//         disabled: {
//           type: FieldType.Choice,
//           disabled: true,
//           queryVariables: null,
//           options: [],
//           createOnFlyConfig: null
//         }
//       }
//     };
//
//     updateFieldConfigs(customerId.value, fieldConfigs, formConfig);
//
//     if (initialCustomerId === null) {
//       return;
//     }
//     fieldsToClear.value = ['invoiceAddress', 'shippingAddress']
//   }
// };

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.create' }, name: t('sales.orders.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="queryCustomerId == null" :config="formConfig as FormConfig"/>
     <GeneralForm v-else :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
   </template>
  </GeneralTemplate>
</template>