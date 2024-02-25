<script setup lang="ts">

import { SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from 'vue-i18n';
import { FilterManager } from "../../../../../../shared/components/molecules/filter-manager";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import CompaniesTemplate  from "../../../CompaniesTemplate.vue"
import {ListingConfig, FieldType} from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { companyAddressesQuery } from "../../../../../../shared/api/queries/contacts.js";
import { deleteCompanyAddressMutation } from "../../../../../../shared/api/mutations/contacts.js"

const props = defineProps<{ id: string }>();

const { t } = useI18n();
const searchConfig: SearchConfig = {
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
};

const generalListingConfig: ListingConfig = {
  headers: [t('contacts.companies.address.labels.address'), t('contacts.companies.address.labels.isInvoiceAddress'),  t('contacts.companies.address.labels.isShippingAddress'), t('contacts.companies.address.labels.country')],
  fields: [
    {
      name: 'address1',
      type: FieldType.Text,
    },
    {
      name: 'isInvoiceAddress',
      type: FieldType.Boolean,
    },
    {
      name: 'isShippingAddress',
      type: FieldType.Boolean,
    },
    {
      name: 'country',
      type: FieldType.Text,
    },
  ],
  identifierKey: 'id',
  identifierVariables: {companyId: props.id},
  addActions: true,
  addEdit: true,
  editUrlName: 'companies.address.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deleteCompanyAddressMutation,
};

</script>

<template>
  <CompaniesTemplate>

    <template v-slot:buttons>
          <Link :path="{ name: 'companies.address.create', params: {companyId: id} }">
          <Button class="btn btn-primary">
              {{  t('contacts.companies.address.create.button') }}
          </Button>
        </Link>
    </template>

   <template v-slot:content>
      <FilterManager :searchConfig="searchConfig">
      <template v-slot:variables="{ pagination }">
        <GeneralListing
          :config="generalListingConfig"
          :query="companyAddressesQuery"
          :query-key="'addresses'"
          :filter-variables="{'company': {'id': {'exact': id}}}"
          :pagination="pagination"
      />
      </template>
    </FilterManager>
   </template>
  </CompaniesTemplate>
</template>