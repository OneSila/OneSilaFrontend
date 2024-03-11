<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import { GeneralForm} from "../../../../shared/components/organisms/general-form";
import { FormType} from '../../../../shared/components/organisms/general-form/formConfig';
import { createCompanyMutation} from "../../../../shared/api/mutations/contacts.js"
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
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
      <Card class="p-2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>