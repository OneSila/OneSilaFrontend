<script setup lang="ts">

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from "../../../../../../shared/components/atoms/button";
import { Link } from "../../../../../../shared/components/atoms/link";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { listingConfigConstructor, searchConfigConstructor, listingQueryKey, listingQuery } from "../../../../property-select-values/configs";

const props = defineProps<{ id: string }>();
const { t } = useI18n();

const searchConfig = searchConfigConstructor(t);
const listingConfig = listingConfigConstructor(t, false);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
        <Link :path="{ name: 'properties.values.create', query: {propertyId: id} }">
          <Button class="btn btn-primary">
              {{  t('properties.values.create.title') }}
          </Button>
        </Link>
    </template>

   <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'property': {'id': {'exact': id}}}"
    />
   </template>
  </GeneralTemplate>
</template>