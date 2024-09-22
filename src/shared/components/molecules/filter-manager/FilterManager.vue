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

const limit: number = props.searchConfig.limitPerPage ?? defaultSearchConfigVals.limitPerPage;

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
  if (filter.addLookup) {
    // filtersWithLookup.value[filter.name] = filter.lookupKeys || [];
    let l = 'exact';
    if (filter.lookupType) {
      if (filter.lookupType == 'none') {
        l = null;
      } else {
        l = filter.lookupType;
      }
    }

    filtersWithLookup.value[filter.name] = {
      keys: filter.lookupKeys || [],
      lookup: l
    };
  }
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
      const value = booleanifyIfNeeded(newQuery[key])

      if (value == null) {
        return
      }

      if (key in filtersWithLookup.value) {
        const lookup = filtersWithLookup.value[key]['lookup'];

        // if we have exact lookups like go into a foreign key with an id we need to have ex: {'company: {'id': {'exact': val}}}
        if (filtersWithLookup.value[key]['keys'].length > 0) {
          const nestedObject = {};
          filtersWithLookup.value[key]['keys'].forEach(nestedKey => {
            if (lookup) {
              nestedObject[nestedKey] = { [lookup]: value };
            } else {
              // if lookup is null, directly assign the value like: {'company': {'id': value}}
              nestedObject[nestedKey] = value;
            }
          });
          updatedVariables[key] = nestedObject;
        } else {
          // else we can have only the exact with the value like: {"type": {"exact": "VARIATION"}}
          if (lookup) {
            updatedVariables[key] = { [lookup]: value };
          } else {
            // if lookup is null, directly assign the value like: {"type": "VARIATION"}
            updatedVariables[key] = value;
          }
        }
      } else {
        // if there is no lockup used we will just add the value
        updatedVariables[key] = value;
      }

      if (updatedVariables[key] === null) {
        delete updatedVariables[key];
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
