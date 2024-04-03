<script setup lang="ts">

import {Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../../purchasing/products/configs";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../../shared/components/organisms/general-listing";
import {useI18n} from "vue-i18n";
import TabContentTemplate from "../TabContentTemplate.vue";

const { t } = useI18n();

const props = defineProps<{ product: Product }>();


const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, null, props.product.id);

</script>

<template>
  <TabContentTemplate>
    <template v-slot:buttons>
      <Link :path="{ name: 'purchasing.product.create', query: {productId: product.id} }">
        <Button type="button" class="btn btn-primary">
          {{ t('purchasing.products.create.title') }}
        </Button>
      </Link>
    </template>

    <template v-slot:content>
      <GeneralListing
        :searchConfig="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'product': {'id': {'exact': product.id}}}"
      />
    </template>
  </TabContentTemplate>
</template>
