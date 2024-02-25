<script setup lang="ts">

import {  SearchConfig, FilterType} from "../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from 'vue-i18n';
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import CompaniesTemplate  from "../CompaniesTemplate.vue"
import {ListingConfig, FieldType} from "../../../../shared/components/organisms/general-listing/listingConfig";
import { companiesQuery } from "../../../../shared/api/queries/contacts.js";
import { deleteCompanyMutation } from "../../../../shared/api/mutations/contacts.js"

const { t } = useI18n();
const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [
    {
      type: FilterType.Boolean,
      strict: true,
      name: 'isSupplier',
      label: t('contacts.companies.labels.supplier')
    },
          {
      type: FilterType.Boolean,
      strict: true,
      name: 'isCustomer',
      label: t('contacts.companies.labels.customer')
    },
          {
      type: FilterType.Boolean,
      strict: true,
      name: 'isInflucener',
      label: t('contacts.companies.labels.influencer')
    },
          {
      type: FilterType.Boolean,
      strict: true,
      name: 'isInternalCompany',
      label: t('contacts.companies.labels.internalCompany')
    },
  ],
  orders: []
};

const generalListingConfig: ListingConfig = {
  headers: [t('shared.labels.name'),t('contacts.companies.labels.eori'), t('contacts.companies.labels.vat')],
  fields: [
    {
      name: 'name',
      type: FieldType.Text,
    },
    {
      name: 'eoriNumber',
      type: FieldType.Text,
    },
    {
      name: 'vatNumber',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'companies.edit',
  showUrlName: 'companies.show',
  addShow: true,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCompanyMutation,
};

</script>

<template>
  <CompaniesTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'companies.list' }, name: t('contacts.companies.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'companies.create' }">
          <Button class="btn btn-primary">
              {{  t('contacts.companies.create.button') }}
          </Button>
        </Link>
      </div>
    </template>


   <template v-slot:content>
      <FilterManager :searchConfig="searchConfig">
      <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
          <GeneralListing
            :config="generalListingConfig"
            :query="companiesQuery"
            :query-key="'companies'"
            :filter-variables="filterVariables"
            :order-variables="orderVariables"
            :pagination="pagination"
        />
      </template>
    </FilterManager>
   </template>
  </CompaniesTemplate>
</template>