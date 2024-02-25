<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FieldType, FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { deleteCompanyMutation, updateCompanyMutation } from "../../../../shared/api/mutations/contacts.js";
import { getCompanyQuery } from "../../../../shared/api/queries/contacts.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.EDIT,
  mutation: updateCompanyMutation,
  mutationKey: 'updateCompany',
  mutationId: id.value.toString(),
  query: getCompanyQuery,
  queryVariables: {id: id.value},
  queryDataKey: 'company',
  deleteMutation: deleteCompanyMutation,
  submitUrl: { name: 'people.list' },
  fields: [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: id.value.toString()
      },
      {
        type: FieldType.Value,
        name: 'name',
        label: 'Name',
        placeholder: 'Enter supplier name'
      },
      {
        type: FieldType.Value,
        name: 'vatNumber',
        label: 'VAT Number',
        placeholder: 'Enter VAT number'
      },
      {
        type: FieldType.Value,
        name: 'eoriNumber',
        label: 'EORI Number',
        placeholder: 'Enter EORI number'
      }
    ],
};

</script>

<template>
  <div>
    <GeneralForm :config="formConfig" />
  </div>
</template>