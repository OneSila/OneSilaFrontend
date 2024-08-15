<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormConfig, FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createLeadTimeForShippingAddressMutation } from "../../../../shared/api/mutations/leadtimes.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createLeadTimeForShippingAddressMutation,
    'createLeadTimeForShippingaddress'
  ),
  submitAndContinueUrl: { name: 'inventory.leadTimeSettings.edit' }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'inventory.leadTimeSettings.list' }, name: t('inventory.leadTimeSettings.title') },
                   { path: { name: 'inventory.leadTimeSettings.create' }, name: t('inventory.leadTimeSettings.create.title') }]" />
    </template>

   <template v-slot:content>
     <GeneralForm :config="formConfig as FormConfig" />
   </template>
  </GeneralTemplate>
</template>