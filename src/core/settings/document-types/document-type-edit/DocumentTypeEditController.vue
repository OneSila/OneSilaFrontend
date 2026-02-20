<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Button } from '../../../../shared/components/atoms/button';
import { GeneralForm } from '../../../../shared/components/organisms/general-form';
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { Link } from '../../../../shared/components/atoms/link';
import { TabsMenu } from '../../../../shared/components/molecules/tabs-menu';
import { FieldType } from '../../../../shared/utils/constants';
import { updateDocumentTypeMutation } from '../../../../shared/api/mutations/documentTypes.js';
import { getDocumentTypeQuery } from '../../../../shared/api/queries/documentTypes.js';
import SettingsTemplate from '../../SettingsTemplate.vue';
import { getTabsConfig } from '../../tabs';
import { baseFormConfigConstructor } from '../configs';

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateDocumentTypeMutation,
  'updateDocumentType'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getDocumentTypeQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'documentType',
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
    <template #tabs>
      <TabsMenu :tabs="getTabsConfig(t)" :activeName="'documentTypes'" />
    </template>

    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'settings.documentTypes.list' }, name: t('settings.documentTypes.title') },
          { path: { name: 'settings.documentType.edit' }, name: t('settings.documentTypes.edit.title') }
        ]"
      />
    </template>

    <template #content>
      <GeneralForm :config="formConfig as FormConfig">
        <template #additional-button>
          <Link :path="{ name: 'media.documents.list', query: { documentType: id } }">
            <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info">
              {{ t('settings.documentTypes.actions.showDocuments') }}
            </Button>
          </Link>
        </template>
      </GeneralForm>
    </template>
  </SettingsTemplate>
</template>
