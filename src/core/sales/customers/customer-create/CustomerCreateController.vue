<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { GeneralForm } from "../../../../shared/components/organisms/general-form";
import { FormType } from '../../../../shared/components/organisms/general-form/formConfig';
import { createCustomerMutation } from "../../../../shared/api/mutations/contacts.js"
import { baseFormConfigConstructor } from "../configs";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../shared/components/atoms/card";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";

const { t } = useI18n();

const formConfig = {
  ...baseFormConfigConstructor(
    t,
    FormType.CREATE,
    createCustomerMutation,
    'createCustomer'
  ),
  submitAndContinueUrl: { name: 'sales.customers.edit' }
};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'sales.customers.list' }, name: t('sales.customers.title') },
                   { path: { name: 'sales.customers.create' }, name: t('sales.customers.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </GeneralTemplate>
</template>