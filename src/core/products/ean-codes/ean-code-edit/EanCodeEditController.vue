<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateEanCodeMutation } from "../../../../shared/api/mutations/eanCodes.js";
import { getEanCodeQuery } from "../../../../shared/api/queries/eanCodes.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Card } from "../../../../shared/components/atoms/card";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import { CollaborationTab } from "../../../../shared/components/organisms/collaboration-tab";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = [
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
  { name: 'collaboration', label: t('shared.tabs.collaboration'), icon: 'comment-dots' },
];

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateEanCodeMutation,
  'updateEanCode'
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
     <Card>
       <Tabs :tabs="tabItems">
         <template #general>
           <GeneralForm :config="formConfig as FormConfig" />
         </template>
         <template #collaboration>
           <CollaborationTab :target-id="id" />
         </template>
       </Tabs>
     </Card>
   </template>
  </GeneralTemplate>
</template>
