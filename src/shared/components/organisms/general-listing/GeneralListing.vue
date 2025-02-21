<script lang="ts" setup>

import {computed, Ref, ref} from "vue";
import {Button} from '././../../atoms/button';
import {ApolloAlertMutation} from '././../../molecules/apollo-alert-mutation';
import {ListingConfig} from './listingConfig';
import {Pagination} from "../../molecules/pagination";
import {Link} from "../../atoms/link";
import {useI18n} from "vue-i18n";
import {SearchConfig} from "../general-search/searchConfig";
import {FilterManager} from "../../molecules/filter-manager";
import {getFieldComponent} from "../general-show/showConfig";
import {FieldType} from "../../../utils/constants";
import {Checkbox} from "../../atoms/checkbox";
import {Icon} from "../../atoms/icon";
import {Image} from "../../atoms/image";
import {TableRow} from "./containers/table-row";
import {GridCard} from "./containers/grid-card";

const {t} = useI18n();

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

const getShowRoute = (item) => {

  if (props.config.identifierKey === undefined) {
    return undefined;
  }

  const params = {
    ...props.config.identifierVariables,
    [props.config.paramIdentifier || 'id']: item.node[props.config.identifierKey]
  };

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

// --- Bulk Selection Logic ---

// Use a generic variable name so this component remains general.
const selectedEntities = ref<string[]>([]);

// "haveBulk" is true when either bulk edit or bulk delete is enabled.
const haveBulk = computed(() => props.config.addBulkEdit || props.config.addBulkDelete);

// For an individual row, add or remove its ID from the selection.
const selectCheckbox = (id: string, value: boolean) => {
  if (value) {
    if (!selectedEntities.value.includes(id)) {
      selectedEntities.value.push(id);
    }
  } else {
    selectedEntities.value = selectedEntities.value.filter(v => v !== id);
  }
};

// For the header checkbox, select all (or clear all) IDs.
const updateSelectAll = (value: boolean, items: any[]) => {
  if (value) {
    selectedEntities.value = items.map(edge => edge.node[props.config.identifierKey || 'id']);
  } else {
    selectedEntities.value = [];
  }
};

// Compute whether all items are selected.
const allSelected = (items: any[]): boolean => {
  return items.length > 0 && selectedEntities.value.length === items.length;
};

/* ------------------------------------------
   Grid View Helpers & Toggle
---------------------------------------------*/

// If config.addGridView is true, allow switching between "table" and "grid" views.
const viewType = ref('table'); // default view

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

</script>

<template>

  <FilterManager :searchConfig="searchConfig">

    <template v-slot:variables="{ filterVariables, orderVariables, pagination }">
      <ApolloQuery :query="query"
                   :variables="{filter: fixedFilterVariables !== null ? { ...filterVariables, ...fixedFilterVariables } : filterVariables,
                              order: fixedOrderVariables !== null ? { ...orderVariables, ...fixedOrderVariables } : orderVariables,
                              first: pagination.first,
                              last: pagination.last,
                              before: pagination.before,
                              after: pagination.after }">
        <template v-slot="{ result: { loading, error, data }, query }">

          <div v-if="data" class="mt-5 p-0 border-0 overflow-hidden"
               :class="config.isMainPage ? 'card bg-white rounded-xl panel' : ''">
            <div v-if="props.config.addGridView" class="flex justify-end items-center my-1 mx-4 space-x-4">

              <!-- Bulk action buttons (only if any items are selected) -->
              <div v-if="selectedEntities.length > 0 && viewType === 'grid' && haveBulk"
                   class="flex items-center space-x-3">
                <button type="button"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  Bulk edit
                </button>
                <button type="button"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  Delete all
                </button>
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
              <div v-if="selectedEntities.length > 0" class="absolute flex h-12 items-center space-x-3 bg-white"
                   :class="config.addGridView ? 'left-4 top-4' : 'left-12 top-1 '">
                <button type="button"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">
                  Bulk edit
                </button>
                <button type="button"
                        class="inline-flex items-center rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white">
                  Delete all
                </button>
              </div>
                <div class="table-responsive custom-table-scroll">
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
                      :key="item.node.id"
                      :item="item"
                      :config="config"
                      :selectedEntities="selectedEntities"
                      :getUpdatedField="getUpdatedField"
                      :selectCheckbox="selectCheckbox"/>
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
                    :key="item.node.id"
                    :item="item"
                    :config="config"
                    :selectedEntities="selectedEntities"
                    :selectCheckbox="selectCheckbox"/>
              </div>
            </div>

            <div v-if="config.addPagination || config.addGridView" class="py-4 px-2 mt-4">
              <Pagination v-if="config.addPagination" :alignment="config.paginationConfig?.alignment"
                          :button-class="config.paginationConfig?.buttonClass"
                          :page-info="data[queryKey].pageInfo" :use-icons="config.paginationConfig?.useIcons"/>
            </div>

          </div>
        </template>
      </ApolloQuery>
    </template>
  </FilterManager>

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