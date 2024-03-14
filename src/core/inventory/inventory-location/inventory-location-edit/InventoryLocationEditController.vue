<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateInventoryLocationMutation } from "../../../../shared/api/mutations/inventory.js";
import { getInventoryLocationQuery } from "../../../../shared/api/queries/inventory.js";
import { baseFormConfigConstructor } from "../configs";
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
  updateInventoryLocationMutation,
  'updateInventoryLocationType'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getInventoryLocationQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'inventoryLocation',
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
          :links="[{ path: { name: 'inventory.inventoryLocations.list' }, name: t('inventory.inventoryLocations.title') },
                   { path: { name: 'inventory.inventoryLocations.edit' }, name: t('inventory.inventoryLocations.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>