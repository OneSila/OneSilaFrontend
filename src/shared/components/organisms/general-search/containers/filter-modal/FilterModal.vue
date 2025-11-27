<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { reactive, computed } from 'vue';
import { Card } from '../../../../../components/atoms/card';
import { Button } from '../../../../../components/atoms/button';
import { SearchFilter } from "../../searchConfig";
import { FieldType } from '../../../../../utils/constants'

import { FilterBoolean } from './containers/filter-boolean';
import { FilterValue } from './containers/filter-value';
import { FilterChoice } from './containers/filter-choice';
import { FilterQuery } from './containers/filter-query';
import { FilterDate } from './containers/filter-date';
import { FilterSlider } from './containers/filter-slider';
import { FilterCheckbox } from './containers/filter-checkbox';
import { FilterDateRange } from './containers/filter-date-range';
import { useAppStore } from '../../../../../plugins/store';

const { t } = useI18n();
const appStore = useAppStore();

const props = defineProps<{ filters: SearchFilter[] | undefined, cols: number }>();
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
    case FieldType.RangeDate: return FilterDateRange;
    case FieldType.Slider: return FilterSlider;
    case FieldType.Checkbox: return FilterCheckbox;
    default: return null;
  }
};

const gridClass = computed(() => {
  return 'grid grid-cols-1 md:grid-cols-2 gap-4';
});

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
  <Card class="w-full md:w-4/5 lg:w-3/4 max-h-[80vh] overflow-y-auto">
    <div :class="gridClass">
      <component
        v-for="filter in filters"
        :key="filter.name"
        :is="getFilterComponent(filter.type)"
        :filter="filter"
        @update-value="updateFilterValue(filter.name, $event)"
      />
    </div>

    <hr class="my-4">
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
  </Card>
</template>
