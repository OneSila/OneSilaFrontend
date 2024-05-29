<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormType} from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType} from "../../../../shared/utils/constants";
import { deleteCompanyMutation, updateCompanyMutation } from "../../../../shared/api/mutations/contacts.js";
import { getCompanyQuery } from "../../../../shared/api/queries/contacts.js";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { baseFormConfigConstructor} from "../configs";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateCompanyMutation,
  'updateCompany'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getCompanyQuery,
  deleteMutation: deleteCompanyMutation,
  queryVariables: { id: id.value },
  queryDataKey: 'company',
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
  <SettingsTemplate>
    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'companies'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'settings.internalCompanies.list' }, name: t('contacts.companies.title') },
                   { path: { name: 'settings.internalCompany.edit' }, name: t('contacts.companies.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </SettingsTemplate>

</template>