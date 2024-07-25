<script setup lang="ts">

import {onMounted, Ref, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../../../../product-properties-rule/configs";
import apolloClient from "../../../../../../../apollo-client";
import {productPropertiesQuery, productPropertiesRuleItemsQuery, productPropertiesRulesQuery} from "../../../../../../shared/api/queries/properties.js";

const props = defineProps<{ id: string; isProductType: boolean }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);
const ids: Ref<any[]> = ref([]);

const fetchFilterIds = async () => {


  if (!props.isProductType) {
    const { data } = await apolloClient.query({
      query: productPropertiesRuleItemsQuery,
      variables: { filter: { property: { id: { exact: props.id }} }},
      fetchPolicy: 'network-only'
    });

    if (data && data.productPropertiesRuleItems && data.productPropertiesRuleItems.edges) {
      const uniqueIds = new Set(data.productPropertiesRuleItems.edges.map(edge => edge.node.rule.id));
      ids.value = Array.from(uniqueIds);
    }
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