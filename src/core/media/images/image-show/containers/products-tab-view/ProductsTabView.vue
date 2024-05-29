<script lang="ts" setup>
import { ref, defineProps } from "vue";
import { useI18n } from "vue-i18n";
import { mediaProductThroughQuery} from "../../../../../../shared/api/queries/media.js";
import {SearchConfig} from "../../../../../../shared/components/organisms/general-search/searchConfig";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {FieldType} from "../../../../../../shared/utils/constants";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import {getProductTypeBadgeMap} from "../../../../../products/products/configs";

const { t } = useI18n();
const props = defineProps<{ id: string }>();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const listingConfig: ListingConfig = {
  headers: [t('shared.labels.name'), t('products.products.labels.type.title'), t('shared.labels.active')],
  fields: [
    {
      type: FieldType.NestedText,
      name: 'product',
      keys: ['name']
    },
    {
      type: FieldType.Badge,
      name: 'productType',
      badgeMap: getProductTypeBadgeMap(t)
    },
    {
      type: FieldType.Boolean,
      name: 'active',
    },
  ],
  identifierKey: 'productId',
  addActions: false,
  showUrlName: 'products.products.show',
  addShow: true,
  addPagination: true,
}

</script>

<template>
  <div>
     <GeneralListing
         :searchConfig="searchConfig"
         :config="listingConfig as ListingConfig"
         :query="mediaProductThroughQuery"
         :query-key="'mediaProductThroughs'"
         :fixed-filter-variables="{media: {id: {exact: id}}}"
      />
  </div>
</template>

