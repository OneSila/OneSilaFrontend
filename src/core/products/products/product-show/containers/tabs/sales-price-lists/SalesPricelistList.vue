<script setup lang="ts">

import { Product } from "../../../../configs";
import { listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor } from "./configs";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { useI18n } from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <GeneralListing
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
