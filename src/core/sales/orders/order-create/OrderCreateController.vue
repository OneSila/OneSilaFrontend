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

const handleFormUpdate = (form) => {
  fieldsToClear.value = []
  if (form.customer !== customerId.value) {

    customerId.value = form.customer;

    const fieldConfigs: FieldConfigs = {
      'invoiceAddress': {
        enabled: {
          disabled: false,
          queryVariables: { "filter": { "company": {"id": {"exact": customerId.value }}}},
          createOnFlyConfig: invoiceAddressOnTheFlyConfig(t, customerId.value)
        },
        disabled: {
          disabled: true,
          queryVariables: null,
          createOnFlyConfig: null
        }
      },
      'shippingAddress': {
        enabled: {
          disabled: false,
          queryVariables: { "filter": { "company": {"id": {"exact": customerId.value }}}},
          createOnFlyConfig: shippingAddressOnTheFlyConfig(t, customerId.value)
        },
        disabled: {
          disabled: true,
          queryVariables: null,
          createOnFlyConfig: null
        }
      }
    };

    updateFieldConfigs(customerId.value, fieldConfigs, formConfig);
    fieldsToClear.value = ['invoiceAddress', 'shippingAddress']
  }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.create' }, name: t('sales.orders.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="queryCustomerId == null" :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
     <GeneralForm v-else :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>