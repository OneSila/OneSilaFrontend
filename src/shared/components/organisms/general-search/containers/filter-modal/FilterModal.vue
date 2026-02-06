<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { reactive, computed } from 'vue';
import { Card } from '../../../../../components/atoms/card';
import { Button } from '../../../../../components/atoms/button';
import { FilterSection, SearchFilter } from "../../searchConfig";
import { FieldType } from '../../../../../utils/constants'

import { FilterBoolean } from './containers/filter-boolean';
import { FilterValue } from './containers/filter-value';
import { FilterChoice } from './containers/filter-choice';
import { FilterQuery } from './containers/filter-query';
import { FilterIntegration } from './containers/filter-integration';
import { FilterDate } from './containers/filter-date';
import { FilterSlider } from './containers/filter-slider';
import { FilterCheckbox } from './containers/filter-checkbox';
import { FilterDateRange } from './containers/filter-date-range';
import { useAppStore } from '../../../../../plugins/store';

const { t } = useI18n();
const props = defineProps<{
  filters: SearchFilter[] | undefined;
  cols: number;
  sections?: FilterSection[];
}>();
const appStore = useAppStore();
const emit = defineEmits(['cancel-clicked', 'submit-clicked']);
const filterValues = reactive({});

const updateFilterValue = (name, value) => {
  filterValues[name] = value;
};
const getFilterComponent = (type) => {
  switch (type) {
    case FieldType.Boolean: return FilterBoolean;
    case FieldType.Text: return FilterValue;
    case FieldType.Choice: return FilterChoice;
    case FieldType.Query: return FilterQuery;
    case FieldType.Integration: return FilterIntegration;
    case FieldType.Date: return FilterDate;
    case FieldType.RangeDate: return FilterDateRange;
    case FieldType.Slider: return FilterSlider;
    case FieldType.Checkbox: return FilterCheckbox;
    default: return null;
  }
};

const gridClass = computed(() => {
  return 'grid grid-cols-1 md:grid-cols-2 gap-4';
});

const filtersByName = computed(() => {
  const map: Record<string, SearchFilter> = {};
  (props.filters || []).forEach((filter) => {
    map[filter.name] = filter;
  });
  return map;
});

const filterSections = computed(() => {
  const sections = props.sections || [];
  if (sections.length === 0) {
    return [];
  }
  return sections
    .map((section) => ({
      ...section,
      filters: section.filters
        .map((name) => filtersByName.value[name])
        .filter((filter): filter is SearchFilter => Boolean(filter)),
    }))
    .filter((section) => section.filters.length > 0);
});

const hasSections = computed(() => filterSections.value.length > 0);

const cancel = () => {
  emit('cancel-clicked');
};

const submit = () => {
  emit('submit-clicked', filterValues);
};

const convertToDashboardCard = () => {
  appStore.triggerDashboardCardModal();
  cancel();
};

</script>

<template>
  <Card class="w-full md:w-4/5 lg:w-3/4 max-h-[90vh] overflow-y-auto">
    <div v-if="!hasSections" :class="gridClass">
      <component
        v-for="filter in filters"
        :key="filter.name"
        :is="getFilterComponent(filter.type)"
        :filter="filter"
        @update-value="updateFilterValue(filter.name, $event)"
      />
    </div>
    <div v-else class="space-y-6">
      <div
        v-for="section in filterSections"
        :key="section.title"
        class="space-y-4 rounded-lg border border-dotted border-gray-200 bg-gray-50/50 p-4"
      >
        <div>
          <h3 class="text-base font-semibold text-gray-900">{{ section.title }}</h3>
          <p v-if="section.helpText" class="mt-1 text-sm text-gray-500">{{ section.helpText }}</p>
          <hr class="mt-3 border-gray-200">
        </div>
        <div class="max-h-72 overflow-y-auto pr-2">
          <div :class="gridClass">
            <component
              v-for="filter in section.filters"
              :key="filter.name"
              :is="getFilterComponent(filter.type)"
              :filter="filter"
              @update-value="updateFilterValue(filter.name, $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <hr class="my-4">
    <div class="sticky bottom-0 z-10 -mx-4 bg-white/90 px-4 py-3 backdrop-blur-sm">
      <div class="flex justify-end gap-4">
        <Button
          class="text-primary hover:underline px-0 py-0 bg-transparent"
          @click="convertToDashboardCard"
        >
          {{ t('generalSearch.filterModal.convertToDashboardCard') }}
        </Button>
        <Button class="btn btn-outline-dark" @click="cancel">{{ t('shared.button.cancel') }}</Button>
        <Button class="btn btn-primary" @click="submit">{{ t('shared.button.submit') }}</Button>
      </div>
    </div>
  </Card>
</template>
