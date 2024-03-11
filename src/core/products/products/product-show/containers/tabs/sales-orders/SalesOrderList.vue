<script setup lang="ts">

import {Product} from "../../../../configs";
import {listingQuery, listingQueryKey, searchConfigConstructor, listingConfigConstructor} from "../../../../../../sales/orders/configs";
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

    <template v-slot:content>
      <GeneralListing
        :searchConfig="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'orderitem': {'product': {'id': {'exact': product.id}}}}"
      />
    </template>
  </TabContentTemplate>
</template>
