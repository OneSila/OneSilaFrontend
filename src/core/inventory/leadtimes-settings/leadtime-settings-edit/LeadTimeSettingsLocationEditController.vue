<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { getLeadTimeForShippingAddressQuery } from "../../../../shared/api/queries/leadtimes.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { updateLeadTimeForShippingAddressMutation } from "../../../../shared/api/mutations/leadtimes.js";


const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateLeadTimeForShippingAddressMutation,
  'updateLeadTimeForShippingaddress'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getLeadTimeForShippingAddressQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'leadTimeForShippingaddress',
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
          :links="[{ path: { name: 'inventory.leadTimeSettings.list' }, name: t('inventory.leadTimeSettings.title') },
                   { path: { name: 'inventory.leadTimeSettings.edit' }, name: t('inventory.leadTimeSettings.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>