<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import {createCurrencyMutation, updateCurrencyMutation} from "../../../../shared/api/mutations/currencies.js"
import {baseFormConfigConstructor, getNonDefaultFields} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";
import {onMounted, ref, Ref} from "vue";
import {getCurrencyQuery} from "../../../../shared/api/queries/currencies";
import {FieldType} from "../../../../shared/utils/constants";

const { t } = useI18n();

const formConfig: Ref<FormConfig | null> = ref(null);

onMounted(() => {
  formConfig.value = {
    ...baseFormConfigConstructor(
      t,
      FormType.CREATE,
      createCurrencyMutation,
      'createCurrency'
    ),
    submitAndContinueUrl: { name: 'settings.currency.edit' }
  };
});


const handleFormUpdate = (form) => {
  if (formConfig.value) {
    if (form.isDefaultCurrency) {
      formConfig.value.fields = formConfig.value.fields.filter(field =>
        !['inheritsFrom', 'exchangeRate', 'followOfficialRate', 'roundPricesUpTo'].includes(field.name)
      );
    } else {
      const nonDefaultFields = getNonDefaultFields(t);
      nonDefaultFields.forEach(nonDefaultField => {
        if (!formConfig.value!.fields.some(field => field.name === nonDefaultField.name)) {
          formConfig.value!.fields.push(nonDefaultField);
        }
      });
    }
  }
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
                   { path: { name: 'settings.currency.create' }, name: t('settings.currency.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
   </template>
  </SettingsTemplate>
</template>