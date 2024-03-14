<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import {updateSupplierProductMutation} from "../../../../shared/api/mutations/purchasing.js";
import { getSupplierProductQuery } from "../../../../shared/api/queries/purchasing.js";
import {baseFormConfigConstructor} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";


const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateSupplierProductMutation,
  'updateSupplierProduct',
    route.query.supplierId ? route.query.supplierId.toString() : null,
    route.query.productId ? route.query.productId.toString() : null,
    route.query.variationId ? route.query.variationId.toString() : null,
);


const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getSupplierProductQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'supplierProduct',
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
          :links="[{ path: { name: 'purchasing.products.list' }, name: t('purchasing.products.title') },
                   { path: { name: 'purchasing.product.edit' }, name: t('purchasing.products.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>