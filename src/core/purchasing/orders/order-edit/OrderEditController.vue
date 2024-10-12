<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import {useRoute} from "vue-router";
import {onMounted, Ref, ref} from "vue";
import {GeneralForm} from "../../../../shared/components/organisms/general-form";
import {FieldConfigs, FormConfig, FormType, updateFieldConfigs} from "../../../../shared/components/organisms/general-form/formConfig";
import {FieldType} from "../../../../shared/utils/constants";
import {updatePurchaseOrderMutation} from "../../../../shared/api/mutations/purchasing.js";
import {getPurchaseOrderQuery} from "../../../../shared/api/queries/purchasing.js";
import {baseFormConfigConstructor, invoiceAddressOnTheFlyConfig, shippingAddressOnTheFlyConfig} from "../configs";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";


const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const supplierId = ref(null);
const formConfig: Ref<FormConfig | null> = ref(null);
const querySupplierId = route.query.supplierId ? route.query.supplierId.toString() : null;

onMounted(() => {
  const baseForm = {
    ...baseFormConfigConstructor(
      t,
      FormType.EDIT,
      updatePurchaseOrderMutation,
      'updatePurchaseOrder',
        querySupplierId,
        route.query.source ? route.query.source.toString() : null
    ),
  };

  formConfig.value = {
    ...baseForm,
    mutationId: id.value.toString(),
    query: getPurchaseOrderQuery,
    queryVariables: {id: id.value},
    queryDataKey: 'purchaseOrder',
    fields: [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: id.value.toString()
      },
      ...baseForm.fields
    ]
  } as FormConfig;
});

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.orders.list' }, name: t('purchasing.orders.title') },
                   { path: { name: 'purchasing.orders.edit', params: {id: id} }, name: t('purchasing.orders.edit.title') }]" />
    </template>

   <template v-slot:content>
     <div v-if="formConfig">
        <GeneralForm v-if="querySupplierId === null" :config="formConfig as FormConfig" />
        <GeneralForm v-else :config="formConfig as FormConfig" />
     </div>
   </template>
  </GeneralTemplate>
</template>