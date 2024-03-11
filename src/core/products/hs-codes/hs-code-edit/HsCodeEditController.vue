<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateHsCodeMutation } from "../../../../shared/api/mutations/hsCodes.js";
import { getHsCodeQuery } from "../../../../shared/api/queries/hsCodes.js";
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
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>