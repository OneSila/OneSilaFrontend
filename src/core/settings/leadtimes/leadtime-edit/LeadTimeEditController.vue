<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateLeadTimeMutation } from "../../../../shared/api/mutations/leadtimes.js";
import { getLeadTimeQuery } from "../../../../shared/api/queries/leadtimes.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateLeadTimeMutation,
  'updateLeadTime'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getLeadTimeQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'leadTime',
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
        <TabsMenu :tabs="getTabsConfig(t)" :activeName="'leadtimes'" />
      </template>

      <template v-slot:breadcrumbs>
        <Breadcrumbs
            :links="[{ path: { name: 'settings.leadtimes.list' }, name: t('settings.leadtimes.title') },
                     { path: { name: 'settings.leadtimes.edit' }, name: t('settings.leadtimes.edit.title') }]" />
      </template>

     <template v-slot:content>
       <GeneralForm :config="formConfig as FormConfig" />
     </template>
  </SettingsTemplate>
</template>