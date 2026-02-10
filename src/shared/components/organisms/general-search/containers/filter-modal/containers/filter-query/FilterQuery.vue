<script setup lang="ts">

import {ref, watch, watchEffect, onMounted, Ref, computed} from 'vue';
import debounce from 'lodash.debounce';
import { useRoute } from 'vue-router';
import { Selector } from '../../../../../../atoms/selector';
import { Label } from '../../../../../../atoms/label';
import { QueryFilter } from '../../../../searchConfig';
import apolloClient from "../../../../../../../../../apollo-client";
import {DocumentNode} from "graphql";

const STORAGE_KEY = 'filterLabelMap';
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const pruneOldEntries = (map: Record<string, { label: string; timestamp: number }>) => {
  const now = Date.now();
  Object.keys(map).forEach((key) => {
    if (!map[key].timestamp || now - map[key].timestamp > MAX_AGE) {
      delete map[key];
    }
  });
};

const cacheLabel = (id: any, label: string) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    pruneOldEntries(map);
    map[id] = { label, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    // ignore storage errors
  }
};

const storeLabel = ({ id, label }: { id: any; label: string }) => {
  cacheLabel(id, label);
};

const props = defineProps<{ filter: QueryFilter }>();
const limit = computed(() => props.filter.limit ?? 20);
const DEFAULT_MIN_SEARCH_LENGTH = 3;
const minSearchLength = computed(() => props.filter.minSearchLength ?? DEFAULT_MIN_SEARCH_LENGTH);
const emit = defineEmits(['update-value']);
const route = useRoute();
const cleanedData: Ref<any[]> = ref([]);
const loading = ref(true);
const selectedValue = ref(
  props.filter.default !== undefined ? props.filter.default : null
);

async function ensureSelectedValuesArePresent(dataset: any[] = cleanedData.value) {
  if (props.filter.skipFilterParam) return [];
  if (!props.filter.valueBy || !selectedValue.value) return [];

  const extractId = (item: any): string | number | undefined => {
    return typeof item === 'object' && item !== null
      ? item[props.filter.valueBy!]
      : item;
  };

  const selectedIds: (string | number | undefined)[] = Array.isArray(selectedValue.value)
    ? selectedValue.value.map(extractId).filter(Boolean)
    : [extractId(selectedValue.value)].filter(Boolean);

  const currentIds = dataset.map(item => item[props.filter.valueBy!]);

  const missingIds = selectedIds.filter(id => !currentIds.includes(id));
  if (missingIds.length === 0) return [];

  const { data } = await apolloClient.query({
    query: props.filter.query as unknown as DocumentNode,
    variables: {
      filter: {
        [props.filter.valueBy]: { inList: missingIds }
      }
    },
    fetchPolicy: 'cache-first'
  });

  const newItems = props.filter.isEdge
    ? data[props.filter.dataKey]?.edges?.map((e: any) => e.node) ?? []
    : data[props.filter.dataKey] ?? [];

  if (dataset === cleanedData.value) {
    cleanedData.value = [...cleanedData.value, ...newItems];
  }
  return newItems;
}

const fetchData = async (searchValue: string | null = null, ensureSelected: boolean = false) => {
  const variables: any = {
    ...props.filter.queryVariables,
  };

  if (!props.filter.skipFilterParam) {
    variables.filter = {
      ...(props.filter.queryVariables?.filter ?? {}),
    };

    if (searchValue) {
      variables.filter.search = searchValue;
    } else {
      delete variables.filter.search;
    }
  }

  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: props.filter.query as unknown as DocumentNode,
      variables: variables,
      fetchPolicy: 'cache-first'
    });
    let newData: any[] = [];
    if (data && data[props.filter.dataKey]) {
      newData = cleanData(data[props.filter.dataKey]);
    }
    if (ensureSelected) {
      const extra = await ensureSelectedValuesArePresent(newData);
      newData = [...newData, ...extra];
    }
    cleanedData.value = newData;
    loading.value = false;
  } catch (error) {
    console.error('Error fetching data:', error);
    loading.value = false;
  }
};

onMounted(() => fetchData(null, true));

watch(() => route.query[props.filter.name], async (newValue) => {
  if (newValue !== undefined) {
    selectedValue.value = newValue;
    await ensureSelectedValuesArePresent();
  }
}, { immediate: true });

watchEffect(() => {
  emit('update-value', selectedValue.value);
});

watch(selectedValue, async () => {
  await ensureSelectedValuesArePresent();
}, { deep: true });

watch([selectedValue, cleanedData], () => {
  const values = Array.isArray(selectedValue.value)
    ? selectedValue.value
    : [selectedValue.value];
  values.forEach((v) => {
    const match = cleanedData.value.find((opt) => {
      const optValue = props.filter.valueBy ? opt[props.filter.valueBy] : opt;
      return optValue === v;
    });
    if (match) {
      const label = props.filter.labelBy ? match[props.filter.labelBy] : match;
      if (label) {
        cacheLabel(v, label);
      }
    }
  });
});

watch(() => props.filter.queryVariables, () => fetchData(), { deep: true });

const debouncedFetchFast = debounce(async (searchValue: string) => {
  if (!searchValue.length) {
    fetchData(null, true);
  } else {
    fetchData(searchValue, true);
  }
}, 500);

const debouncedFetchSlow = debounce(async (searchValue: string) => {
  if (!searchValue.length) {
    fetchData(null, true);
  } else {
    fetchData(searchValue, true);
  }
}, 1000);

const handleInput = (searchValue: string) => {
  if (props.filter.skipFilterParam) {
    return;
  }
  if (searchValue.length < minSearchLength.value) {
    debouncedFetchFast.cancel();
    debouncedFetchSlow(searchValue);
  } else {
    debouncedFetchSlow.cancel();
    debouncedFetchFast(searchValue);
  }
};

const cleanData = (rawData) => {
  if (props.filter.isEdge && rawData?.edges) {
    return rawData.edges.map(edge => edge.node);
  }
  return rawData;
};

const placeholder = ref(props.filter.placeholder || undefined);
const dropdownPosition = ref(props.filter.dropdownPosition || 'top');
const mandatory = ref(props.filter.mandatory !== undefined ? props.filter.mandatory : false);
const multiple = ref(props.filter.multiple || false);
const filterable = ref(props.filter.filterable || false);
const removable = ref(props.filter.removable !== undefined ? props.filter.removable : true);
const disabled = ref(props.filter.disabled === true);

</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
        <p v-if="filter.helpText" class="mt-1 text-xs text-gray-500">{{ filter.helpText }}</p>
        <Selector
          class="h-9"
          v-model="selectedValue"
          :options="cleanedData"
          :label-by="filter.labelBy"
          :value-by="filter.valueBy"
          :placeholder="placeholder"
          :dropdown-position="dropdownPosition"
          :mandatory="mandatory"
          :multiple="multiple"
          :filterable="filterable"
          :removable="removable"
          :limit="limit"
          :disabled="disabled"
          :is-loading="loading"
          @searched="handleInput"
          @label-selected="storeLabel" />
  </div>
</template>
