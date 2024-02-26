<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { GeneralForm } from "../../../../../../shared/components/organisms/general-form";
import { FieldType, FormConfig, FormType } from "../../../../../../shared/components/organisms/general-form/formConfig";
import {deleteCompanyAddressMutation, updateCompanyAddressMutation} from "../../../../../../shared/api/mutations/contacts.js";
import { getCompanyAddressQuery} from "../../../../../../shared/api/queries/contacts.js";
import CompaniesTemplate from "../../../CompaniesTemplate.vue";
import {Breadcrumbs} from "../../../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../../../shared/components/atoms/card";
import {countriesQuery} from "../../../../../../shared/api/queries/languages.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);
const companyId = ref(route.params.companyId);

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.EDIT,
  mutation: updateCompanyAddressMutation,
  mutationKey: 'updateAddress',
  mutationId: id.value.toString(),
  query: getCompanyAddressQuery,
  deleteMutation: deleteCompanyAddressMutation,
  queryVariables: {id: id.value},
  queryDataKey: 'address',
  submitUrl: { name: 'companies.show', params: {id: companyId.value }},
  fields: [
      {
        type: FieldType.Hidden,
        name: 'id',
        value: id.value.toString()
      },
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
        label: t('shared.placeholder.country'),
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
                   { path: { name: 'companies.edit' }, name: t('contacts.companies.edit.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2 w-1/2">
        <GeneralForm :config="formConfig" />
      </Card>
   </template>
  </CompaniesTemplate>

</template>