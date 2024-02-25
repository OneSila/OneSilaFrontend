<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {GeneralForm} from "../../../../shared/components/organisms/general-form";
import {FieldType, FormConfig, FormType} from '../../../../shared/components/organisms/general-form/formConfig';
import {createCompanyMutation} from "../../../../shared/api/mutations/contacts.js"
import {companiesQuery} from "../../../../shared/api/queries/contacts.js"
import CompaniesTemplate from "../CompaniesTemplate.vue";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";

const { t } = useI18n();

const formConfig: FormConfig = {
  cols: 1,
  type: FormType.CREATE,
  mutation: createCompanyMutation,
  mutationKey: 'createCompany',
  submitUrl: { name: 'companies.list' },
  submitAndContinueUrl: { name: 'companies.edit' },
  fields: [
      {
        type: FieldType.Value,
        name: 'name',
        label: t('shared.labels.name'),
        placeholder: t('shared.placeholder.name')
      },
      {
        type: FieldType.Value,
        name: 'vatNumber',
        label:  t('contacts.companies.labels.vat'),
        placeholder: t('contacts.companies.placeholders.eori'),
      },
      {
        type: FieldType.Value,
        name: 'eoriNumber',
        label: t('contacts.companies.labels.eori'),
        placeholder: t('contacts.companies.placeholders.eori'),
      },
    {
      type: FieldType.ProxyChoice,
      name: "type",
      label: t('contacts.companies.labels.type'),
      valueBy: 'value',
      labelBy: 'name',
      multiple: true,
      options: [
        {
          name: t('contacts.companies.labels.supplier'),
          value: 'isSupplier'
        },
        {
          name: t('contacts.companies.labels.customer'),
          value: 'isCustomer'
        },
        {
          name: t('contacts.companies.labels.influencer'),
          value: 'isInfluencer'
        },
        {
          name: t('contacts.companies.labels.internalCompany'),
          value: 'isInternalCompany'
        }
      ]
    },
      {
        type: FieldType.Query,
        name: 'relatedCompanies',
        label: t('contacts.companies.labels.relatedCompanies'),
        labelBy: 'name',
        valueBy: 'id',
        query: companiesQuery,
        dataKey: 'companies',
        isEdge: true,
        multiple: true,
        filterable: true,
        formMapIdentifier: 'id',
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