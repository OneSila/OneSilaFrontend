<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateInventoryMutation } from "../../../../shared/api/mutations/inventory.js";
import { getInventoryQuery } from "../../../../shared/api/queries/inventory.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";


const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateInventoryMutation,
  'updateInventory',
  route.query.productId ? route.query.productId.toString() : null
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getInventoryQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'inventory',
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
          :links="[{ path: { name: 'inventory.inventory.list' }, name: t('inventory.inventory.title') },
                   { path: { name: 'inventory.inventory.edit' }, name: t('inventory.inventory.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>