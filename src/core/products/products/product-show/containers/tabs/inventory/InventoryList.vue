<script setup lang="ts">

import {Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../../inventory/inventory/configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";
import { ProductType } from "../../../../../../../shared/utils/constants";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();


const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, props.product.id, props.product.type === ProductType.Supplier);

const filters = props.product.type === ProductType.Supplier ?
    {'product': {'id': {'exact': props.product.id}}} :
    {'product': { 'baseProducts': {'id': {'exact': props.product.id}} }};

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons v-if="props.product.type === ProductType.Supplier">
      <Link :path="{ name: 'inventory.inventory.create', query: {productId: product.id} }">
        <Button type="button" class="btn btn-primary">
          {{ t('inventory.inventory.create.title') }}
        </Button>
      </Link>
    </template>

    <template v-slot:content>
      <GeneralListing
        :searchConfig="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="filters"
      />
    </template>
  </TabContentTemplate>
</template>
