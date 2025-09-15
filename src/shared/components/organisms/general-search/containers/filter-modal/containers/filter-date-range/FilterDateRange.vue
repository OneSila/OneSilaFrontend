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
      dateRange.value = [start ? new Date(start) : null, end ? new Date(end) : null];
    } else if (newValue === undefined) {
      dateRange.value = null;
    }
  },
  { immediate: true }
);

watchEffect(() => {
  if (Array.isArray(dateRange.value) && dateRange.value[0] && dateRange.value[1]) {
    const start = formatDate(dateRange.value[0]);
    const end = formatDate(dateRange.value[1]);
    emit('update-value', `${start},${end}`);
  } else {
    emit('update-value', null);
  }
});
</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <RangeDateInput v-model:model-value="dateRange" class="mb-2" />
  </div>
</template>
