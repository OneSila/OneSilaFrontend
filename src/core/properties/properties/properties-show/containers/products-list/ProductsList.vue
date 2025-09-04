<script setup lang="ts">

import {onMounted, Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import {listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery, ProductPropertyValue} from "../../../../../products/products/configs";
import apolloClient from "../../../../../../../apollo-client";
import {productPropertiesQuery} from "../../../../../../shared/api/queries/properties.js";

const props = defineProps<{ id: string }>();
const ids: Ref<any[]> = ref([]);
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);

const fetchFilterIds = async () => {
  const { data } = await apolloClient.query({
    query: productPropertiesQuery,
    variables: { filter: { property: { id: { exact: props.id }} }},
    fetchPolicy: 'cache-first'
  });

  if (data && data.productProperties && data.productProperties.edges) {
    const uniqueIds = new Set(data.productProperties.edges.map(edge => edge.node.product.id));
    ids.value = Array.from(uniqueIds);
  }

};

onMounted(fetchFilterIds)

</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
    </template>

   <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'id': {'inList': ids}}"
    />
   </template>
  </GeneralTemplate>
</template>