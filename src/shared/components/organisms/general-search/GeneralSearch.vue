<template>
  <div class="sm:ltr:mr-auto sm:rtl:ml-auto flex w-80">
    <SearchInput
      v-model="search"
      :disabled="!searchConfig.search"
      :updateRoute="true"
      :debounce="1000"
      routeKey="search"
    />
    <GeneralFilter v-if="searchConfig.filters?.length > 0" :searchConfig="searchConfig" />
  </div>
</template>

<script setup lang="ts">
import { SearchInput } from "../../molecules/search-input";
import { GeneralFilter } from "./containers/general-filter";
import { ref, watch } from 'vue';
import { useAppStore } from '../../../../shared/plugins/store';
import { defaultSearchConfig, SearchConfig } from './searchConfig'
import { useRoute } from 'vue-router';

const search = ref('');
const routeKey = ref('search');

const appStore = useAppStore();
const searchConfig = ref<SearchConfig>(defaultSearchConfig);
const route = useRoute();


watch(() => route.query[routeKey.value], (newQueryValue) => {
  if (newQueryValue && typeof newQueryValue === 'string') {
    search.value = newQueryValue;
  }
}, { immediate: true });

watch(
  () => appStore.searchConfig,
  (newConfig) => {
    if (newConfig !== null) {
      searchConfig.value = { ...defaultSearchConfig, ...newConfig as SearchConfig };
    }
  },
  { immediate: true }
);

</script>