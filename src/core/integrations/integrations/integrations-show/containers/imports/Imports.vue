<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {
  importsSearchConfigConstructor,
  importsListingConfigConstructor,
  listingQuery,
  listingQueryKey
} from "./configs";

const props = defineProps<{ salesChannelId: string }>();
const { t } = useI18n();

const searchConfig = importsSearchConfigConstructor(t);
const listingConfig = importsListingConfigConstructor(t, props.salesChannelId);

</script>

<template>
  <GeneralTemplate>

    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId}}}"
      />
    </template>
  </GeneralTemplate>
</template>
