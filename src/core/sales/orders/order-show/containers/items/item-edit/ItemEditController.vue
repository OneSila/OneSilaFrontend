<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { Ref, ref} from "vue";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import { FormType } from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { baseFormConfigConstructor } from "../configs";
import { getOrderItemQuery } from "../../../../../../../shared/api/queries/salesOrders.js";
import { updateOrderItemMutation } from "../../../../../../../shared/api/mutations/salesOrders.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);
const orderId = ref(route.params.orderId);
const supplierId = ref();

const formConfig: Ref<any| null> = ref(null);

  const baseForm = baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updateOrderItemMutation,
    'updateOrderItem',
    orderId.value.toString()
  );

 formConfig.value = {
    ...baseForm,
    mutationId: id.value.toString(),
    query: getOrderItemQuery,
    queryVariables: { id: id.value },
    queryDataKey: 'orderItem',
    fields: [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: id.value.toString()
      },
      ...baseForm.fields
    ]
  };



</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.orders.list' }, name: t('sales.orders.title') },
                   { path: { name: 'sales.orders.show', params: { id: orderId } }, name: t('sales.orders.show.title') },
                   { path: { name: 'sales.orders.items.create', params: { orderId: orderId } }, name: t('sales.orders.items.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2" v-if="formConfig !== null">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>

</template>