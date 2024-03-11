<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateCurrencyMutation } from "../../../../shared/api/mutations/currencies.js";
import { getCurrencyQuery } from "../../../../shared/api/queries/currencies.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";


const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateCurrencyMutation,
  'updateCurrency'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getCurrencyQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'currency',
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
          :links="[{ path: { name: 'settings.currencies.list' }, name: t('settings.currencies.title') },
                   { path: { name: 'settings.currency.edit' }, name: t('settings.currency.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>