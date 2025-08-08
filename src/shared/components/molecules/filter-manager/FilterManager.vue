<script setup lang="ts">
import { ref, watch } from 'vue';
import {useRoute} from 'vue-router';
import {useAppStore} from '../../../plugins/store';
import {booleanifyIfNeeded, getSelectedOrderIndex} from '../../../utils'
import { defaultSearchConfigVals, SearchConfig, SearchFilter} from '../../organisms/general-search/searchConfig'

const appStore = useAppStore();
const props = defineProps<{ searchConfig: SearchConfig }>();

const route = useRoute();
const filterVariables = ref<Record<string, string> | null>({});
const orderVariables = ref({});

// pagination variations
const first = ref<number | null>(null);
const last = ref<number | null>(null);
const before = ref<string | null>(null);
const after = ref<string | null>(null);

// make the limit reactive so it can be changed via query params
const limit = ref<number>(props.searchConfig.limitPerPage ?? defaultSearchConfigVals.limitPerPage);

const keysToWatch = ref<string[]>([]);
const filtersWithLookup = ref<Record<string, any>>({});
appStore.setSearchConfig(props.searchConfig);

if (props.searchConfig.search) {
  keysToWatch.value.push('search');
}

if (props.searchConfig.orderKey) {
  keysToWatch.value.push(props.searchConfig.orderKey);
}

props.searchConfig.filters?.forEach((filter: SearchFilter) => {
  keysToWatch.value.push(filter.name);

  let l: string | null = 'exact';
  if (filter.lookupType) {
    if (filter.lookupType == 'none') {
      l = null;
    } else {
      l = filter.lookupType;
    }
  }

  filtersWithLookup.value[filter.name] = {
    keys: filter.lookupKeys || [],
    lookup: filter.addLookup ? l : null,
    isNot: filter.isNot || false,
  };
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

  // update the page limit if a query parameter is provided
  const queryLimit = parseInt(newQuery.limitPerPage as string, 10);
  if (!isNaN(queryLimit)) {
    limit.value = queryLimit;
    setPaginationVariables(limit.value, null, null, null);
  } else {
    limit.value = props.searchConfig.limitPerPage ?? defaultSearchConfigVals.limitPerPage;
  }
  
  keysToWatch.value.forEach(key => {
    if (newQuery[key] !== undefined && key != props.searchConfig.orderKey) {
      const value = booleanifyIfNeeded(newQuery[key])

      if (value == null) {
        return
      }

      if (key in filtersWithLookup.value) {
        const { lookup, keys, isNot } = filtersWithLookup.value[key];

        const buildObject = () => {
          if (keys.length > 0) {
            const nestedObject = {} as Record<string, any>;
            let currentLevel = nestedObject;
            keys.forEach((nestedKey: string, index: number, array: string[]) => {
              if (index === array.length - 1) {
                currentLevel[nestedKey] = lookup ? { [lookup]: value } : value;
              } else {
                currentLevel[nestedKey] = {};
                currentLevel = currentLevel[nestedKey];
              }
            });
            return nestedObject;
          }
          return lookup ? { [lookup]: value } : value;
        };

        const builtValue = buildObject();

        if (isNot) {
          if (!updatedVariables['NOT']) {
            updatedVariables['NOT'] = {};
          }
          if (typeof builtValue === 'object' && !Array.isArray(builtValue)) {
            updatedVariables['NOT'] = { ...updatedVariables['NOT'], ...builtValue };
          } else {
            updatedVariables['NOT'][key] = builtValue;
          }
        } else {
          updatedVariables[key] = builtValue;
        }
      } else {
        // if there is no lockup used we will just add the value
        updatedVariables[key] = value;
      }
    }
  });

  if (Object.keys(updatedVariables).length === 0) {
    filterVariables.value = null;
  } else {
    filterVariables.value = updatedVariables;
  }

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

  if (props.searchConfig.orders && props.searchConfig.orders.length > 0 && props.searchConfig.orderKey && !newQuery[props.searchConfig.orderKey]) {
    orderVariables.value = {};
  }

  // now let's deal with pagination
  const beforeValue = typeof newQuery.before === 'string' ? newQuery.before : null;
  const afterValue = typeof newQuery.after === 'string' ? newQuery.after : null;

  if (newQuery.before) {
    setPaginationVariables(null, limit.value, beforeValue, null);
  }
  if (newQuery.after) {
    setPaginationVariables(limit.value, null, null, afterValue);
  }
  if (newQuery.last === 'true') {
    setPaginationVariables(null, limit.value, null, null);
  }
  if (newQuery.first === 'true') {
    setPaginationVariables(limit.value, null, null, null);
  }

  // if no parameter show first page
  if (first.value == null && last.value == null && before.value == null && after.value == null) {
    first.value = limit.value;
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
