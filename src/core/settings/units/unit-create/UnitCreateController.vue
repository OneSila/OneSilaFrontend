<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createUnitMutation } from "../../../../shared/api/mutations/units.js"
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
    createUnitMutation,
    'createUnit'
  ),
  submitAndContinueUrl: { name: 'settings.unit.edit' }
};

</script>

<template>
  <SettingsTemplate>
    <template v-slot:tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'units'" />
    </template>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'settings.units.list' }, name: t('settings.units.title') },
                   { path: { name: 'settings.unit.create' }, name: t('settings.units.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </SettingsTemplate>
</template>