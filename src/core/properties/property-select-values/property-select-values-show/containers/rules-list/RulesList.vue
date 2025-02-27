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

const props = defineProps<{ id: string; }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t);
const ruleId = ref(null);

const fetchFilterIds = async () => {

  const { data } = await apolloClient.query({
    query: productPropertiesRulesQuery,
    variables: { filter: { productType: { id: { exact: props.id }} }},
    fetchPolicy: 'network-only'
  });

  if (data && data.productPropertiesRules && data.productPropertiesRules.edges && data.productPropertiesRules.edges.length == 1) {
    ruleId.value = data.productPropertiesRules.edges[0].node.id;
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
        :fixed-filter-variables="{'id': {'exact': ruleId}}"
    />
   </template>
  </GeneralTemplate>
</template>