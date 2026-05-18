<script setup lang="ts">
import { Ref, ref, watch, onMounted, computed } from 'vue';
import { Selector } from '../../../../../atoms/selector';
import { QueryFormField } from '../../../formConfig';
import { Icon } from "../../../../../atoms/icon";
import { Button } from "../../../../../atoms/button";
import { Modal } from "../../../../../atoms/modal";
import apolloClient from "../../../../../../../../apollo-client";
import CreateOnFlyModal from "./containers/CreateOnFlyModal.vue";
import debounce from 'lodash.debounce';
import { DocumentNode } from "graphql";

const props = defineProps<{
  field: QueryFormField;
  modelValue: any;
  initialOptions?: any[];
}>();

const DEFAULT_LIMIT = 50;
const DEFAULT_DROPDOWN_MIN_WIDTH = 320;
const DEFAULT_DROPDOWN_MAX_WIDTH = 720;
const DEFAULT_CONTROL_MIN_WIDTH = 180;
const DEFAULT_CONTROL_MAX_WIDTH = 360;

const limit = computed(() => props.field.limit ?? DEFAULT_LIMIT);
const DEFAULT_MIN_SEARCH_LENGTH = 3;
const minSearchLength = computed(() => props.field.minSearchLength ?? DEFAULT_MIN_SEARCH_LENGTH);

onMounted(() => {
  fetchData(null, true);
});

const emit = defineEmits(['update:modelValue', 'label-selected']);
const showCreateOnFlyModal = ref(false);
const loading = ref(true);
const loadingMore = ref(false);
const remoteSearchPending = ref(false);
const rawDataRef: Ref<any> = ref([]);
const cleanedData: Ref<any[]> = ref([]);
const selectedValue = ref(props.modelValue);
const isLiveUpdate = ref(props.field.isLiveUpdate ?? true);
const hasPartialResults = ref(false);
const pageInfo: Ref<any | null> = ref(null);
const totalCount: Ref<number | null> = ref(null);
const fetchedItemsCount = ref(0);
const currentLoadedSearchValue = ref('');
const currentLoadedSearchQuery: Ref<string | null> = ref(null);
const lastSearchInput = ref('');
let fetchRequestId = 0;
let loadMoreRequestId = 0;


const dropdownPosition = props.field.dropdownPosition || 'top';
const mandatory = props.field.mandatory !== undefined ? props.field.mandatory : false;
const multiple = props.field.multiple || false;
const filterable = props.field.filterable || false;
const removable = props.field.removable !== undefined ? props.field.removable : true;

const getOptionLabel = (option: any): string => {
  if (option == null) return '';
  if (props.field.labelBy && typeof option === 'object') {
    const value = option[props.field.labelBy];
    return value == null ? '' : String(value);
  }
  return String(option);
};

const valuesMatch = (a: any, b: any) => {
  if (a === b) {
    return true;
  }

  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

const getSelectedLabel = (value: any): string => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'object') {
    return getOptionLabel(value);
  }

  if (!props.field.valueBy) {
    return String(value);
  }

  const match = cleanedData.value.find((option) => {
    return valuesMatch(option?.[props.field.valueBy!], value);
  });

  return match ? getOptionLabel(match) : '';
};

const canFilterLoadedOptions = computed(() => {
  return filterable || isLiveUpdate.value;
});

const selectorFilterable = computed(() => {
  return canFilterLoadedOptions.value && !hasPartialResults.value && !remoteSearchPending.value;
});

const selectorLoading = computed(() => loading.value || remoteSearchPending.value);

const hasMoreOptions = computed(() => {
  const cursor = pageInfo.value?.endCursor;
  const pageHasMore = pageInfo.value?.hasNextPage === true && Boolean(cursor);
  const countHasMore = totalCount.value !== null &&
    fetchedItemsCount.value < totalCount.value &&
    Boolean(cursor);

  return Boolean(props.field.isEdge && (pageHasMore || countHasMore));
});

const dropdownMaxWidth = computed(() => props.field.dropdownMaxWidth ?? DEFAULT_DROPDOWN_MAX_WIDTH);

const longestResolvedLabelLength = computed(() => {
  const values = Array.isArray(selectedValue.value)
    ? selectedValue.value
    : selectedValue.value != null ? [selectedValue.value] : [];

  const longestSelectedLabelLength = values.reduce((longest, value) => {
    return Math.max(longest, getSelectedLabel(value).length);
  }, 0);

  const longestOptionLabelLength = cleanedData.value.reduce((longest, option) => {
    return Math.max(longest, getOptionLabel(option).length);
  }, 0);

  return Math.max(longestOptionLabelLength, longestSelectedLabelLength);
});

const controlMinWidth = computed(() => {
  const estimatedWidth = longestResolvedLabelLength.value * 8 + 76;

  return Math.min(
    DEFAULT_CONTROL_MAX_WIDTH,
    Math.max(DEFAULT_CONTROL_MIN_WIDTH, estimatedWidth)
  );
});

const dropdownMinWidth = computed(() => {
  if (props.field.dropdownMinWidth) {
    return props.field.dropdownMinWidth;
  }

  const longestLabelLength = longestResolvedLabelLength.value;
  const estimatedWidth = longestLabelLength * 8 + 96;

  if (longestLabelLength === 0) {
    return DEFAULT_DROPDOWN_MIN_WIDTH;
  }

  return Math.min(
    dropdownMaxWidth.value,
    Math.max(DEFAULT_DROPDOWN_MIN_WIDTH, estimatedWidth)
  );
});

const mergeOptions = (base: any[], additions: any[]): any[] => {
  if (!additions?.length) {
    return base;
  }

  if (!props.field.valueBy) {
    const existing = new Set(base);
    additions.forEach((option) => {
      if (option != null && !existing.has(option)) {
        existing.add(option);
      }
    });
    return Array.from(existing);
  }

  const map = new Map<any, any>();
  base.forEach((option) => {
    if (!option) return;
    const key = option[props.field.valueBy!];
    if (key === undefined || key === null) return;
    map.set(key, option);
  });

  additions.forEach((option) => {
    if (!option) return;
    const key = option[props.field.valueBy!];
    if (key === undefined || key === null) return;
    const existing = map.get(key) || {};
    map.set(key, { ...existing, ...option });
  });

  return Array.from(map.values());
};

const mergeInitialOptions = (options?: any[]) => {
  if (!options || !options.length) return;
  cleanedData.value = mergeOptions(cleanedData.value, options.filter(Boolean));
};

watch(
  () => props.initialOptions,
  (options) => {
    if (!options) return;
    mergeInitialOptions(options);
  },
  { deep: true, immediate: true }
);

watch(() => props.modelValue, (value) => {
  if (value !== selectedValue.value) {
    selectedValue.value = value
    if (value != null && selectedValue.value != null) {
      ensureSelectedValuesArePresent();
    }
  }
}, { deep: true });

watch(() => props.field.queryVariables, () => {
  fetchData();
}, { deep: true });

const updateValue = (value) => {
  selectedValue.value = value;
  emit('update:modelValue', value);

  if (value == null) {
    lastSearchInput.value = '';
    cancelPendingSearch();
    fetchData();
  }
};

async function ensureSelectedValuesArePresent() {
  if (!props.field.valueBy || !selectedValue.value) return;

  const extractId = (item: any): string | number | undefined => {
    return typeof item === 'object' && item !== null
      ? item[props.field.valueBy!]
      : item;
  };

  const selectedIds: (string | number | undefined)[] = Array.isArray(selectedValue.value)
    ? selectedValue.value.map(extractId).filter(Boolean)
    : [extractId(selectedValue.value)].filter(Boolean);

  const currentIds = cleanedData.value.map(item => item[props.field.valueBy!]);

  const missingIds = selectedIds.filter(id => !currentIds.includes(id));
  if (missingIds.length === 0) return;

  const { data } = await apolloClient.query({
    query: props.field.query as unknown as DocumentNode,
    variables: {
      filter: {
        [props.field.valueBy]: { inList: missingIds }
      }
    },
    fetchPolicy: 'cache-first'
  });

  const newItems = props.field.isEdge
    ? data[props.field.dataKey]?.edges?.map((e: any) => e.node) ?? []
    : data[props.field.dataKey] ?? [];

  cleanedData.value = mergeOptions(cleanedData.value, newItems);
}

function normalizeSearchValue(searchValue: string | null | undefined) {
  return (searchValue ?? '').replace(/["']/g, '').trim().toLocaleLowerCase();
}

function buildQueryVariables(
  searchValue: string | null | undefined = null,
  pagination: Record<string, any> = {}
) {
  const variables: any = {
    ...props.field.queryVariables,
    filter: {
      ...(props.field.queryVariables?.filter ?? {}),
    },
    ...pagination,
  };

  if (pagination.after) {
    delete variables.before;
    delete variables.last;
  }

  // Handle live updates and search values
  if (isLiveUpdate.value) {
    if (searchValue) {
      variables.filter.search = searchValue;
    } else {
      delete variables.filter.search;
    }
  }

  return variables;
}

async function fetchData(searchValue: string | null | undefined = null, ensureSelected: boolean = false) {
  const requestId = ++fetchRequestId;
  loadMoreRequestId++;
  loadingMore.value = false;

  try {
    loading.value = true;
    const variables = buildQueryVariables(searchValue);

    const { data } = await apolloClient.query({
      query: props.field.query as unknown as DocumentNode,
      variables: variables,
      fetchPolicy: 'cache-first'
    });

    if (requestId !== fetchRequestId) {
      return;
    }

    currentLoadedSearchValue.value = normalizeSearchValue(searchValue);
    currentLoadedSearchQuery.value = searchValue || null;
    processAndCleanData(data[props.field.dataKey]);

    if (ensureSelected) {
      await ensureSelectedValuesArePresent();
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    if (requestId === fetchRequestId) {
      loading.value = false;
      remoteSearchPending.value = false;
    }
  }
}

async function fetchNextPage() {
  if (!hasMoreOptions.value || loading.value || loadingMore.value || remoteSearchPending.value) {
    return;
  }

  const cursor = pageInfo.value?.endCursor;
  if (!cursor) {
    return;
  }

  const activeFetchRequestId = fetchRequestId;
  const requestId = ++loadMoreRequestId;

  try {
    loadingMore.value = true;
    const variables = buildQueryVariables(currentLoadedSearchQuery.value, { after: cursor });

    const { data } = await apolloClient.query({
      query: props.field.query as unknown as DocumentNode,
      variables: variables,
      fetchPolicy: 'cache-first'
    });

    if (activeFetchRequestId !== fetchRequestId || requestId !== loadMoreRequestId) {
      return;
    }

    const nextConnection = data[props.field.dataKey];
    if (!props.field.isEdge || !nextConnection?.edges) {
      return;
    }

    const existingEdges = rawDataRef.value?.edges ?? [];
    const nextEdges = nextConnection.edges ?? [];
    const seen = new Set<any>();
    const mergedEdges = [...existingEdges, ...nextEdges].filter((edge: any) => {
      const node = edge?.node;
      const key = props.field.valueBy ? node?.[props.field.valueBy] : node;

      if (key === undefined || key === null) {
        return true;
      }

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });

    processAndCleanData({
      ...rawDataRef.value,
      ...nextConnection,
      edges: mergedEdges,
      pageInfo: nextConnection.pageInfo,
      totalCount: nextConnection.totalCount ?? rawDataRef.value?.totalCount,
    });
  } catch (error) {
    console.error('Error fetching more data:', error);
  } finally {
    if (requestId === loadMoreRequestId) {
      loadingMore.value = false;
    }
  }
}

function processAndCleanData(rawData: any) {
  let newData: any[] = [];

  if (props.field.isEdge && rawData?.edges) {
    newData = rawData.edges.map((edge: any) => edge.node);
    pageInfo.value = rawData.pageInfo ?? null;
    fetchedItemsCount.value = rawData.edges.length;

    if (!isLiveUpdate.value && rawData.pageInfo && rawData.pageInfo.hasNextPage === true) {
      isLiveUpdate.value = true;
    }
  } else if (Array.isArray(rawData)) {
    newData = rawData;
    pageInfo.value = null;
    fetchedItemsCount.value = rawData.length;
  } else {
    pageInfo.value = null;
    fetchedItemsCount.value = 0;
  }

  totalCount.value = typeof rawData?.totalCount === 'number' ? rawData.totalCount : null;
  hasPartialResults.value = rawData?.pageInfo?.hasNextPage === true ||
    (totalCount.value !== null && fetchedItemsCount.value < totalCount.value);

  rawDataRef.value = rawData;

  const preservedItems: any[] = [];

  const selectedIds: (string | number)[] = Array.isArray(selectedValue.value)
      ? selectedValue.value
      : selectedValue.value ? [selectedValue.value] : [];

    if (props.field.valueBy && selectedIds.length > 0) {
      const currentIds = new Set<string | number>(
        newData.map(item => item[props.field.valueBy!] as string | number)
      );

      for (const prev of cleanedData.value) {
        const val = prev[props.field.valueBy!] as string | number;
        if (selectedIds.includes(val) && !currentIds.has(val)) {
          preservedItems.push(prev);
        }
      }
    }

  cleanedData.value = mergeOptions(newData, preservedItems);
  mergeInitialOptions(props.initialOptions);

  if (props.field.setDefaultKey && (selectedValue.value === undefined || selectedValue.value === null)) {
    const defaultValue = props.field.defaultExpectedValue === undefined ? true : props.field.defaultExpectedValue;
    const defaultEntry = cleanedData.value.find(entry => entry[props.field.setDefaultKey!] === defaultValue);
    if (defaultEntry) {
      updateValue(defaultEntry[props.field.valueBy]);
    }
  }

  if (props.field.default && !selectedValue.value) {
    updateValue(props.field.default);
  }
}


const handleCancel = () => {
  showCreateOnFlyModal.value = false
};

const handleSubmit = (data) => {

  if (!rawDataRef.value) {
    return;
  }

  if (props.field.isEdge) {
    // Create a new array with existing items plus the new item
    // we do that to avoid the object is not extensible error
    rawDataRef.value = {
        ...rawDataRef.value,
        'edges': [...(rawDataRef.value['edges'] || []), { node: data }]
    };
  } else {
    rawDataRef.value.push(data);
  }

  processAndCleanData(rawDataRef.value);

  const createdId = props.field.valueBy ? data?.[props.field.valueBy] : data;
  const createdLabel = props.field.labelBy ? data?.[props.field.labelBy] : null;

  if (props.field.multiple) {
    updateValue([
      ...(selectedValue.value || []),
      createdId
    ]);
  } else {
    updateValue(createdId);
  }

  if (createdId != null && createdLabel != null) {
    emit('label-selected', { id: createdId, label: createdLabel });
  }

  showCreateOnFlyModal.value = false;
};

const debouncedFetchFast = debounce(async (searchValue: string) => {
  if (!searchValue.length) {
    fetchData();
  } else {
    fetchData(searchValue);
  }
}, 500);

const debouncedFetchSlow = debounce(async (searchValue: string) => {
  if (!searchValue.length) {
    fetchData();
  } else {
    fetchData(searchValue);
  }
}, 1000);

const getSanitizedLength = (searchValue: string) => {
  return normalizeSearchValue(searchValue).length;
};

const cancelPendingSearch = () => {
  debouncedFetchFast.cancel();
  debouncedFetchSlow.cancel();
  remoteSearchPending.value = false;
};

const hasSearchBeenReduced = (normalizedSearchValue: string) => {
  return normalizedSearchValue.length < lastSearchInput.value.length;
};

const canUseCurrentOptionsForSearch = (normalizedSearchValue: string) => {
  if (!canFilterLoadedOptions.value) {
    return false;
  }

  if (hasPartialResults.value) {
    return false;
  }

  const loadedSearchValue = currentLoadedSearchValue.value;
  if (!loadedSearchValue) {
    return true;
  }

  return normalizedSearchValue === loadedSearchValue ||
    normalizedSearchValue.startsWith(loadedSearchValue);
};

const shouldSearchRemotely = (searchValue: string) => {
  const normalizedSearch = normalizeSearchValue(searchValue);
  const reducedSearch = hasSearchBeenReduced(normalizedSearch);
  const clearedSearch = normalizedSearch === '' && lastSearchInput.value !== '';

  return clearedSearch || reducedSearch || !canUseCurrentOptionsForSearch(normalizedSearch);
};

const scheduleFetch = (searchValue: string, slow: boolean) => {
  remoteSearchPending.value = true;

  if (slow) {
    debouncedFetchFast.cancel();
    debouncedFetchSlow(searchValue);
  } else {
    debouncedFetchSlow.cancel();
    debouncedFetchFast(searchValue);
  }
};

const handleInput = (searchValue: string) => {
  if (!isLiveUpdate.value) {
    return;
  }

  if (!shouldSearchRemotely(searchValue)) {
    lastSearchInput.value = normalizeSearchValue(searchValue);
    cancelPendingSearch();
    return;
  }

  const sanitizedLength = getSanitizedLength(searchValue);
  const bypassMinLength = sanitizedLength > 0 && (searchValue.includes('"') || searchValue.includes("'"));
  const useSlowDebounce = sanitizedLength < minSearchLength.value && !bypassMinLength;

  lastSearchInput.value = normalizeSearchValue(searchValue);
  scheduleFetch(searchValue, useSlowDebounce);
};

const showAddEntry = computed(() => !!props.field.createOnFlyConfig);

</script>

<template>
  <div class="field-item">
      <Flex>
        <FlexCell grow>
          <Selector
            :modelValue="selectedValue"
            :options="cleanedData"
            :label-by="field.labelBy"
            :value-by="field.valueBy"
            :placeholder="field.placeholder"
            :dropdown-position="dropdownPosition"
            :mandatory="mandatory"
            :multiple="multiple"
            :filterable="selectorFilterable"
            :removable="removable"
            :limit="limit"
            :control-min-width="controlMinWidth"
            :dropdown-min-width="dropdownMinWidth"
            :dropdown-max-width="dropdownMaxWidth"
            wrap-options
            :disabled="field.disabled"
            :show-add-entry="showAddEntry"
            :is-loading="selectorLoading"
            :is-loading-more="loadingMore"
            :has-more-options="hasMoreOptions"
            @update:model-value="updateValue"
            @searched="handleInput"
            @load-more="fetchNextPage"
            @add-clicked="showCreateOnFlyModal = true"
            @label-selected="emit('label-selected', $event)"
          />
        </FlexCell>
        <FlexCell v-if="field.createOnFlyConfig">
          <Button :customClass="'ltr:ml-2 rtl:mr-2 btn btn-primary p-2 rounded-full'" @click="showCreateOnFlyModal = true" :disabled="selectorLoading">
            <Icon name="plus" />
          </Button>
        </FlexCell>
      </Flex>
    <Modal v-if="field.createOnFlyConfig" v-model="showCreateOnFlyModal" @closed="showCreateOnFlyModal = false">
        <CreateOnFlyModal :field="field" @cancel-clicked="handleCancel" @submit-clicked="handleSubmit" />
    </Modal>
  </div>

</template>
