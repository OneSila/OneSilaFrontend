<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {GeneralForm} from "../../../../../../shared/components/organisms/general-form";
import {FieldType, FormConfig, FormType} from '../../../../../../shared/components/organisms/general-form/formConfig';
import {createCompanyAddressMutation} from "../../../../../../shared/api/mutations/contacts.js"
import CompaniesTemplate from "../../../CompaniesTemplate.vue";
import {Breadcrumbs} from "../../../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../../../shared/components/atoms/card";
import {ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {countriesQuery} from "../../../../../../shared/api/queries/languages.js";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const companyId = ref(route.params.companyId);

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.CREATE,
  mutation: createCompanyAddressMutation,
  mutationKey: 'createAddress',
  submitUrl: { name: 'companies.show', params: {id: companyId.value }},
  submitAndContinueUrl: { name: 'companies.address.edit', params: {companyId: companyId.value} },
  fields: [
    {
      type: FieldType.Hidden,
      name: 'company',
      value: { "id": companyId.value.toString()}
    },
      {
        type: FieldType.Value,
        name: 'address1',
        label: t('contacts.companies.address.labels.addressOne'),
        placeholder: t('contacts.companies.address.placeholders.addressOne')
      },
      {
        type: FieldType.Value,
        name: 'address2',
        label: t('contacts.companies.address.labels.addressTwo'),
        placeholder: t('contacts.companies.address.placeholders.addressTwo')
      },
      {
        type: FieldType.Value,
        name: 'address3',
        label: t('contacts.companies.address.labels.addressThree'),
        placeholder: t('contacts.companies.address.placeholders.addressThree')
      },
      {
        type: FieldType.Value,
        name: 'city',
        label: t('contacts.companies.address.labels.city'),
        placeholder: t('contacts.companies.address.placeholders.city')
      },
      {
        type: FieldType.Value,
        name: 'postcode',
        label: t('contacts.companies.address.labels.postcode'),
        placeholder: t('contacts.companies.address.placeholders.postcode')
      },
      {
        type: FieldType.Query,
        name: 'country',
        label: t('contacts.companies.address.placeholders.country'),
        labelBy: 'name',
        valueBy: 'code',
        query: countriesQuery,
        dataKey: 'countries',
        isEdge: false,
        multiple: false,
        filterable: true,
      },
    {
      type: FieldType.ProxyChoice,
      name: "type",
      label: t('contacts.companies.address.labels.addressType'),
      valueBy: 'value',
      labelBy: 'name',
      multiple: true,
      options: [
        {
          name: t('contacts.companies.address.labels.invoiceAddress'),
          value: 'isInvoiceAddress'
        },
        {
          name: t('contacts.companies.address.labels.shippingAddress'),
          value: 'isShippingAddress'
        }
      ]
    }
    ],
};

</script>

<template>
  <CompaniesTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'companies.list' }, name: t('contacts.companies.title') },
                   { path: { name: 'companies.create' }, name: t('contacts.companies.create.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </CompaniesTemplate>
</template>