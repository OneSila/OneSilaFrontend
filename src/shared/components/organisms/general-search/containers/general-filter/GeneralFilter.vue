<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { defineProps } from 'vue';
import { SearchConfig, BaseFilter, OrderCriteria } from '../../searchConfig';
import { Icon } from "../.././../../atoms/icon"
import { Button } from "../.././../../atoms/button"
import { Modal } from "../.././../../atoms/modal"
import { FilterModal } from "../filter-modal"
import { useRouter, useRoute } from 'vue-router';
import { GeneralOrdering } from "../general-ordering";
import { getLength } from "../../../../../utils";

const emit = defineEmits(['filtersReset']);
const props = defineProps<{ searchConfig: SearchConfig }>();
const showFilterModal = ref(false);
const router = useRouter();
const route = useRoute();

const handleCancel = () => {
  showFilterModal.value = false
};

const handleSubmit = (data) => {

  const newQuery = { ...router.currentRoute.value.query };

  for (const key in data) {
    if (data[key] !== null && data[key] !== undefined) {
      newQuery[key] = data[key];
    } else {
      delete newQuery[key];
    }
  }

  router.replace({ query: newQuery });
  showFilterModal.value = false;
};


const keysToWatch = ref<string[]>([]);
const hasFilters = ref<boolean>(false);

watchEffect(() => {
  if (props.searchConfig.search) {
    keysToWatch.value.push('search');
  }

  props.searchConfig.filters?.forEach((filter: BaseFilter) => {
    keysToWatch.value.push(filter.name);
  });

  if (props.searchConfig.orderKey) {
    keysToWatch.value.push(props.searchConfig.orderKey);
  }

  hasFilters.value = keysToWatch.value.some(key => route.query[key] !== undefined && route.query[key] !== 'all');
});

const resetFilters = () => {
  const newQuery = { ...router.currentRoute.value.query };
  keysToWatch.value.forEach(key => {
    delete newQuery[key];
  });
  router.replace({ query: newQuery });
  emit('filtersReset');
};


</script>

<template>
  <Button
    v-if="getLength(searchConfig?.filters) > 0"
    custom-class="flex items-center ml-2 p-2 w-10 h-10 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
    @click="showFilterModal = true"
  >
    <Icon name="filter" class="mx-auto" />
  </Button>

  <GeneralOrdering :search-config="searchConfig" v-if="getLength(searchConfig?.orders) > 0"  />

    <Button
        v-if="hasFilters"
        custom-class="flex items-center ml-2 p-2 w-10 h-10 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60 bg-red-50"
        @click="resetFilters"
      >
    <Icon name="arrow-rotate-right" class="mx-auto" />
  </Button>


  <Modal v-if="getLength(searchConfig?.filters) > 0" v-model="showFilterModal" @closed="showFilterModal = false">
    <FilterModal
      :filters="props.searchConfig.filters"
      :cols="props.searchConfig.cols !== undefined ? props.searchConfig.cols : 1"
      @cancel-clicked="handleCancel"
      @submit-clicked="handleSubmit"
    />
  </Modal>

</template>
