<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import {filterAndExtractIds, FormConfig, FormType} from "../../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../../shared/utils/constants";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { baseFormConfigConstructor } from "../configs";
import {getOrderItemQuery, getOrderQuery} from "../../../../../../../shared/api/queries/salesOrders.js";
import {createOrderItemMutation, updateOrderItemMutation} from "../../../../../../../shared/api/mutations/salesOrders.js";
import apolloClient from "../../../../../../../../apollo-client";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const orderId = ref(route.params.orderId);
const productIds = ref([]);

const formConfig: Ref<any| null> = ref(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getOrderQuery,
    variables: { id: orderId.value.toString() }
  });

  if (data && data.order) {
    productIds.value = filterAndExtractIds(data.order.orderitemSet, ['product', 'id'], ['id'], id.value.toString());

    const baseForm = baseFormConfigConstructor(
      t,
      FormType.EDIT,
      updateOrderItemMutation,
      'updateOrderItem',
      orderId.value.toString(),
      productIds.value,
      data.order.currency.symbol
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

  }
});



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
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>

</template>