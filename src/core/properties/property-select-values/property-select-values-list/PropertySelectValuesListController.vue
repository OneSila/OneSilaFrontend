<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs'
import { AiBulkTranslator } from "../../../../shared/components/organisms/ai-bulk=translator";
import PropertySelectValuesMerge from './PropertySelectValuesMerge.vue';

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, true, true);
const generalListingRef = ref<any>(null);

const clearSelection = () => {
  generalListingRef.value?.clearSelected?.()
}

const clearSelectionAndRefetch = (query) => {
  generalListingRef.value?.clearSelected?.()
  query.refetch();
}

</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'properties.values.list' }, name: t('properties.values.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
        <Link :path="{ name: 'properties.values.create' }">
          <Button type="button" class="btn btn-primary">
              {{  t('properties.values.create.title') }}
          </Button>
        </Link>
      </div>
    </template>


   <template v-slot:content>
     <GeneralListing
         ref="generalListingRef"
         :searchConfig="searchConfig"
         :config="listingConfig"
         :query="listingQuery"
         :query-key="listingQueryKey"
         :fixed-filter-variables="{'isProductType': false }"
          >
      <template #bulkActions="{ selectedEntities, query }">
        <div class="flex items-center space-x-2">
          <AiBulkTranslator
            :type="'values'"
            :selected-entities="selectedEntities"
            @started="clearSelection"
          />
          <PropertySelectValuesMerge
            :selected-entities="selectedEntities"
            @merged="clearSelectionAndRefetch(query)"
          />
        </div>
      </template>
    </GeneralListing>
   </template>
  </GeneralTemplate>
</template>