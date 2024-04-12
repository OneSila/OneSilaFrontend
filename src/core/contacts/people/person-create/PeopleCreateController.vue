<script setup lang="ts">

import { useRoute } from "vue-router";
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormType} from '../../../../shared/components/organisms/general-form/formConfig';
import { createPersonMutation } from "../../../../shared/api/mutations/contacts.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();
const route = useRoute();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createPersonMutation,
    'createPerson',
      route.query.companyId ? route.query.companyId.toString() : null
  ),
  submitAndContinueUrl: { name: 'contacts.people.edit' }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'contacts.people.list' }, name: t('contacts.people.title') },
                   { path: { name: 'contacts.people.create' }, name: t('contacts.people.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>