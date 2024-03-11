<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { GeneralForm } from "../../../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../../../shared/utils/constants";
import { deleteCompanyAddressMutation, updateCompanyAddressMutation } from "../../../../../../shared/api/mutations/contacts.js";
import {getCompanyAddressQuery, getCompanyQuery} from "../../../../../../shared/api/queries/contacts.js";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../shared/components/atoms/card";
import { baseFormConfigConstructor } from "../configs";
import apolloClient from "../../../../../../../apollo-client";
import {getPurchaseOrderQuery, getPurchaseOrderItemQuery} from "../../../../../../shared/api/queries/purchasing.js";
import {updatePurchaseOrderItemMutation} from "../../../../../../shared/api/mutations/purchasing.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);
const orderId = ref(route.params.orderId);
const supplierId = ref();

const formConfig: Ref<any| null> = ref(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getPurchaseOrderQuery,
    variables: { id: orderId.value.toString() }
  });

  if (data && data.purchaseOrder) {
    supplierId.value = data.purchaseOrder.supplier.id;
  }
  
  const baseForm = baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updatePurchaseOrderItemMutation,
    'updatePurchaseOrderItem',
    orderId.value.toString(),
    supplierId.value
  );

 formConfig.value = {
    ...baseForm,
    mutationId: id.value.toString(),
    query: getPurchaseOrderItemQuery,
    queryVariables: { id: id.value },
    queryDataKey: 'purchaseOrderItem',
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



</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.orders.list' }, name: t('purchasing.orders.title') },
                   { path: { name: 'purchasing.orders.show', params: { id: orderId } }, name: t('purchasing.orders.show.title') },
                   { path: { name: 'purchasing.orders.items.create', params: { orderId: orderId } }, name: t('purchasing.orders.items.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2" v-if="formConfig !== null">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>

</template>