<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createVatRateMutation } from "../../../../shared/api/mutations/vatRates.js"
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
    createVatRateMutation,
    'createVatRate'
  ),
  submitAndContinueUrl: { name: 'settings.vatRate.edit' }
};

</script>

<template>
  <SettingsTemplate>
    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'vatRates'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'settings.vatRates.list' }, name: t('settings.vatRates.title') },
                   { path: { name: 'settings.vatRate.create' }, name: t('settings.vatRates.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </SettingsTemplate>
</template>