<script setup lang="ts">

import  {Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createOrderMutation } from "../../../../shared/api/mutations/salesOrders.js"
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";

const { t } = useI18n();
const route = useRoute();

const customerId = ref(null);
const fieldsToClear: Ref<string[] | null> = ref(null);


const  baseForm = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createOrderMutation,
    'createOrder',
    route.query.customerId ? route.query.customerId.toString() : null
  ),
};

const formConfig = ref(baseForm);

// @TODO MAKE THIS WORK
const handleFormUpdate = (form) => {
  if (form.customer !== customerId.value) {
    customerId.value = form.customer;

    const invoiceAddressField = formConfig.value.fields.find(field => field.name === 'invoiceAddress');
    const shippingAddressField = formConfig.value.fields.find(field => field.name === 'shippingAddress');

    if (invoiceAddressField && shippingAddressField) {
      if (customerId.value) {
        invoiceAddressField.disabled = false;
        shippingAddressField.disabled = false;
        invoiceAddressField['queryVariables'] = { "filter": { "customer": {"id": {"exact": customerId.value }}}};
        shippingAddressField['queryVariables'] = { "filter": { "customer": {"id": {"exact": customerId.value }}}};
      } else {
        invoiceAddressField.disabled = true;
        shippingAddressField.disabled = true;
        delete invoiceAddressField['queryVariables'];
        delete shippingAddressField['queryVariables'];
      }
    }

    // This will clear the form values for the following fields so if we change the customer id we will clear the addresses id's
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
      <Card class="p-2">
        <GeneralForm :config="formConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
      </Card>
   </template>
  </GeneralTemplate>
</template>