<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {
  languagesSearchConfigConstructor,
  languagesListingConfigConstructor,
  languagesListingQueryKey,
  languagesListingQuery
} from "./configs";
import apolloClient from "../../../../../../../apollo-client";
import { languagesQuery } from "../../../../../../shared/api/queries/languages.js";
import {ListingConfig} from "../../../../../../shared/components/organisms/general-listing/listingConfig";

const props = defineProps<{ id: string; salesChannelId: string }>();
const badgeMap = ref({});
const listingConfig = ref<ListingConfig | null>(null);
const { t } = useI18n();

const fetchLanguages = async () => {
  const {data} = await apolloClient.query({
    query: languagesQuery,
  });

  if (data && data.languages) {
      const map = {};
      data.languages.forEach(lang => {
        map[lang.code] = { text: lang.name, color: 'blue' };
      });
      badgeMap.value = map;
  }
  listingConfig.value = languagesListingConfigConstructor(t, badgeMap.value, props.id);
}

onMounted(fetchLanguages);

const searchConfig = languagesSearchConfigConstructor(t);
</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
    </template>

    <template v-slot:content>
      <GeneralListing
        v-if="listingConfig"
        :search-config="searchConfig"
        :config="listingConfig"
        :query="languagesListingQuery"
        :query-key="languagesListingQueryKey"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId}}}"
      />
    </template>
  </GeneralTemplate>
</template>
