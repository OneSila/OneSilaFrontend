<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateHsCodeMutation } from "../../../../shared/api/mutations/hsCodes.js";
import { getHsCodeQuery } from "../../../../shared/api/queries/hsCodes.js";
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
  updateHsCodeMutation,
  'updateHsCode',
    route.query.productId ? route.query.productId.toString() : null
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getHsCodeQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'hsCode',
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
          :links="[{ path: { name: 'products.hsCodes.list' }, name: t('products.hsCodes.title') },
                   { path: { name: 'products.hsCodes.edit' }, name: t('products.hsCodes.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>