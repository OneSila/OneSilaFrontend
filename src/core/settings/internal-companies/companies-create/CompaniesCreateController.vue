<script setup lang="ts">

import {useI18n} from 'vue-i18n';
import { GeneralForm} from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormType} from '../../../../shared/components/organisms/general-form/formConfig';
import { createCompanyMutation} from "../../../../shared/api/mutations/contacts.js"
import SettingsTemplate from "../../SettingsTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { baseFormConfigConstructor} from "../configs";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createCompanyMutation,
    'createCompany'
  ),
  submitAndContinueUrl: { name: 'settings.internalCompany.edit' }
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
                   { path: { name: 'settings.internalCompany.create' }, name: t('contacts.companies.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </SettingsTemplate>
</template>