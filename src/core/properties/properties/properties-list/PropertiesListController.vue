<script setup lang="ts">

import { useI18n } from 'vue-i18n';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../../shared/components/atoms/button";
import { Link } from "../../../../shared/components/atoms/link";
import GeneralTemplate  from "../../../../shared/templates/GeneralTemplate.vue"
import { GeneralListing } from "../../../../shared/components/organisms/general-listing";
import { searchConfigConstructor, listingConfigConstructor, listingQueryKey, listingQuery } from '../configs'
import { AiBulkTranslator } from "../../../../shared/components/organisms/ai-bulk=translator";
import {ref} from "vue";

const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, true);

const generalListingRef = ref<any>(null);
const clearSelection = () => {
  generalListingRef.value?.clearSelected?.()
}


</script>

<template>
  <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs :links="[{ path: { name: 'properties.properties.list' }, name: t('properties.title') }]" />
    </template>

    <template v-slot:buttons>
        <div>
          <Link :path="{ name: 'properties.properties.create' }">
          <Button type="button" class="btn btn-primary">
              {{  t('properties.properties.create.title') }}
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
         :fixed-filter-variables="{'isProductType': { exact: false }}">
      <template #bulkActions="{ selectedEntities }">
        <AiBulkTranslator :type="'properties'" :selected-entities="selectedEntities" @started="clearSelection" />
      </template>
    </GeneralListing>
   </template>
  </GeneralTemplate>
</template>