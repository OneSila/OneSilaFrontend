<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateBrandCustomPromptMutation } from "../../../../shared/api/mutations/llm.js";
import { getBrandCustomPromptQuery } from "../../../../shared/api/queries/llm.js";
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
  updateBrandCustomPromptMutation,
  'updateBrandCustomPrompt'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getBrandCustomPromptQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'brandCustomPrompt',
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: id.value.toString(),
    },
    ...baseForm.fields,
  ],
};
</script>

<template>
    <SettingsTemplate>
      <template v-slot:tabs>
        <TabsMenu :tabs="getTabsConfig(t)" :activeName="'brandIdentity'" />
      </template>

      <template v-slot:breadcrumbs>
        <Breadcrumbs
            :links="[{ path: { name: 'settings.brandIdentity.list' }, name: t('settings.brandIdentity.title') },
                     { path: { name: 'settings.brandIdentity.edit' }, name: t('settings.brandIdentity.edit.title') }]" />
      </template>

     <template v-slot:content>
       <GeneralForm :config="formConfig as FormConfig" />
     </template>
  </SettingsTemplate>
</template>
