<script setup lang="ts">

import {onMounted, Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormType, updateFieldConfigs} from '../../../../shared/components/organisms/general-form/formConfig';
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {useRoute} from "vue-router";
import {createShipmentMutation} from "../../../../shared/api/mutations/inventory.js";
import {getOrderQuery} from "../../../../shared/api/queries/salesOrders.js";
import apolloClient from "../../../../../apollo-client";

const formConfig: Ref<FormConfig | null> = ref(null);
const { t } = useI18n();
const route = useRoute();
const orderId = ref(route.query.orderId ? route.query.orderId.toString() : null);
const customerId = ref(null);
const fieldsToClear: Ref<string[]> = ref([]);

onMounted(() => {
  formConfig.value = {
    ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createShipmentMutation,
      'createShipment',
        orderId.value,
        route.query.source ? route.query.source.toString() : null
    ),
  };

  if (orderId.value) {
    setAddress(orderId.value)
  }

});

async function setAddress(initialOrderId: string | null) {
  const {data} = await apolloClient.query({
    query: getOrderQuery,
    variables: {id: orderId.value},
  });
  const newCustomerId = data.order.customer.id;

  if (newCustomerId !== customerId.value) {
    customerId.value = newCustomerId;

    const fieldConfigs = {
      toAddress: {
        enabled: {
          disabled: false,
          queryVariables: {filter: {company: {id: {exact: customerId.value}}}},
        },
        disabled: {
          disabled: true,
          queryVariables: null,
        },
      },
    };

    updateFieldConfigs(orderId.value, fieldConfigs, formConfig);

    if (initialOrderId !== null) {
      fieldsToClear.value = ['toAddress'];
    }
  }
}


const handleFormUpdate = async (form) => {
  fieldsToClear.value = [];

  const newOrderId = typeof form.order === 'object' && form.order !== null ? form.order.id : form.order;

  if (newOrderId !== orderId.value) {
    const initialOrderId = orderId.value;
    orderId.value = newOrderId;

    if (orderId.value) {
      await setAddress(initialOrderId);
    } else {
      customerId.value = null;
      const fieldConfigs = {
        toAddress: {
          enabled: {
            disabled: true,
            queryVariables: null,
          },
          disabled: {
            disabled: true,
            queryVariables: null,
          },
        },
      };
      updateFieldConfigs(customerId.value, fieldConfigs, formConfig);

      if (initialOrderId !== null) {
        fieldsToClear.value = ['toAddress'];
      }
    }
  }
};

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'inventory.shipments.list' }, name: t('inventory.shipments.title') },
          { path: { name: 'inventory.shipments.create' }, name: t('inventory.shipments.create.title') },
        ]"
      />
    </template>

    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" @form-updated="handleFormUpdate" :fields-to-clear="fieldsToClear" />
    </template>
  </GeneralTemplate>
</template>