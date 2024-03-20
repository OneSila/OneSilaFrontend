<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateEanCodeMutation } from "../../../../shared/api/mutations/eanCodes.js";
import { getEanCodeQuery } from "../../../../shared/api/queries/eanCodes.js";
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
  updateEanCodeMutation,
  'updateEanCode',
    route.query.productId ? route.query.productId.toString() : null
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getEanCodeQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'eanCode',
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
          :links="[{ path: { name: 'products.eanCodes.list' }, name: t('products.eanCodes.title') },
                   { path: { name: 'products.eanCodes.edit' }, name: t('products.eanCodes.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>