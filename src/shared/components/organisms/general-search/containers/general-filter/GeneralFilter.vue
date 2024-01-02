<script setup lang="ts">
import { ref } from 'vue';
import { defineProps } from 'vue';
import { SearchConfig } from '../../searchConfig';
import { Icon } from "../.././../../atoms/icon"
import { Button } from "../.././../../atoms/button"
import { Modal } from "../.././../../atoms/modal"
import { FilterModal } from "../filter-modal"
import { useRouter } from 'vue-router';

const props = defineProps<{ searchConfig: SearchConfig }>();
const showFilterModal = ref(false);
const router = useRouter();
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

</script>

<template>
  <Button
    custom-class="flex items-center ml-2 p-2 w-10 h-10 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
    @click="showFilterModal = true"
  >
    <Icon name="filter" class="mx-auto" />
  </Button>

  <Modal v-model="showFilterModal" @closed="showFilterModal = false">
    <FilterModal
      :filters="props.searchConfig.filters"
      :cols="props.searchConfig.cols"
      @cancel-clicked="handleCancel"
      @submit-clicked="handleSubmit"
    />
  </Modal>

</template>
