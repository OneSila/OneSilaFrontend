<script setup lang="ts">

import { ref } from "vue";
import { Product } from "../../../../configs";
import { listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor } from "./configs";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import SalesPricelistAdd from "./SalesPricelistAdd.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

const refreshKey = ref(0);

const handleItemAdded = () => {
  refreshKey.value += 1;
};

</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <SalesPricelistAdd :product="product" @added="handleItemAdded" />
      <GeneralListing
        :key="refreshKey"
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{ product: { id: { exact: product.id } } }"
      >
        <template #additionalButtons="{ item }">
          <Link
            :path="{ name: 'sales.priceLists.items.edit', params: { priceListId: item.node.salespricelist.id, id: item.node.id } }"
          >
            <Button class="text-indigo-600 hover:text-indigo-900">
              {{ t('shared.button.edit') }}
            </Button>
          </Link>
        </template>
      </GeneralListing>
    </template>
  </TabContentTemplate>
</template>
