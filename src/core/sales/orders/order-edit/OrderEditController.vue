<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FieldConfigs, FormConfig, FormType, updateFieldConfigs} from "../../../../shared/components/organisms/general-form/formConfig";
import {FieldType, OrderStatus} from "../../../../shared/utils/constants";
import {baseFormConfigConstructor, getCurrentStatusOptions} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {getOrderQuery} from "../../../../shared/api/queries/salesOrders.js";
import {updateOrderMutation} from "../../../../shared/api/mutations/salesOrders.js";
import {invoiceAddressOnTheFlyConfig, shippingAddressOnTheFlyConfig} from "../../../purchasing/orders/configs";
import apolloClient from "../../../../../apollo-client";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const customerId = ref(null);
const statusFieldUpdated = ref(false);
const fieldsToClear: Ref<string[] | null> = ref(null);
const formConfig: Ref<FormConfig | null> = ref(null);
const queryCustomerId = route.query.customerId ? route.query.customerId.toString() : null;

onMounted(async () => {

  const { data } = await apolloClient.query({
    query: getOrderQuery,
    variables: { id: id.value },
  });

  console.log()
  const baseForm = {
  ...baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updateOrderMutation,
    'updateOrder',
    data['order'].customer.id,
route.query.source ? route.query.source.toString() : null
  ),
};

formConfig.value = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getOrderQuery,
  queryVariables: { id: id.value },
  queryData: data,
  queryDataKey: 'order',
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

const handleFormUpdate = (form) => {
  fieldsToClear.value = []

  const newCustomerId = typeof form.customer === 'object' && form.customer !== null? form.customer.id : form.customer;
  if (newCustomerId !== customerId.value) {
    const initialCustomerId = customerId.value;
    customerId.value = newCustomerId;

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

    // we don't want to clear the values on render
    if (initialCustomerId === null) {
      return;
    }
    fieldsToClear.value = ['invoiceAddress', 'shippingAddress']
  }

    if (!statusFieldUpdated.value && formConfig.value) {
      statusFieldUpdated.value = true;
      const currentStatus = form.status;
      const statusFieldIndex = formConfig.value.fields.findIndex(field => field.name === 'status');

    if (statusFieldIndex !== -1) {
      const statusField = formConfig.value.fields[statusFieldIndex];

      if (statusField.type === FieldType.Choice) {
        const newStatuses = getCurrentStatusOptions(t, currentStatus);

        formConfig.value.fields[statusFieldIndex] = {
          ...statusField,
          options: newStatuses,
          disabled: [OrderStatus.DONE, OrderStatus.CANCELLED].includes(currentStatus),
        };
      }
    }

  }

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
     <div v-if="formConfig">
       <GeneralForm v-if="queryCustomerId == null" :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" />
       <GeneralForm v-else :config="formConfig as FormConfig" />
     </div>
   </template>
  </GeneralTemplate>
</template>