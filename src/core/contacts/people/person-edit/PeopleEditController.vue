<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updatePersonMutation } from "../../../../shared/api/mutations/contacts.js";
import { getPersonQuery } from "../../../../shared/api/queries/contacts.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";


const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updatePersonMutation,
  'updatePerson',
  route.query.companyId ? route.query.companyId.toString() : null
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getPersonQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'person',
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
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'contacts.people.list' }, name: t('contacts.people.title') },
                   { path: { name: 'contacts.people.edit' }, name: t('contacts.people.edit.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>