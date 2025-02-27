<script setup lang="ts">
import { ref } from 'vue';
import { Product } from "../../../../configs";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import { bundleVariationsQuery, configurableVariationsQuery } from "../../../../../../../shared/api/queries/products.js";
import { ProductType } from "../../../../../../../shared/utils/constants";
import { ParentsList } from "./containers/parents-list"; // new ParentsView component

const { t } = useI18n();

const props = defineProps<{ product: Product }>();

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <ParentsList
        :product="product"
        :query-key="'configurableVariations'"
        :list-query="configurableVariationsQuery"
        :search-config="searchConfig"
      />
    </template>
  </TabContentTemplate>
</template>
