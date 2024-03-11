<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { reactive, computed } from 'vue';
import { Card } from '../../../../../components/atoms/card';
import { BaseFilter } from "../../searchConfig";
import { FieldType } from '../../../../../utils/constants'

import { FilterBoolean } from './containers/filter-boolean';
import { FilterValue } from './containers/filter-value';
import { FilterChoice } from './containers/filter-choice';
import { FilterQuery } from './containers/filter-query';
import { FilterDate } from './containers/filter-date';
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
    case FieldType.Boolean: return FilterBoolean;
    case FieldType.Text: return FilterValue;
    case FieldType.Choice: return FilterChoice;
    case FieldType.Query: return FilterQuery;
    case FieldType.Date: return FilterDate;
    case FieldType.Slider: return FilterSlider;
    case FieldType.Checkbox: return FilterCheckbox;
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