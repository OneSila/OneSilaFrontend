<script setup lang="ts">
import { ref } from 'vue';
import { Product } from "../../../../configs";
import TabContentTemplate from "../TabContentTemplate.vue";
import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import { bundleVariationsQuery, configurableVariationsQuery } from "../../../../../../../shared/api/queries/products.js";
import { ProductType } from "../../../../../../../shared/utils/constants";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import VariationsList from "./containers/variations-list/VariationsList.vue";
import VariationCreate from "./containers/variation-create/VariationCreate.vue";
import VariationsBulkEdit from "./containers/variations-bulk-edit/VariationsBulkEdit.vue";


const props = defineProps<{ product: Product }>();
const ids = ref([]);
const refetchNeeded = ref(false);
const mode = ref<'list' | 'edit'>('list');

const tabs: { key: 'list' | 'edit'; label: string; icon: string }[] = [
  { key: 'list', label: 'List', icon: 'list' },
  { key: 'edit', label: 'Edit', icon: 'pen-to-square' },
];

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
      <div class="flex">
        <div class="w-24 border-r border-gray-200 pr-4 space-y-2">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="cursor-pointer flex items-center gap-2 p-2 rounded-md"
            :class="{ 'bg-primary text-white': mode === tab.key }"
            @click="mode = tab.key"
          >
            <Icon :name="tab.icon" class="w-4 h-4" />
            <span>{{ tab.label }}</span>
          </div>
        </div>

        <div class="flex-1 pl-4">
          <template v-if="mode === 'list'">
            <VariationsList
              :product="product"
              :query-key="getQueryKey()"
              :list-query="getQuery()"
              :search-config="searchConfig"
              :refetch-needed="refetchNeeded"
              @refetched="handleRefeched"
              @update-ids="getIds"
            />
            <div v-if="product.type !== ProductType.Alias" class="mt-2">
              <VariationCreate :product="product" :variation-ids="ids" @variation-added="handleVariationAdded" />
            </div>
          </template>
          <template v-else>
            <VariationsBulkEdit :product="product" />
          </template>
        </div>
      </div>
    </template>
  </TabContentTemplate>
</template>
