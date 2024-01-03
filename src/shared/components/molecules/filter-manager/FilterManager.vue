<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../../../plugins/store';
import { booleanifyIfNeeded, getSelectedOrderIndex } from '../../../utils'
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

if (props.searchConfig.orderKey) {
  keysToWatch.value.push(props.searchConfig.orderKey);
}

props.searchConfig.filters?.forEach((filter: BaseFilter) => {
  keysToWatch.value.push(filter.name);
});

watch(() => route.query, (newQuery) => {
  const updatedVariables = {};
  keysToWatch.value.forEach(key => {
    if (newQuery[key] !== undefined && key != props.searchConfig.orderKey) {
      updatedVariables[key] = booleanifyIfNeeded(newQuery[key]);
    }
  });
  filterVariables.value = updatedVariables;

  if (props.searchConfig.orderKey && newQuery[props.searchConfig.orderKey]) {
    const selectedIndex = getSelectedOrderIndex(
      props.searchConfig.orders,
      newQuery,
      props.searchConfig.orderKey
    );

    if (selectedIndex !== -1) {
      const selectedOrder = props.searchConfig.orders ? props.searchConfig.orders[selectedIndex] : null;

      if (selectedOrder) {
        orderVariables.value = {
          [selectedOrder.name]: selectedOrder.type
        };
      } else {
        orderVariables.value = {};
      }
    } else {
      orderVariables.value = {};
    }
  }

  console.log(orderVariables.value)

}, { immediate: true });

</script>

<template>
  <slot name="variables" :filterVariables="filterVariables" :orderVariables="orderVariables"></slot>
</template>
