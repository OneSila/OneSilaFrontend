<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { Label } from '../../../../../../atoms/label';
import { SliderFilter } from '../../../../searchConfig';

const props = defineProps<{ filter: SliderFilter }>();
const emit = defineEmits(['update-value']);
const route = useRoute();

const minBound = computed(() => props.filter.min ?? 0);
const maxBound = computed(() => props.filter.max ?? 100);
const step = computed(() => props.filter.step ?? 1);

const minValue = ref<number>(minBound.value);
const maxValue = ref<number>(maxBound.value);
const isActive = ref<boolean>(false);

const clamp = (value: number) => Math.min(Math.max(value, minBound.value), maxBound.value);

const applyRange = (min: number, max: number) => {
  const nextMin = clamp(min);
  const nextMax = clamp(max);
  if (nextMin > nextMax) {
    minValue.value = nextMax;
    maxValue.value = nextMin;
    return;
  }
  minValue.value = nextMin;
  maxValue.value = nextMax;
};

const parseRange = (value: string): [number, number] | null => {
  if (!value.includes(',')) {
    return null;
  }
  const [minRaw, maxRaw] = value.split(',');
  const min = Number(minRaw);
  const max = Number(maxRaw);
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return null;
  }
  return [min, max];
};

const applyDefault = () => {
  if (Array.isArray(props.filter.default) && props.filter.default.length === 2) {
    applyRange(Number(props.filter.default[0]), Number(props.filter.default[1]));
    isActive.value = true;
    return;
  }
  if (typeof props.filter.default === 'string') {
    const parsed = parseRange(props.filter.default);
    if (parsed) {
      applyRange(parsed[0], parsed[1]);
      isActive.value = true;
      return;
    }
  }
  applyRange(minBound.value, maxBound.value);
  isActive.value = false;
};

watch(
  () => route.query[props.filter.name],
  (newValue) => {
    if (typeof newValue === 'string') {
      const parsed = parseRange(newValue);
      if (parsed) {
        applyRange(parsed[0], parsed[1]);
        isActive.value = true;
        return;
      }
    }
    if (newValue === undefined) {
      applyDefault();
    }
  },
  { immediate: true }
);

watch([minBound, maxBound], () => {
  applyRange(minValue.value, maxValue.value);
});

watchEffect(() => {
  if (isActive.value) {
    emit('update-value', `${minValue.value},${maxValue.value}`);
    return;
  }
  emit('update-value', null);
});

const onMinInput = (value: number) => {
  const next = clamp(value);
  if (next > maxValue.value) {
    maxValue.value = next;
  }
  minValue.value = next;
  isActive.value = true;
};

const onMaxInput = (value: number) => {
  const next = clamp(value);
  if (next < minValue.value) {
    minValue.value = next;
  }
  maxValue.value = next;
  isActive.value = true;
};
</script>

<template>
  <div class="filter-item">
    <Label>{{ filter.label }}</Label>
    <p v-if="filter.helpText" class="mt-1 text-xs text-gray-500">{{ filter.helpText }}</p>
    <div class="mt-2 space-y-2">
      <input
        class="w-full"
        type="range"
        :min="minBound"
        :max="maxBound"
        :step="step"
        :disabled="filter.disabled === true"
        :value="minValue"
        @input="onMinInput(Number(($event.target as HTMLInputElement).value))"
      />
      <input
        class="w-full"
        type="range"
        :min="minBound"
        :max="maxBound"
        :step="step"
        :disabled="filter.disabled === true"
        :value="maxValue"
        @input="onMaxInput(Number(($event.target as HTMLInputElement).value))"
      />
      <div class="flex items-center justify-between text-xs text-gray-600">
        <span>{{ minValue }}</span>
        <span>{{ maxValue }}</span>
      </div>
    </div>
  </div>
</template>
