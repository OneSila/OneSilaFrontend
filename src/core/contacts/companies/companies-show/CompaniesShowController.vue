<script setup lang="ts">
import {useI18n} from 'vue-i18n';
import {useRoute, useRouter} from "vue-router";
import {ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {ShowConfig} from "../../../../shared/components/organisms/general-show/showConfig";
import {deleteCompanyMutation} from "../../../../shared/api/mutations/contacts.js";
import {getCompanySubscription} from "../../../../shared/api/subscriptions/contacts.js";
import {FieldType} from "../../../../shared/components/organisms/general-listing/listingConfig";
import CompaniesTemplate from "../CompaniesTemplate.vue";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import AddressesList from "./containers/addresses-list/AddressesList.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(route.params.id);

const showConfig: ShowConfig = {
  cols: 1,
  subscription: getCompanySubscription,
  subscriptionKey: 'company',
  subscriptionVariables: {id: id.value},
  addBack: false,
  backUrl:  {name: 'companies.list' },
  addEdit: false,
  editUrl: {name: 'companies.edit', params: {id: id.value} },
  addDelete: false,
  deleteMutation: deleteCompanyMutation,
  deleteVariables: {id: id.value},
  fields: [
 {
    name: 'name',
    type: FieldType.Text,
    label:  t('shared.labels.name'),
    showLabel: true
  },
  {
    name: 'vatNumber',
    type: FieldType.Text,
    label: t('contacts.companies.labels.vat'),
    showLabel: true
  },
  {
    name: 'eoriNumber',
    type: FieldType.Text,
    label: t('contacts.companies.labels.eori'),
    showLabel: true
  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.supplier'),
    name: 'isSupplier',
    showLabel: true

  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.customer'),
    name: 'isCustomer',
    showLabel: true
  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.influencer'),
    name: 'isInfluencer',
    showLabel: true
  },
  {
    type: FieldType.Boolean,
    label: t('contacts.companies.labels.internalCompany'),
    name: 'isInternalCompany',
    showLabel: true
  },
  {
    type: FieldType.Array,
    name: 'relatedCompanies',
    label: t('contacts.companies.labels.relatedCompanies'),
    clickable: true,
    clickUrl: {name: 'companies.show'},
    clickIdentifiers: [{id: ['id']}],
    keys: ['name'],
    showLabel: true
  }
  ]

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
      <Card class="p-2">
        <GeneralShow :config="showConfig" />
        <AddressesList :id="id" />
      </Card>
   </template>
  </CompaniesTemplate>
</template>