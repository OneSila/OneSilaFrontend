<script setup lang="ts">

import {onMounted, Ref} from 'vue'
import { useI18n} from 'vue-i18n';
import { GeneralForm } from "../../../../../../shared/components/organisms/general-form";
import {filterAndExtractIds, FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import { createPurchaseOrderItemMutation } from "../../../../../../shared/api/mutations/purchasing.js"
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../shared/components/atoms/card";
import { ref} from "vue";
import { useRoute, useRouter } from "vue-router";
import { baseFormConfigConstructor} from "../configs";
import apolloClient from "../../../../../../../apollo-client";
import { getPurchaseOrderQuery } from "../../../../../../shared/api/queries/purchasing.js";

const route = useRoute();
const { t } = useI18n();
const orderId = ref(route.params.orderId);
const productIds = ref([]);
const supplierId = ref();

const formConfig: Ref<any| null> = ref(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getPurchaseOrderQuery,
    variables: { id: orderId.value.toString() }
  });

  if (data && data.purchaseOrder) {
    supplierId.value = data.purchaseOrder.supplier.id;
    productIds.value = filterAndExtractIds(data.purchaseOrder.purchaseorderitemSet, ['item', 'id']);
  }

  formConfig.value = {
    ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createPurchaseOrderItemMutation,
      'createPurchaseOrderItem',
      orderId.value.toString(),
      supplierId.value,
      productIds.value
    ),
    submitAndContinueUrl: { name: 'purchasing.orders.items.edit', params: { orderId: orderId.value } }
  };
});

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.orders.list' }, name: t('purchasing.orders.title') },
                   { path: { name: 'purchasing.orders.show', params: { id: orderId } }, name: t('purchasing.orders.show.title') },
                   { path: { name: 'purchasing.orders.items.create', params: { orderId: orderId } }, name: t('purchasing.orders.items.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2" v-if="formConfig !== null">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>