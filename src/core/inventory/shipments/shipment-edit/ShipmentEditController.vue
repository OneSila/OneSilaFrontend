<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormType, updateFieldConfigs} from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import {baseFormConfigConstructor, getFields, getShipmentStatusOptions, ShipmentStatus} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import {getShipmentQuery} from "../../../../shared/api/queries/inventory.js";
import {updateShipmentMutation} from "../../../../shared/api/mutations/inventory.js";
import {getOrderQuery} from "../../../../shared/api/queries/salesOrders.js";
import apolloClient from "../../../../../apollo-client";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const formConfig: Ref<FormConfig | null> = ref(null);
const statusFieldUpdated = ref(false);
const currentFormStatus = ref(null);
const fieldsToClear: Ref<string[]> = ref([]);

const orderId = ref(route.query.orderId ? route.query.orderId.toString() : null);
const customerId = ref(null);

onMounted(() => {
  const baseForm = {
    ...baseFormConfigConstructor(
      t,
      FormType.EDIT,
      updateShipmentMutation,
      'updateShipment',
      orderId.value,
route.query.source ? route.query.source.toString() : null
    ),
  };

  formConfig.value = {
    ...baseForm,
    mutationId: id.value,
    query: getShipmentQuery,
    queryVariables: { id: id.value },
    queryDataKey: 'shipment',
    fields: [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: id.value,
      },
      ...baseForm.fields,
    ],
  };
});


const updateStatusState  = (currentStatus) => {
    if (!formConfig.value) {
      return
    }

    const isNotDraft = currentStatus !== ShipmentStatus.DRAFT;

    const allowedStatusTransitions = {
    [ShipmentStatus.DRAFT]: [ShipmentStatus.DRAFT, ShipmentStatus.TODO, ShipmentStatus.CANCELLED],
    [ShipmentStatus.TODO]: [ShipmentStatus.TODO, ShipmentStatus.IN_PROGRESS],
    [ShipmentStatus.IN_PROGRESS]: [ShipmentStatus.IN_PROGRESS, ShipmentStatus.DONE, ShipmentStatus.CANCELLED],
    [ShipmentStatus.DONE]: [ShipmentStatus.DONE],
    [ShipmentStatus.CANCELLED]: [ShipmentStatus.CANCELLED],
  };

  const statusFieldIndex = formConfig.value.fields.findIndex(field => field.name === 'status');
  if (statusFieldIndex !== -1 && formConfig.value) {
    const allowedStatuses = allowedStatusTransitions[currentStatus] || [];
    const allStatusOptions = getShipmentStatusOptions(t);
    const options = allStatusOptions.filter(option => allowedStatuses.includes(option.code));

    const statusField = formConfig.value.fields[statusFieldIndex];
    if (statusField.type === FieldType.Choice) {
      formConfig.value.fields[statusFieldIndex] = {
          ...statusField,
        options: options,
        disabled: [ShipmentStatus.DONE, ShipmentStatus.CANCELLED].includes(currentStatus),
      };
    }
  }

  const fieldsToDisable = ['fromAddress', 'toAddress'];

  if (formConfig.value) {
    fieldsToDisable.forEach(fieldName => {
      const fieldIndex = formConfig.value!.fields.findIndex(field => field.name === fieldName);
      if (fieldIndex !== -1) {
        formConfig.value!.fields[fieldIndex] = {
          ...formConfig.value!.fields[fieldIndex],
          disabled: isNotDraft,
        };
      }
    });
  }

}

const handleOnSubmit = () => {
  updateStatusState(currentFormStatus.value)
}

const handleFormUpdate = async (form) => {
  fieldsToClear.value = [];

  const currentStatus = form.status;
  currentFormStatus.value = currentStatus;
  const isNotDraft = currentStatus !== ShipmentStatus.DRAFT;

  if (!statusFieldUpdated.value) {
    updateStatusState(currentStatus)
    statusFieldUpdated.value = true;
  }

  if (!isNotDraft) {
    const newOrderId = typeof form.order === 'object' && form.order !== null ? form.order.id : form.order;

    if (newOrderId !== orderId.value) {
      const initialOrderId = orderId.value;
      orderId.value = newOrderId;

      if (orderId.value) {
        const { data } = await apolloClient.query({
          query: getOrderQuery,
          variables: { id: orderId.value },
        });
        const newCustomerId = data.order.customer.id;

        if (newCustomerId !== customerId.value) {
          customerId.value = newCustomerId;

          const fieldConfigs = {
            toAddress: {
              enabled: {
                disabled: false,
                queryVariables: { filter: { company: { id: { exact: customerId.value } } } },
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
  }
};

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'inventory.shipments.list' }, name: t('inventory.shipments.title') },
          { path: { name: 'inventory.shipments.edit' }, name: t('inventory.shipments.edit.title') },
        ]"
      />
    </template>

    <template v-slot:content>
      <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" :fields-to-clear="fieldsToClear" @form-updated="handleFormUpdate" @submit="handleOnSubmit" />
    </template>
  </GeneralTemplate>
</template>