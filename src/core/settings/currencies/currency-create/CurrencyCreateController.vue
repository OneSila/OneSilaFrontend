<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createCurrencyMutation } from "../../../../shared/api/mutations/currencies.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createCurrencyMutation,
    'createCurrency'
  ),
  submitAndContinueUrl: { name: 'settings.currency.edit' }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'settings.currencies.list' }, name: t('settings.currencies.title') },
                   { path: { name: 'settings.currency.create' }, name: t('settings.currency.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig as FormConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>