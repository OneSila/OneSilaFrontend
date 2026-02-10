<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Label } from '../../../../../../atoms/label';
import { DateInput } from '../../../../../../atoms/input-date';
import { DateFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: DateFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const date = ref<any>(props.filter.default ?? null);

const formatDate = (value: Date | string) => {
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

watch(
  () => route.query[props.filter.name],
  (newValue) => {
    if (typeof newValue === 'string' && newValue.length) {
      date.value = new Date(newValue);
      return;
    }
    if (newValue === undefined) {
      date.value = null;
    }
  },
  { immediate: true }
);

watchEffect(() => {
  if (date.value) {
    emit('update-value', formatDate(date.value));
    return;
  }
  emit('update-value', null);
});
</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <p v-if="filter.helpText" class="mt-1 text-xs text-gray-500">{{ filter.helpText }}</p>
    <DateInput v-model:model-value="date" class="mb-2" />
  </div>
</template>
