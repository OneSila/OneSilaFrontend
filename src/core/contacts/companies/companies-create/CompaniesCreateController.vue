<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import { GeneralForm} from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormType} from '../../../../shared/components/organisms/general-form/formConfig';
import { createCompanyMutation} from "../../../../shared/api/mutations/contacts.js"
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { baseFormConfigConstructor} from "../configs";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createCompanyMutation,
    'createCompany'
  ),
  submitAndContinueUrl: { name: 'contacts.companies.edit' }
};


</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'contacts.companies.list' }, name: t('contacts.companies.title') },
                   { path: { name: 'contacts.companies.create' }, name: t('contacts.companies.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>