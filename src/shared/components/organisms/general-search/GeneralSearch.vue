<script setup lang="ts">

import { SearchInput } from "../../molecules/search-input";
import { GeneralFilter } from "./containers/general-filter";
import { ref, watch } from 'vue';
import { useAppStore } from '../../../plugins/store';
import { defaultSearchConfig, SearchConfig } from './searchConfig'
import { useRoute } from 'vue-router';

const search = ref('');
const routeKey = ref('search');

const appStore = useAppStore();
const searchConfig = ref<SearchConfig>(defaultSearchConfig);
const route = useRoute();

const clearSearchInput = () => {
  search.value = '';
};


watch(
  () => appStore.searchConfig,
  (newConfig) => {
    if (newConfig !== null) {
      searchConfig.value = { ...defaultSearchConfig, ...newConfig as SearchConfig };
    }
  },
  { immediate: true }
);

watch(() => route.query[routeKey.value], (newQueryValue) => {
  if (newQueryValue && typeof newQueryValue === 'string') {
    search.value = newQueryValue;
  }
}, { immediate: true });

</script>

<template>
  <div class="sm:ltr:mr-auto sm:rtl:ml-auto flex w-80">
    <SearchInput
      v-model="search"
      :disabled="!searchConfig.search"
      :updateRoute="true"
      :debounce="200"
      routeKey="search"
    />
    <GeneralFilter :searchConfig="searchConfig" @filters-reset="clearSearchInput" />
  </div>
</template>