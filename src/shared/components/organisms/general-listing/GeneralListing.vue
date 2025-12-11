<script lang="ts" setup>

import { computed, onBeforeUnmount, ref, watch } from "vue";
import { ListingConfig } from './listingConfig';
import { Pagination } from "../../molecules/pagination";
import { Selector } from "../../atoms/selector";
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from "vue-i18n";
import { SearchConfig } from "../general-search/searchConfig";
import { FilterManager } from "../../molecules/filter-manager";
import { FieldType } from "../../../utils/constants";
import { Checkbox } from "../../atoms/checkbox";
import { Icon } from "../../atoms/icon";
import { TableRow } from "./containers/table-row";
import { GridCard } from "./containers/grid-card";
import FilterChipList from './components/FilterChipList.vue';
import CreateDashboardCardModal from './components/CreateDashboardCardModal.vue';
import apolloClient from "../../../../../apollo-client";
import { Toast } from "../../../modules/toast";
import Swal from 'sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import type { DocumentNode, FieldNode, SelectionSetNode } from 'graphql';
import { print, visit } from 'graphql';
import { useAppStore } from '../../../plugins/store';
import { Button } from "../../atoms/button";
import { Loader } from "../../atoms/loader";

const { t } = useI18n();
const SELECT_ALL_PAGE_SIZE = 100;

const props = withDefaults(
    defineProps<{
      searchConfig: SearchConfig;
      config: ListingConfig;
      query: any;
      queryKey: any;
      fixedFilterVariables?: any;
      fixedOrderVariables?: any;
    }>(),
    {
      fixedFilterVariables: null,
      fixedOrderVariables: null
    }
);
const slots = defineSlots<{
  bulkActions?: (scope: { selectedEntities: string[]; viewType: string; query: any }) => any;
  additionalButtons?: (scope: { item: any }) => any;
}>();

const identifierField = computed(() => props.config.identifierKey || 'id');


const getShowRoute = (item) => {

  if (props.config.identifierKey === undefined) {
    return undefined;
  }

  const params = {
    ...props.config.identifierVariables,
    [props.config.paramIdentifier || 'id']: item.node[props.config.identifierKey]
  };

  if (props.config.secondIdentifierKey && props.config.secondIdentifierParam) {
    params[props.config.secondIdentifierParam] = item.node[props.config.secondIdentifierKey];
  }

  return {
    name: props.config.showUrlName,
    params,
    query: {...props.config.urlQueryParams}
  };
};

const getUpdatedField = (field, item, index) => {
  if (index === 0 && props.config.addShow) {
    return {
      ...field,
      clickable: true,
      clickUrl: getShowRoute(item),
    };
  }
  return field;
}

const createFieldNode = (name: string): FieldNode => ({
  kind: 'Field',
  name: { kind: 'Name', value: name }
});

const createSelectionSet = (fields: string[]): SelectionSetNode => ({
  kind: 'SelectionSet',
  selections: fields.map((field) => createFieldNode(field))
});

const createNodeField = (identifier: string): FieldNode => ({
  kind: 'Field',
  name: { kind: 'Name', value: 'node' },
  selectionSet: createSelectionSet([identifier])
});

const buildSelectAllQuery = (query: DocumentNode | null, identifier: string): DocumentNode | null => {
  if (!query) {
    return null;
  }

  try {
    return visit(query, {
      Field(node) {
        if (node.name.value === 'edges') {
          return {
            ...node,
            selectionSet: {
              kind: 'SelectionSet',
              selections: [createNodeField(identifier)]
            }
          };
        }

        if (node.name.value === 'node') {
          return {
            ...node,
            selectionSet: createSelectionSet([identifier])
          };
        }

        if (node.name.value === 'pageInfo') {
          return {
            ...node,
            selectionSet: createSelectionSet(['endCursor', 'hasNextPage'])
          };
        }

        return node;
      }
    });
  } catch (error) {
    console.warn('Failed to build select-all query', error);
    return query;
  }
};

const selectAllQuery = computed(() => buildSelectAllQuery((props.query as DocumentNode) || null, identifierField.value));
const selectingAll = ref(false);

const shouldShowSelectAllButton = (totalCount?: number | null, currentPageLength = 0) => {
  if (typeof totalCount !== 'number') {
    return false;
  }
  if (totalCount <= currentPageLength) {
    return false;
  }
  return selectedEntities.value.length < totalCount;
};


// Use a generic variable name so this component remains general.
const selectedEntities = ref<string[]>([]);

// "haveBulk" is true when either bulk edit or bulk delete is enabled.
const haveBulk = computed(() => props.config.addBulkEdit || (props.config.addBulkDelete && props.config.bulkDeleteMutation) || props.config.addBulkActions);

// For an individual row, add or remove its ID from the selection.
const selectCheckbox = (id: string | number, value: boolean) => {
  const normalizedId = String(id);
  if (value) {
    if (!selectedEntities.value.includes(normalizedId)) {
      selectedEntities.value.push(normalizedId);
    }
  } else {
    selectedEntities.value = selectedEntities.value.filter(v => v !== normalizedId);
  }
};

// For the header checkbox, select all (or clear all) IDs.
const updateSelectAll = (value: boolean, items: any[]) => {
  if (value) {
    const ids = items
      .map(edge => edge?.node?.[identifierField.value])
      .filter((id): id is string | number => id !== undefined && id !== null)
      .map((id) => String(id));
    selectedEntities.value = ids;
  } else {
    selectedEntities.value = [];
  }
};

// Compute whether all items are selected.
const allSelected = (items: any[]): boolean => {
  if (items.length === 0) {
    return false;
  }
  return items.every((edge) => {
    const id = edge?.node?.[identifierField.value];
    return id !== undefined && id !== null && selectedEntities.value.includes(String(id));
  });
};

const getSelectedLabel = (selectedCount: number, totalCount?: number | null) => {
  if (typeof totalCount === 'number') {
    return t('shared.labels.selectedOfTotal', { selected: selectedCount, total: totalCount });
  }
  return `${selectedCount} ${t('shared.labels.selected')}`;
};

/* ------------------------------------------
   Grid View Helpers & Toggle
---------------------------------------------*/

// If config.addGridView is true, allow switching between "table" and "grid" views.
const viewType = ref('table'); // default view

// Limit per page selector
const router = useRouter();
const route = useRoute();
const perPageOptions = [
  { name: '10', value: 10 },
  { name: '20', value: 20 },
  { name: '50', value: 50 },
  { name: '100', value: 100 },
];
const limitPerPage = ref<number>(props.searchConfig.limitPerPage ?? 20);

watch(() => route.query.limitPerPage, (val) => {
  const parsed = parseInt(val as string, 10);
  if (!isNaN(parsed)) {
    limitPerPage.value = parsed;
  }
}, { immediate: true });

const updateLimitPerPage = (value: number) => {
  const newQuery = { ...route.query, limitPerPage: String(value) };
  ['first', 'last', 'before', 'after'].forEach((key) => {
    if (key in newQuery) {
      delete newQuery[key];
    }
  });
  router.push({ query: newQuery });
};

const labelRefresh = ref(0);

async function fetchFilterLabel(filter: any, id: string, stored: Record<string, { label: string; timestamp: number }>) {
  try {
    const { data } = await apolloClient.query({
      query: filter.query as unknown as DocumentNode,
      variables: {
        ...(filter.queryVariables || {}),
        filter: {
          [filter.valueBy]: { inList: [id] }
        }
      },
      fetchPolicy: 'cache-first'
    });
    const result = filter.isEdge ? data[filter.dataKey]?.edges?.[0]?.node : data[filter.dataKey]?.[0];
    const label = result?.[filter.labelBy];
    if (label) {
      stored[id] = { label, timestamp: Date.now() };
      localStorage.setItem('filterLabelMap', JSON.stringify(stored));
      labelRefresh.value++;
    }
  } catch (e) {
    // ignore errors
  }
}

const filterChips = computed(() => {
  labelRefresh.value;
  const q = route.query as Record<string, any>;
  const chips: { key: string; label: string; value: string; rawValue: string }[] = [];
  let stored: Record<string, { label: string; timestamp: number }> = {};
  const searchParam = q.search;
  const normalisedSearchValue = Array.isArray(searchParam) ? searchParam[0] : searchParam;
  if (typeof normalisedSearchValue === 'string') {
    const trimmedSearchValue = normalisedSearchValue.trim();
    if (trimmedSearchValue !== '') {
      chips.push({
        key: 'search',
        label: t('generalListing.labels.search'),
        value: trimmedSearchValue,
        rawValue: normalisedSearchValue,
      });
    }
  }
  const raw = localStorage.getItem('filterLabelMap');
  if (raw) {
    try {
      stored = JSON.parse(raw);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      let changed = false;
      Object.keys(stored).forEach((k) => {
        if (!stored[k].timestamp || now - stored[k].timestamp > maxAge) {
          delete stored[k];
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('filterLabelMap', JSON.stringify(stored));
      }
    } catch (e) {
      stored = {};
    }
  }
  props.searchConfig.filters?.forEach((filter: any) => {
    const label = filter.label;
    const param = q[filter.name];
    if (param === undefined || param === null || param === '') {
      return;
    }
    const isStrictBoolean =
      filter.type === FieldType.Boolean && filter.strict;
    const map =
      'options' in filter && filter.options
        ? Object.fromEntries(
            filter.options.map((o: any) => [o[filter.valueBy], o[filter.labelBy]])
          )
        : null;
    if (Array.isArray(param)) {
      param.forEach((v: any) => {
        const key = String(v);
        if (isStrictBoolean && key === 'all') {
          return;
        }
        let display = map?.[key] || stored[key]?.label;
        if (!display && 'query' in filter && filter.query) {
          fetchFilterLabel(filter, key, stored);
          display = key;
        }
        let value = display || key;
        if (filter.type === FieldType.Boolean) {
          value = value === 'true' ? t('shared.labels.yes') : value === 'false' ? t('shared.labels.no') : value;
        }
        chips.push({ key: filter.name, label, value, rawValue: key });
      });
    } else {
      const key = String(param);
      if (isStrictBoolean && key === 'all') {
        return;
      }
      let display = map?.[key] || stored[key]?.label;
      if (!display && 'query' in filter && filter.query) {
        fetchFilterLabel(filter, key, stored);
        display = key;
      }
      let value = display || key;
      if (filter.type === FieldType.Boolean) {
        value = value === 'true' ? t('shared.labels.yes') : value === 'false' ? t('shared.labels.no') : value;
      }
      chips.push({ key: filter.name, label, value, rawValue: key });
    }
  });
  return chips;
});

const removeFilter = (key: string, value?: string) => {
  const newQuery = { ...route.query } as Record<string, any>;
  const current = newQuery[key];
  if (Array.isArray(current) && value !== undefined) {
    const updated = current.filter((v: any) => String(v) !== value);
    if (updated.length > 0) {
      newQuery[key] = updated;
    } else {
      delete newQuery[key];
    }
  } else {
    delete newQuery[key];
  }
  router.replace({ query: newQuery });
};

// Helper: for a given item, return the first field that has addImage and an imageField.
const getImageField = (item: any) => {
  for (const field of props.config.fields) {
    if (field.type === FieldType.Text && field.addImage && field.imageField) {

      if (!item.node[field.imageField]) {
        return null;
      }

      return {imageValue: item.node[field.imageField], modelValue: item.node[field.name]};
    }
  }
  return null;
};

const deleteAll = async (query) => {

  const defaultSwalOptions = {
    title: t('shared.alert.mutationAlert.title'),
    text: t('shared.alert.mutationAlert.text'),
    confirmButtonText: t('shared.alert.mutationAlert.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em'
  };

  const defaultSwalClasses = {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-secondary',
    cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3'
  }

    const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false
  });

  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);

  if (!result.isConfirmed) {
    return
  }

  const inputData = selectedEntities.value.map((entity) => ({
    id: entity
  }));

  try {
    const { data } = await apolloClient.mutate({
      mutation: props.config.bulkDeleteMutation,
      variables: { data: inputData }
    });

    Toast.success(
      props.config.bulkDeleteSuccessAlert || t('shared.alert.toast.bulkDeleteSuccess')
    );

    query.refetch();
  } catch (error) {
    Toast.error(
      props.config.bulkDeleteErrorAlert || t('shared.alert.toast.bulkDeleteError')
    );
  }

  selectedEntities.value = [];
};

const clearSelected = () => {
  selectedEntities.value = []
}

const showCreateDashboardCardModal = ref(false);
const createDashboardCardContext = ref<{ query: string; variables: Record<string, any>; queryKey: string }>({
  query: '',
  variables: {},
  queryKey: ''
});
const queryText = computed(() => print(props.query as DocumentNode));
const appStore = useAppStore();
type FilterStateSnapshot = {
  filterVariables: Record<string, any> | null;
  orderVariables: Record<string, any> | null;
  pagination: Record<string, any>;
};

const latestFilterState = ref<FilterStateSnapshot>({
  filterVariables: null,
  orderVariables: null,
  pagination: {
    first: null,
    last: null,
    before: null,
    after: null
  }
});

const buildQueryVariables = (
  filterVariables: Record<string, any> | null,
  orderVariables: Record<string, any> | null,
  pagination: Record<string, any>
) => {
  const baseFilter = filterVariables || {};
  const baseOrder = orderVariables || {};
  const filter = props.fixedFilterVariables !== null ? { ...baseFilter, ...props.fixedFilterVariables } : baseFilter;
  const order = props.fixedOrderVariables !== null ? { ...baseOrder, ...props.fixedOrderVariables } : baseOrder;
  const variables = {
    filter,
    order,
    first: pagination.first,
    last: pagination.last,
    before: pagination.before,
    after: pagination.after
  };
  return JSON.parse(JSON.stringify(variables));
};

const selectAllAcrossPages = async (totalCount?: number | null) => {

  if (selectingAll.value) {
    return;
  }
  if (typeof totalCount !== 'number' || totalCount === 0) {
    return;
  }
  if (selectedEntities.value.length >= totalCount) {
    return;
  }

  const queryDocument = selectAllQuery.value;
  if (!queryDocument) {
    Toast.error(t('generalListing.alerts.selectAllError'));
    return;
  }

  const { filterVariables, orderVariables } = latestFilterState.value;
  const baseFilter = filterVariables ? JSON.parse(JSON.stringify(filterVariables)) : {};
  const baseOrder = orderVariables ? JSON.parse(JSON.stringify(orderVariables)) : {};
  const computedFilter =
    props.fixedFilterVariables !== null
      ? { ...baseFilter, ...props.fixedFilterVariables }
      : baseFilter;
  const computedOrder =
    props.fixedOrderVariables !== null
      ? { ...baseOrder, ...props.fixedOrderVariables }
      : baseOrder;

  const aggregated = new Set<string>();
  let hasNextPage = true;
  let afterCursor: string | null = null;

  selectingAll.value = true;
  try {
    while (hasNextPage) {
      const variables = {
        filter: computedFilter,
        order: computedOrder,
        first: SELECT_ALL_PAGE_SIZE,
        after: afterCursor,
        last: null,
        before: null
      };

      const { data } = await apolloClient.query({
        query: queryDocument,
        variables,
        fetchPolicy: 'network-only'
      });

      const connection = data?.[props.queryKey];
      if (!connection) {
        break;
      }

      const edges = connection.edges || [];
      edges.forEach((edge: any) => {
        const idValue = edge?.node?.[identifierField.value];
        if (idValue !== undefined && idValue !== null) {
          aggregated.add(String(idValue));
        }
      });

      if (aggregated.size >= totalCount) {
        break;
      }

      const pageInfo = connection.pageInfo || {};
      hasNextPage = Boolean(pageInfo?.hasNextPage);
      afterCursor = pageInfo?.endCursor ?? null;

      if (!hasNextPage) {
        break;
      }
    }

    selectedEntities.value = Array.from(aggregated);
  } catch (error) {
    console.error('Failed to select all records', error);
    Toast.error(t('generalListing.alerts.selectAllError'));
  } finally {
    selectingAll.value = false;
  }
};

const openCreateDashboardCardModal = (variables?: Record<string, any>) => {
  createDashboardCardContext.value = {
    query: queryText.value,
    variables: variables || {},
    queryKey: props.queryKey
  };
  showCreateDashboardCardModal.value = true;
};

defineExpose({
  clearSelected
})

const captureFilterState = (
  filterVariables: Record<string, any> | null,
  orderVariables: Record<string, any> | null,
  pagination: Record<string, any>
) => {
  latestFilterState.value = {
    filterVariables,
    orderVariables,
    pagination
  };
  return true;
};

const handleLoadingChange = (isLoading: boolean) => {
  appStore.setSearchLoading(isLoading);
};

onBeforeUnmount(() => {
  appStore.setSearchLoading(false);
});

watch(
  () => appStore.dashboardCardModalTrigger,
  (newValue, oldValue) => {
    if (newValue === oldValue) {
      return;
    }

    const { filterVariables, orderVariables, pagination } = latestFilterState.value;
    openCreateDashboardCardModal(buildQueryVariables(filterVariables, orderVariables, pagination));
  }
);


</script>

<template>

  <FilterManager :searchConfig="searchConfig">

    <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
      <div v-if="captureFilterState(filterVariables, orderVariables, pagination)" class="hidden" aria-hidden="true"></div>
      <ApolloQuery :query="query" fetch-policy="cache-and-network"
                   :variables="{filter: fixedFilterVariables !== null ? { ...filterVariables, ...fixedFilterVariables } : filterVariables,
                              order: fixedOrderVariables !== null ? { ...orderVariables, ...fixedOrderVariables } : orderVariables,
                              first: pagination.first,
                              last: pagination.last,
                              before: pagination.before,
                              after: pagination.after }"
                   :notify-on-network-status-change="true"
                   @loading="handleLoadingChange">
        <template v-slot="{ result: { loading, error, data }, query }">

          <div v-if="data" class="mt-5 p-0 border-0 "
               :class="config.isMainPage ? 'card bg-white rounded-xl panel' : ''">
            <FilterChipList
              :chips="filterChips"
              @remove="removeFilter"
              @create="() => openCreateDashboardCardModal(buildQueryVariables(filterVariables, orderVariables, pagination))"
            />
            <div v-if="props.config.addGridView" class="flex justify-end items-center my-1 mx-4 space-x-4">

              <div class="flex items-center space-x-2">
                <span class="text-sm font-semibold text-gray-900">
                  {{ getSelectedLabel(selectedEntities.length, data[queryKey]?.totalCount) }}
                </span>
                <Button
                  v-if="selectedEntities.length > 0 && shouldShowSelectAllButton(data[queryKey]?.totalCount, data[queryKey]?.edges?.length || 0)"
                  class="text-primary hover:underline px-0 py-0 bg-transparent"
                  :disabled="selectingAll"
                  @click="selectAllAcrossPages(data[queryKey]?.totalCount)"
                >
                  {{ t('generalListing.actions.selectAllCount', { count: data[queryKey]?.totalCount }) }}
                </Button>
                <Loader :loading="selectingAll" />
              </div>

              <!-- Bulk action buttons (only if any items are selected) -->
              <div v-if="selectedEntities.length > 0 && viewType === 'grid' && haveBulk" class="flex items-center space-x-3">
                <button v-if="config.addBulkEdit" type="button"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  {{ t('shared.button.editAll') }}
                </button>
                <button v-if="config.addBulkDelete && config.bulkDeleteMutation" type="button" @click="deleteAll(query)"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  {{ t('shared.button.deleteAll') }}
                </button>

                <slot name="bulkActions" v-bind="{ selectedEntities, viewType, query }" />
              </div>
              <!-- Select All control -->
              <div v-if="viewType === 'grid' && haveBulk" class="flex items-center mt-1">
                <Checkbox
                    :modelValue="allSelected(data[queryKey].edges)"
                    @update:model-value="value => updateSelectAll(value, data[queryKey].edges)">
                  <span class="text-sm font-semibold text-gray-900">Select All</span>
                </Checkbox>
              </div>


              <div class="flex justify-end py-2 mx-4">
                <button @click="viewType = 'table'" :class="{ 'text-blue-500': viewType === 'table' }" class="mr-2">
                  <Icon name="table" size="xl"/>
                </button>
                <button @click="viewType = 'grid'" :class="{ 'text-blue-500': viewType === 'grid' }">
                  <Icon name="images" size="xl"/>
                </button>
              </div>
            </div>

            <div v-if="viewType === 'table'">
              <div v-if="selectedEntities.length > 0" class="flex ml-4 items-center space-x-3 bg-white">
                <button v-if="config.addBulkEdit" type="button"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">
                  {{ t('shared.button.editAll') }}
                </button>
                <button v-if="config.addBulkDelete && config.bulkDeleteMutation" type="button" @click="deleteAll(query)"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">
                  {{ t('shared.button.deleteAll') }}
                </button>

                  <slot name="bulkActions" v-bind="{ selectedEntities, viewType, query }" />
              </div>
                <div :class="data[queryKey].edges.length > 0 ? 'table-responsive custom-table-scroll' : ''">
                  <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                  <thead>
                  <tr>
                    <!-- Header checkbox column with fixed small width -->
                    <th v-if="haveBulk" scope="col" class="text-left text-sm font-semibold text-gray-900"
                        style="width: 40px;">
                      <Checkbox
                          class="mt-2"
                          :modelValue="allSelected(data[queryKey].edges)"
                          @update:model-value="value => updateSelectAll(value, data[queryKey].edges)"/>
                    </th>

                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        v-for="header in config.headers" :key="header">{{ header }}
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 !text-end"
                        v-if="config.addActions">{{ t('shared.labels.actions') }}
                    </th>
                  </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                  <!-- Delegate each row to TableRow.vue -->
                  <TableRow
                    v-for="item in data[queryKey].edges"
                    :have-bulk="haveBulk"
                    :key="item.node.id"
                    :item="item"
                    :config="config"
                    :selectedEntities="selectedEntities"
                    :getUpdatedField="getUpdatedField"
                    :selectCheckbox="selectCheckbox"
                    :query-object="{
                       query: props.query,
                       filter: fixedFilterVariables !== null ? { ...filterVariables, ...fixedFilterVariables } : filterVariables,
                       order: fixedOrderVariables !== null ? { ...orderVariables, ...fixedOrderVariables } : orderVariables,
                       pagination: pagination,
                    }"
                  >
                    <template #additionalButtons="{ item: tableItem }">
                      <slot name="additionalButtons" :item="tableItem" />
                    </template>
                  </TableRow>
                  </tbody>
                </table>
              </div>

            </div>

            <!-- Grid (Gallery) View -->
            <div v-else class="mt-5">
              <div
                  class="gallery grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
                <!-- Delegate each grid card to GridCard.vue -->
                <GridCard
                    v-for="item in data[queryKey].edges"
                    :have-bulk="haveBulk"
                    :key="item.node.id"
                    :item="item"
                    :config="config"
                    :selectedEntities="selectedEntities"
                    :selectCheckbox="selectCheckbox"
                    :query-object="{
                       query: props.query,
                       filter: fixedFilterVariables !== null ? { ...filterVariables, ...fixedFilterVariables } : filterVariables,
                       order: fixedOrderVariables !== null ? { ...orderVariables, ...fixedOrderVariables } : orderVariables,
                       pagination: pagination,
                    }"
                >
                  <template #additionalButtons="{ item: gridItem }">
                    <slot name="additionalButtons" :item="gridItem" />
                  </template>
                </GridCard>
              </div>
            </div>

            <div v-if="config.addPagination || config.addGridView" class="py-4 px-2 mt-4 flex items-center space-x-2">
              <Pagination v-if="config.addPagination" :alignment="config.paginationConfig?.alignment"
                          :button-class="config.paginationConfig?.buttonClass"
                          :page-info="data[queryKey].pageInfo" :use-icons="config.paginationConfig?.useIcons"/>
              <div v-if="config.addPagination && (data[queryKey].pageInfo.hasNextPage || data[queryKey].pageInfo.hasPreviousPage)">
                <Selector
                    :options="perPageOptions"
                    :model-value="limitPerPage"
                    :clearable="false"
                    dropdown-position="bottom"
                    value-by="value"
                    label-by="name"
                    :placeholder="t('pagination.perPage')"
                    @update:model-value="updateLimitPerPage"/>
              </div>
            </div>

          </div>
        </template>
      </ApolloQuery>
    </template>
  </FilterManager>

  <CreateDashboardCardModal
    v-model="showCreateDashboardCardModal"
    :query-text="createDashboardCardContext.query"
    :variables="createDashboardCardContext.variables"
    :query-key="createDashboardCardContext.queryKey"
  />

</template>

<style scoped>

.custom-table-scroll {
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

.custom-table-scroll::-webkit-scrollbar {
  height: 6px;
}

.custom-table-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-table-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-table-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}


</style>
