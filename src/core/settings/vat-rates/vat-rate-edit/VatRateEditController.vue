<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateVatRateMutation } from "../../../../shared/api/mutations/vatRates.js";
import { getVatRateQuery } from "../../../../shared/api/queries/vatRates.js";
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const baseForm = baseFormConfigConstructor(
  t,
  FormType.EDIT,
  updateVatRateMutation,
  'updateVatRate'
);

const formConfig = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getVatRateQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'vatRate',
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
    <SettingsTemplate>
      <template v-slot:tabs>
        <TabsMenu :tabs="getTabsConfig(t)" :activeName="'vatRates'" />
      </template>

      <template v-slot:breadcrumbs>
        <Breadcrumbs
            :links="[{ path: { name: 'settings.vatRates.list' }, name: t('settings.vatRates.title') },
                     { path: { name: 'settings.vatRate.edit' }, name: t('settings.vatRates.edit.title') }]" />
      </template>

     <template v-slot:content>
       <GeneralForm :config="formConfig as FormConfig" />
     </template>
  </SettingsTemplate>
</template>