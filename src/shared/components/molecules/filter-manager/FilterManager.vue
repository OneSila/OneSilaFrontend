<script setup lang="ts">
import { ref, watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '../../../plugins/store';
import { booleanifyIfNeeded, getSelectedOrderIndex } from '../../../utils'
import { defaultSearchConfigVals, SearchConfig, BaseFilter, OrderCriteria} from '../../organisms/general-search/searchConfig'

const appStore = useAppStore();
const props = defineProps<{ searchConfig: SearchConfig }>();

const route = useRoute();
const filterVariables = ref({});
const orderVariables = ref({});

// pagination variations
const first = ref<number | null>(null);
const last = ref<number | null>(null);
const before = ref<string | null>(null);
const after = ref<string | null>(null);

const limit: number = props.searchConfig.limitPerPage ?? defaultSearchConfigVals.limitPerPage;

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

const setPaginationVariables = (
  firstVal: number | null = null,
  lastVal: number | null = null,
  beforeVal: string | null = null,
  afterVal: string | null = null
) => {
  first.value = firstVal;
  last.value = lastVal;
  before.value = beforeVal;
  after.value = afterVal;
};

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

  // now let's deal with pagination
  const beforeValue = typeof newQuery.before === 'string' ? newQuery.before : null;
  const afterValue = typeof newQuery.after === 'string' ? newQuery.after : null;

  if (newQuery.before) {
    setPaginationVariables(null, limit, beforeValue, null);
  }
  if (newQuery.after) {
    setPaginationVariables(limit, null, null, afterValue);
  }
  if (newQuery.last === 'true') {
    setPaginationVariables(null, limit, null, null);
  }
  if (newQuery.first === 'true') {
    setPaginationVariables(limit, null, null, null);
  }

  // if no parameter show first page
  if (first.value == null && last.value == null && before.value == null && after.value == null) {
    first.value = limit;
  }

}, { immediate: true });

</script>

<template>
  <slot name="variables"
        :filterVariables="filterVariables"
        :orderVariables="orderVariables"
        :pagination="{ first: first, last: last, before: before, after: after }"
  ></slot>
</template>
