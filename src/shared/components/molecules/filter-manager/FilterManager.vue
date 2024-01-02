<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../../../plugins/store';
import { booleanifyIfNeeded } from '../../../utils'
import {SearchConfig, BaseFilter, OrderCriteria} from '../../organisms/general-search/searchConfig'

const appStore = useAppStore();
const props = defineProps<{ searchConfig: SearchConfig }>();

const route = useRoute();
const filterVariables = ref({});
const orderVariables = ref({}); // Placeholder for future implementation

const keysToWatch = ref<string[]>([]);
appStore.setSearchConfig(props.searchConfig);

if (props.searchConfig.search) {
  keysToWatch.value.push('search');
}

props.searchConfig.filters?.forEach((filter: BaseFilter) => {
  keysToWatch.value.push(filter.name);
});

props.searchConfig.orders?.forEach((order: OrderCriteria) => {
  keysToWatch.value.push(order.name);
});

watch(() => route.query, (newQuery) => {
  const updatedVariables = {};
  keysToWatch.value.forEach(key => {
    if (newQuery[key] !== undefined) {
      updatedVariables[key] = booleanifyIfNeeded(newQuery[key]);
    }
  });
  filterVariables.value = updatedVariables;
  // For orderVariables, implement similar logic when orders are available
}, { immediate: true });

</script>

<template>
  <slot name="variables" :filterVariables="filterVariables" :orderVariables="orderVariables"></slot>
</template>
