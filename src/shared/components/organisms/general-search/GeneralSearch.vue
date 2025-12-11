<script setup lang="ts">

import {SearchInput} from "../../molecules/search-input";
import {GeneralFilter} from "./containers/general-filter";
import {computed, ref, watch} from 'vue';
import {useAppStore} from '../../../plugins/store';
import {defaultSearchConfig, SearchConfig} from './searchConfig'
import {useRoute} from 'vue-router';

const search = ref('');
const routeKey = ref('search');

const appStore = useAppStore();
const searchConfig = ref<SearchConfig>(defaultSearchConfig);
const route = useRoute();
const isLoading = computed(() => appStore.isSearchLoading);

const clearSearchInput = () => {
  search.value = '';
};


watch(
    () => appStore.searchConfig,
    (newConfig) => {
      if (newConfig !== null) {
        searchConfig.value = {...defaultSearchConfig, ...newConfig as SearchConfig};
      }
    },
    {immediate: true}
);

watch(() => route.query[routeKey.value], (newQueryValue) => {
  if (newQueryValue && typeof newQueryValue === 'string') {
    search.value = newQueryValue.slice(0, 100);
  }
}, {immediate: true});

</script>

<template>
<div class="flex-1 flex">
    <FlexCell center class="w-1/2  lg:w-1/3">
      <SearchInput
          v-model="search"
          :disabled="!searchConfig.search"
          :updateRoute="true"
          :debounce="200"
          routeKey="search"
          :loading="isLoading"
      />
    </FlexCell>
    <FlexCell center>
      <GeneralFilter :searchConfig="searchConfig" @filters-reset="clearSearchInput"/>
    </FlexCell>
  </div>
</template>
