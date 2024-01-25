<script setup lang="ts">
import { ref, computed } from 'vue';
import { defineProps } from 'vue';
import { SearchConfig, BaseFilter, OrderCriteria } from '../../searchConfig';
import { Icon } from "../.././../../atoms/icon"
import { Button } from "../.././../../atoms/button"
import { Modal } from "../.././../../atoms/modal"
import { FilterModal } from "../filter-modal"
import { useRouter, useRoute } from 'vue-router';
import { GeneralOrdering } from "../general-ordering";

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

if (props.searchConfig.search) {
  keysToWatch.value.push('search');
}

if (props.searchConfig.orderKey) {
  keysToWatch.value.push(props.searchConfig.orderKey);
}

props.searchConfig.filters?.forEach((filter: BaseFilter) => {
  keysToWatch.value.push(filter.name);
});

const hasFilters = computed(() => {
  return keysToWatch.value.some(key => route.query[key] !== undefined);
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
    v-if="searchConfig.filters?.length > 0"
    custom-class="flex items-center ml-2 p-2 w-10 h-10 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
    @click="showFilterModal = true"
  >
    <Icon name="filter" class="mx-auto" />
  </Button>

  <GeneralOrdering :search-config="searchConfig" v-if="searchConfig.orders?.length > 0"  />

    <Button
        v-if="hasFilters"
        custom-class="flex items-center ml-2 p-2 w-10 h-10 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60 bg-red-50"
        @click="resetFilters"
      >
    <Icon name="arrow-rotate-right" class="mx-auto" />
  </Button>


  <Modal v-if="searchConfig.filters?.length > 0" v-model="showFilterModal" @closed="showFilterModal = false">
    <FilterModal
      :filters="props.searchConfig.filters"
      :cols="props.searchConfig.cols"
      @cancel-clicked="handleCancel"
      @submit-clicked="handleSubmit"
    />
  </Modal>

</template>
