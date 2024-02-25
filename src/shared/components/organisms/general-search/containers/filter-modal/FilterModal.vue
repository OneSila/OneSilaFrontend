<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { reactive, computed } from 'vue';
import { Card } from '../../../../../components/atoms/card';
import { FilterType, BaseFilter } from "../../searchConfig";

import { FilterBoolean } from './containers/filter-boolean';
import { FilterValue } from './containers/filter-value';
import { FilterChoice } from './containers/filter-choice';
import { FilterQuery } from './containers/filter-query';
import { FilterCalendar } from './containers/filter-calendar';
import { FilterSlider } from './containers/filter-slider';
import { FilterCheckbox } from './containers/filter-checkbox';

const { t } = useI18n();

const props = defineProps<{ filters: BaseFilter[], cols: number }>();
const emit = defineEmits(['cancel-clicked', 'submit-clicked']);
const filterValues = reactive({});

const updateFilterValue = (name, value) => {
  filterValues[name] = value;
};
const getFilterComponent = (type) => {
  switch (type) {
    case FilterType.Boolean: return FilterBoolean;
    case FilterType.Value: return FilterValue;
    case FilterType.Choice: return FilterChoice;
    case FilterType.Query: return FilterQuery;
    case FilterType.Calendar: return FilterCalendar;
    case FilterType.Slider: return FilterSlider;
    case FilterType.Checkbox: return FilterCheckbox;
    default: return null;
  }
};

const gridClass = computed(() => {
  return `grid grid-cols-1 ${props.cols === 2 ? 'md:grid-cols-2' : ''} gap-4`;});

const cancel = () => {
  emit('cancel-clicked');
};

const submit = () => {
  emit('submit-clicked', filterValues);
};

</script>

<template>
  <Card class="w-1/2">
    <div :class="gridClass">
      <component
        v-for="filter in filters"
        :key="filter.name"
        :is="getFilterComponent(filter.type)"
        :filter="filter"
        @update-value="updateFilterValue(filter.name, $event)"
      />
    </div>

    <div class="flex justify-end gap-4 mt-4">
      <button class="btn btn-primary" @click="submit">{{ t('shared.button.submit') }}</button>
      <button class="btn btn-danger" @click="cancel">{{ t('shared.button.cancel') }}</button>
    </div>
  </Card>
</template>