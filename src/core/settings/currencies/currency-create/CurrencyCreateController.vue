<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createCurrencyMutation } from "../../../../shared/api/mutations/currencies.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createCurrencyMutation,
    'createCurrency'
  ),
  submitAndContinueUrl: { name: 'settings.currency.edit' }
};

</script>

<template>
  <SettingsTemplate>

    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'currencies'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'settings.currencies.list' }, name: t('settings.currencies.title') },
                   { path: { name: 'settings.currency.create' }, name: t('settings.currency.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </SettingsTemplate>
</template>