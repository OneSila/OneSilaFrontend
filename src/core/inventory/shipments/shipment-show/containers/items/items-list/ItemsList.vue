<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { listingConfigConstructor, searchConfigConstructor, listingQuery, listingQueryKey } from "../configs";
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import {GeneralListing} from "../../../../../../../shared/components/organisms/general-listing";

const props = defineProps<{ id: string }>();

const { t } = useI18n();
const listingConfig = ref(listingConfigConstructor(t));
const searchConfig = searchConfigConstructor();
</script>

<template>
  <GeneralTemplate>
    <template v-slot:content>
      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="listingQuery"
        :query-key="listingQueryKey"
        :fixed-filter-variables="{ 'shipment': { 'id': { 'exact': id } } }"
      />
    </template>
  </GeneralTemplate>
</template>
