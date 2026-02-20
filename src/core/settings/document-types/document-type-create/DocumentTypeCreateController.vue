<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { GeneralForm } from '../../../../shared/components/organisms/general-form';
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { TabsMenu } from '../../../../shared/components/molecules/tabs-menu';
import { createDocumentTypeMutation } from '../../../../shared/api/mutations/documentTypes.js';
import SettingsTemplate from '../../SettingsTemplate.vue';
import { getTabsConfig } from '../../tabs';
import { baseFormConfigConstructor } from '../configs';

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createDocumentTypeMutation,
    'createDocumentType'
  ),
  submitAndContinueUrl: { name: 'settings.documentType.edit' }
};
</script>

<template>
  <SettingsTemplate>
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'documentTypes'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'settings.documentTypes.list' }, name: t('settings.documentTypes.title') },
          { path: { name: 'settings.documentType.create' }, name: t('settings.documentTypes.create.title') }
        ]"
      />
    </template>

    <template #content>
      <GeneralForm :config="formConfig as FormConfig" />
    </template>
  </SettingsTemplate>
</template>
