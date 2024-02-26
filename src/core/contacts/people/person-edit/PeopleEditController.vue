<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FieldType, FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import {deletePersonMutation, updatePersonMutation} from "../../../../shared/api/mutations/contacts.js";
import { companiesQuery, getPersonQuery} from "../../../../shared/api/queries/contacts.js";
import { customerLanguagesQuery } from "../../../../shared/api/queries/languages.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.EDIT,
  mutation: updatePersonMutation,
  mutationKey: 'updatePerson',
  mutationId: id.value.toString(),
  query: getPersonQuery,
  queryVariables: {id: id.value},
  queryDataKey: 'person',
  deleteMutation: deletePersonMutation,
  submitUrl: { name: 'people.list' },
  fields: [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: id.value.toString()
      },
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