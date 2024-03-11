<script setup lang="ts">

import {ref} from 'vue';
import {Product} from "../../../../configs";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import {SearchConfig} from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import {bundleVariationsQuery, umbrellaVariationsQuery} from "../../../../../../../shared/api/queries/products.js";
import {PRODUCT_BUNDLE} from "../../../../../../../shared/utils/constants";
import VariationsList from "./containers/variations-list/VariationsList.vue";
import VariationCreate from "./containers/variation-create/VariationCreate.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();
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

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons>
      <VariationCreate :product="product" @variation-added="handleVariationAdded" />
    </template>

    <template v-slot:content>
      <VariationsList :product="product"
                      :query-key="product.type === PRODUCT_BUNDLE ? 'bundleVariations' : 'umbrellaVariations'"
                      :list-query="product.type === PRODUCT_BUNDLE ? bundleVariationsQuery : umbrellaVariationsQuery"
                      :search-config="searchConfig"
                      :refetch-needed="refetchNeeded"
                      @refetched="handleRefeched"/>
    </template>
  </TabContentTemplate>
</template>
