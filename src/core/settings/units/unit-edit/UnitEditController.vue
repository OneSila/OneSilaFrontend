<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateUnitMutation } from "../../../../shared/api/mutations/units.js";
import { getUnitQuery } from "../../../../shared/api/queries/units.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";


const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateUnitMutation,
  'updateUnit'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getUnitQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'unit',
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
          :links="[{ path: { name: 'settings.units.list' }, name: t('settings.units.title') },
                   { path: { name: 'settings.unit.edit' }, name: t('settings.units.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>