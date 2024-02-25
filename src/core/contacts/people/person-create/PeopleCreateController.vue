<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType, FieldType, FormConfig } from '../../../../shared/components/organisms/general-form/formConfig';
import { createCompanyMutation } from "../../../../shared/api/mutations/contacts.js"

const { t } = useI18n();

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.CREATE,
  mutation: createCompanyMutation,
  mutationKey: 'createSupplier',
  submitUrl: { name: 'people.list' },
  submitAndContinueUrl: { name: 'people.edit' },
  fields: [
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