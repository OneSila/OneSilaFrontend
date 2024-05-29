<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { useRoute } from "vue-router";
import {onMounted, Ref, ref} from "vue";
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from "../../../../shared/components/organisms/general-form/formConfig";
import { FieldType } from "../../../../shared/utils/constants";
import { updateCurrencyMutation } from "../../../../shared/api/mutations/currencies.js";
import { getCurrencyQuery } from "../../../../shared/api/queries/currencies.js";
import {baseFormConfigConstructor, getCurrencyFields, getNonDefaultFields} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import {TabsMenu} from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const formConfig: Ref<FormConfig | null> = ref(null);

onMounted(() => {

  const baseForm = baseFormConfigConstructor(
    t,
    FormType.EDIT,
    updateCurrencyMutation,
    'updateCurrency'
  );

  formConfig.value = {
  ...baseForm,
  mutationId: id.value.toString(),
  query: getCurrencyQuery,
  queryVariables: { id: id.value },
  queryDataKey: 'currency',
  fields: [
    {
      type: FieldType.Hidden,
      name: 'id',
      value: id.value.toString()
    },
    ...baseForm.fields
  ]
  };
});


const handleFormUpdate = async (form) => {

  if (!formConfig.value) return;

    formConfig.value.fields = getCurrencyFields(t);

    let removeFields: string[] = [];

    if (form.isDefaultCurrency) {
      removeFields = ['inheritsFrom', 'exchangeRate', 'followOfficialRate', 'roundPricesUpTo'];
    } else if (form.followOfficialRate) {
      removeFields.push('exchangeRate');
    }

    formConfig.value.fields = formConfig.value.fields.filter(field =>
      !removeFields.includes(field.name)
    );

};

</script>

<template>
    <SettingsTemplate>
      <template v-slot:tabs>
        <TabsMenu :tabs="getTabsConfig(t)" :activeName="'currencies'" />
      </template>

      <template v-slot:breadcrumbs>
        <Breadcrumbs
            :links="[{ path: { name: 'settings.currencies.list' }, name: t('settings.currencies.title') },
                     { path: { name: 'settings.currency.edit' }, name: t('settings.currency.edit.title') }]" />
      </template>

     <template v-slot:content>
       <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
     </template>
  </SettingsTemplate>
</template>