<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs'
import apolloClient from "../../../../../apollo-client";
import {propertiesQuerySelector} from "../../../../shared/api/queries/properties.js";
import { computed, onMounted, ref } from "vue";

const { t } = useI18n();
const productTypeId = ref<string | null>(null);

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, true);
const fixedFilters = computed(() => ({ salesChannel: { id: { isNull: true } } }));

const fetchProductType = async () => {
    const {data} = await apolloClient.query({
      query: propertiesQuerySelector,
      variables: {filter: {isProductType: { exact: true } }}
    })

    if (data && data.properties && data.properties.edges && data.properties.edges.length == 1) {
      productTypeId.value = data.properties.edges[0].node.id;
    }
}

onMounted(fetchProductType);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'properties.rule.list' }, name: t('properties.rule.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'properties.values.create', query: { propertyId: productTypeId, isRule: '1' } }">
          <Button type="button" class="btn btn-primary">
              {{  t('properties.rule.create.title') }}
          </Button>
        </Link>
      </div>
    </template>


   <template v-slot:content>
     <GeneralListing
         :searchConfig="searchConfig"
         :config="listingConfig"
         :query="listingQuery"
         :query-key="listingQueryKey"
         :fixed-filter-variables="fixedFilters"
      />
   </template>
  </GeneralTemplate>
</template>