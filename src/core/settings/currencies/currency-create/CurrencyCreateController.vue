<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import {FormConfig, FormField, FormType} from '../../../../shared/components/organisms/general-form/formConfig';
import {createCurrencyMutation, updateCurrencyMutation} from "../../../../shared/api/mutations/currencies.js"
import {baseFormConfigConstructor, getCurrencyFields, getNonDefaultFields} from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import SettingsTemplate from "../../SettingsTemplate.vue";
import { TabsMenu } from "../../../../shared/components/molecules/tabs-menu";
import { getTabsConfig } from "../../tabs";
import { onMounted, ref, Ref } from "vue";
import { FieldType } from "../../../../shared/utils/constants";

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
                   { path: { name: 'settings.currency.create' }, name: t('settings.currencies.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm v-if="formConfig" :config="formConfig as FormConfig" @form-updated="handleFormUpdate" />
   </template>
  </SettingsTemplate>
</template>