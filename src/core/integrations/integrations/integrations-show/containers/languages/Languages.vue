<script setup lang="ts">
import {onMounted, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../shared/components/organisms/general-listing";
import {
  languagesSearchConfigConstructor,
  languagesListingConfigConstructor,
  listingQueryKeyConstructor,
  listingQueryConstructor
} from "./configs";
import apolloClient from "../../../../../../../apollo-client";
import { companyLanguagesQuery } from "../../../../../../shared/api/queries/languages.js";
import { ListingConfig } from "../../../../../../shared/components/organisms/general-listing/listingConfig";
import { Button } from "../../../../../../shared/components/atoms/button";
import { useRoute } from 'vue-router';

const props = defineProps<{ id: string; salesChannelId: string }>();
const emit = defineEmits(['pull-data']);
const route = useRoute();

const badgeMap = ref({});
const listingConfig = ref<ListingConfig | null>(null);
const { t } = useI18n();
const integrationType = ref(String(route.params.type));

const fetchLanguages = async () => {
  const {data} = await apolloClient.query({
    query: companyLanguagesQuery,
  });

  if (data && data.companyLanguages) {
      const map = {};
      data.companyLanguages.forEach(lang => {
        map[lang.code] = { text: lang.name, color: 'blue' };
      });
      badgeMap.value = map;
  }
  listingConfig.value = languagesListingConfigConstructor(t, badgeMap.value, props.id, integrationType.value);
}

onMounted(fetchLanguages);

const searchConfig = languagesSearchConfigConstructor(t);
</script>

<template>
  <GeneralTemplate>

    <template v-slot:buttons>
      <Button type="button" class="btn btn-primary" @click="$emit('pull-data')">
        {{ t('integrations.labels.pullData') }}
      </Button>
    </template>

    <template v-slot:content>
      <GeneralListing
        v-if="listingConfig"
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQueryConstructor(integrationType)"
        :query-key="listingQueryKeyConstructor(integrationType)"
        :fixed-filter-variables="{'salesChannel': {'id': {exact: salesChannelId}}}"
      />
    </template>
  </GeneralTemplate>
</template>
