<script setup lang="ts">

import {onMounted, ref} from 'vue'
import { peopleQuery } from "../../../../shared/api/queries/contacts.js";
import { deletePersonMutation } from "../../../../shared/api/mutations/contacts.js"
import {  SearchConfig} from "../../../../shared/components/organisms/general-search/searchConfig";
import { useI18n } from 'vue-i18n';
import { FilterManager } from "../../../../shared/components/molecules/filter-manager";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import IconUserPlus from "../../../../shared/components/atoms/icons/icon-user-plus.vue";
import {GeneralListing} from "../../../../shared/components/organisms/general-listing";
import {ListingConfig, FieldType} from "../../../../shared/components/organisms/general-listing/listingConfig";

const { t } = useI18n();
const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const generalListingConfig: ListingConfig = {
  headers: [t('shared.labels.firstName'), t('shared.labels.email'), t('contacts.people.labels.company'), t('shared.placeholder.language')],
  fields: [
    {
      name: 'firstName',
      type: FieldType.Text,
    },
    {
      name: 'email',
      type: FieldType.Text,
    },
    {
      name: 'companyName',
      type: FieldType.NestedText,
      keys: ['company', 'name']
    },
    {
      name: 'language',
      type: FieldType.Image,
      basePath: '/src/assets/images/flags',
      suffix: '.svg'
    }
  ],
  identifierKey: 'id',
  addActions: true,
  addEdit: true,
  editUrlName: 'people.edit',
  addShow: false,
  addDelete: true,
  addPagination: true,
  deleteMutation: deletePersonMutation,

};

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'people.list' }, name: 'People' }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'people.create' }">
          <Button type="button" class="btn btn-primary">
              {{  t('contacts.companies.people.button') }}
          </Button>
        </Link>
      </div>
    </template>


   <template v-slot:content>
     <GeneralListing
         :searchConfig="searchConfig"
          :config="generalListingConfig"
          :query="peopleQuery"
          :query-key="'people'"
      />
   </template>
  </GeneralTemplate>
</template>