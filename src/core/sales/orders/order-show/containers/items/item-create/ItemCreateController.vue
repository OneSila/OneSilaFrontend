<script setup lang="ts">

import {onMounted, Ref} from 'vue'
import { useI18n} from 'vue-i18n';
import { GeneralForm } from "../../../../../../../shared/components/organisms/general-form";
import {filterAndExtractIds, FormConfig, FormType} from '../../../../../../../shared/components/organisms/general-form/formConfig';
import { createOrderItemMutation } from "../../../../../../../shared/api/mutations/salesOrders.js"
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { ref} from "vue";
import { useRoute, useRouter } from "vue-router";
import { baseFormConfigConstructor} from "../configs";
import { getOrderQuery } from "../../../../../../../shared/api/queries/salesOrders.js";
import apolloClient from "../../../../../../../../apollo-client";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const orderId = ref(route.params.orderId);
const productIds = ref([]);
const formConfig: Ref<any| null> = ref(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getOrderQuery,
    variables: { id: orderId.value.toString() }
  });

  if (data && data.order) {
    productIds.value = filterAndExtractIds(data.order.orderitemSet, ['product', 'id']);

    formConfig.value = {
      ...baseFormConfigConstructor(
        t,
        FormType.CREATE,
        createOrderItemMutation,
        'createOrderItem',
        orderId.value.toString(),
        productIds.value
      ),
      submitAndContinueUrl: { name: 'sales.orders.items.edit', params: { orderId: orderId.value } }
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
                   { path: { name: 'sales.orders.items.create', params: { orderId: orderId } }, name: t('sales.orders.items.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>