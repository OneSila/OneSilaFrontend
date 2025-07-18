<script setup lang="ts">

import {ref} from 'vue';
import {Product} from "../../../../configs";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import {  bundleVariationsQuery, configurableVariationsQuery } from "../../../../../../../shared/api/queries/products.js";
import { ProductType } from "../../../../../../../shared/utils/constants";
import VariationsList from "./containers/variations-list/VariationsList.vue";
import VariationCreate from "./containers/variation-create/VariationCreate.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();
const ids = ref([]);
const refetchNeeded = ref(false);

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const handleVariationAdded = (response) => {
  refetchNeeded.value = true;
};

const handleRefeched = () => {
  refetchNeeded.value = false;
};

const getIds = (newIds) => {
  ids.value = newIds;
};

const getQuery = () => {
  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

  switch(type) {
    case ProductType.Bundle:
      return bundleVariationsQuery;
    case ProductType.Configurable:
      return configurableVariationsQuery;
    default:
      return null;
  }
};

const getQueryKey = () => {
  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

  switch(type) {
    case ProductType.Bundle:
      return 'bundleVariations';
    case ProductType.Configurable:
      return 'configurableVariations';
    default:
      return null;
  }
};

</script>

<template>
  <TabContentTemplate>

    <template v-slot:content>
      <VariationsList :product="product"
                      :query-key="getQueryKey()"
                      :list-query="getQuery()"
                      :search-config="searchConfig"
                      :refetch-needed="refetchNeeded"
                      @refetched="handleRefeched"
                      @update-ids="getIds" />

      <div v-if="product.type !== ProductType.Alias" class="mt-2">
        <VariationCreate :product="product" :variation-ids="ids" @variation-added="handleVariationAdded" />
      </div>
    </template>
  </TabContentTemplate>
</template>
