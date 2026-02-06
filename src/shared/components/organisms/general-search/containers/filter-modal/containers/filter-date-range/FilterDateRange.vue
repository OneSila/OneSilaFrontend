<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Label } from '../../../../../../atoms/label';
import { RangeDateInput } from '../../../../../../atoms/input-date-range';
import { DateRangeFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: DateRangeFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const dateRange = ref<any>(props.filter.default ?? null);

const formatDate = (date: Date | string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

watch(
  () => route.query[props.filter.name],
  (newValue) => {
    if (typeof newValue === 'string' && newValue.includes(',')) {
      const [start, end] = newValue.split(',');
      const startValue = start && start !== 'None' ? new Date(start) : null;
      const endValue = end && end !== 'None' ? new Date(end) : null;
      dateRange.value = [startValue, endValue];
    } else if (newValue === undefined) {
      dateRange.value = null;
    }
  },
  { immediate: true }
);

watchEffect(() => {
  if (!Array.isArray(dateRange.value)) {
    emit('update-value', null);
    return;
  }

  const [startValue, endValue] = dateRange.value;
  if (!startValue && !endValue) {
    emit('update-value', null);
    return;
  }

  const start = startValue ? formatDate(startValue) : 'None';
  const end = endValue ? formatDate(endValue) : 'None';
  emit('update-value', `${start},${end}`);
});
</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <p v-if="filter.helpText" class="mt-1 text-xs text-gray-500">{{ filter.helpText }}</p>
    <RangeDateInput v-model:model-value="dateRange" class="mb-2" />
  </div>
</template>
