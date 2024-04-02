<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import { GeneralForm } from "../../../../../../shared/components/organisms/general-form";
import {FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {createCompanyAddressMutation, createCompanyMutation} from "../../../../../../shared/api/mutations/contacts.js"
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../shared/components/molecules/breadcrumbs";
import { ref} from "vue";
import { useRoute, useRouter } from "vue-router";
import {baseFormConfigConstructor} from "../configs";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const companyId = ref(route.params.companyId);


const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createCompanyAddressMutation,
    'createAddress',
    companyId.value.toString()
  ),
  submitAndContinueUrl: { name: 'contacts.companies.address.edit', params: { companyId: companyId.value } }
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
     <GeneralForm :config="formConfig  as FormConfig" />
   </template>
  </GeneralTemplate>
</template>