<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType, FieldType, FormConfig } from '../../../../shared/components/organisms/general-form/formConfig';
import { createPersonMutation } from "../../../../shared/api/mutations/contacts.js"
import { customerLanguagesQuery } from "../../../../shared/api/queries/languages.js";
import { companiesQuery } from "../../../../shared/api/queries/contacts.js";

const { t } = useI18n();

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.CREATE,
  mutation: createPersonMutation,
  mutationKey: 'createPerson',
  submitUrl: { name: 'people.list' },
  submitAndContinueUrl: { name: 'people.edit' },
  fields: [
      {
        type: FieldType.Value,
        name: 'firstName',
        label: t('shared.labels.firstName'),
        placeholder: t('shared.placeholder.firstName')
      },
      {
        type: FieldType.Value,
        name: 'lastName',
        label: t('shared.labels.lastName'),
        placeholder: t('shared.placeholder.lastName')
      },
      {
        type: FieldType.Value,
        name: 'email',
        label: t('shared.labels.email'),
        placeholder: t('shared.placeholder.email')
      },
      {
        type: FieldType.Value,
        name: 'phone',
        label: t('shared.labels.phone'),
        placeholder: t('shared.placeholder.phone')
      },
      {
        type: FieldType.Query,
        name: 'language',
        label: t('shared.placeholder.language'),
        labelBy: 'name',
        valueBy: 'code',
        query: customerLanguagesQuery,
        dataKey: 'customerLanguages',
        isEdge: false,
        multiple: false,
        filterable: true,
      },
      {
        type: FieldType.Query,
        name: 'company',
        label: t('contacts.people.labels.company'),
        labelBy: 'name',
        valueBy: 'id',
        query: companiesQuery,
        dataKey: 'companies',
        isEdge: true,
        multiple: false,
        filterable: true,
        formMapIdentifier: 'id',
      }
    ],
};

</script>

<template>
  <div>
    <GeneralForm :config="formConfig" />
  </div>
</template>