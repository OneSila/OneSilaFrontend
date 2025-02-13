<script lang="ts" setup>
import { ref, defineProps } from "vue";
import { useI18n } from "vue-i18n";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {FieldType} from "../../../../../../shared/utils/constants";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {propertySelectValuesQuery} from "../../../../../../shared/api/queries/properties.js";

const { t } = useI18n();
const props = defineProps<{ id: string }>();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const listingConfig: ListingConfig = {
  headers: [t('properties.values.show.title') , t('properties.properties.show.title')],
  fields: [
    { name: 'value', type: FieldType.Text },
    { name: 'property',
      type: FieldType.NestedText,
      keys: ['name'],
      clickable: true,
      clickIdentifiers: [{id: ['id']}],
      clickUrl: {name: 'properties.properties.show'}},
  ],
  identifierKey: 'id',
  addActions: false,
  addShow: true,
  showUrlName: 'properties.values.show',
  addPagination: true,
};

</script>

<template>
  <div>
     <GeneralListing
         :searchConfig="searchConfig"
         :config="listingConfig as ListingConfig"
         :query="propertySelectValuesQuery"
         :query-key="'propertySelectValues'"
         :fixed-filter-variables="{image: {id: {exact: id}}}"
      />
  </div>
</template>

