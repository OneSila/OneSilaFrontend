<script setup lang="ts">
import { computed } from 'vue';

type TriStateToggleTone = 'green' | 'red' | 'yellow' | 'blue' | 'gray';

export interface TriStateToggleOption {
  id: string;
  label: string;
  value: string;
  tone?: TriStateToggleTone;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: TriStateToggleOption[];
    disabled?: boolean;
    name?: string;
    compact?: boolean;
    showLabelsAbove?: boolean;
  }>(),
  {
    disabled: false,
    name: undefined,
    compact: false,
    showLabelsAbove: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const activeOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue) ?? props.options[0];
});

const activeLabelClass = computed(() => {
  switch (activeOption.value?.tone) {
    case 'green':
      return 'text-emerald-700';
    case 'red':
      return 'text-rose-700';
    case 'yellow':
      return 'text-amber-700';
    case 'blue':
      return 'text-sky-700';
    case 'gray':
    default:
      return 'text-slate-700';
  }
});

const containerToneClass = computed(() => {
  switch (activeOption.value?.tone) {
    case 'green':
      return props.compact ? 'border-emerald-200 bg-emerald-100/70' : 'border-emerald-200 bg-emerald-50';
    case 'red':
      return props.compact ? 'border-rose-200 bg-rose-100/70' : 'border-rose-200 bg-rose-50';
    case 'yellow':
      return props.compact ? 'border-amber-200 bg-amber-100/70' : 'border-amber-200 bg-amber-50';
    case 'blue':
      return props.compact ? 'border-sky-200 bg-sky-100/70' : 'border-sky-200 bg-sky-50';
    case 'gray':
    default:
      return props.compact ? 'border-slate-200 bg-slate-200/80' : 'border-slate-200 bg-slate-100';
  }
});

const getCompactActiveClasses = (option: TriStateToggleOption) => {
  return 'bg-white shadow-sm ring-1 ring-inset ring-slate-200';
};

const getOptionClasses = (option: TriStateToggleOption) => {
  const isActive = option.value === props.modelValue;

  const baseClasses = props.compact
    ? 'flex h-8 min-w-[2.5rem] flex-1 items-center justify-center rounded-full px-0.5 transition-all duration-200'
    : 'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200';
  const stateClasses = isActive
    ? props.compact
      ? getCompactActiveClasses(option)
      : 'bg-white shadow-sm ring-1 ring-inset ring-slate-200'
    : props.compact
      ? 'bg-transparent hover:bg-slate-50'
      : 'text-slate-500 hover:text-slate-700';
  const disabledClasses = props.disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

  return `${baseClasses} ${stateClasses} ${disabledClasses}`;
};

const getDotClasses = (option: TriStateToggleOption) => {
  const isActive = option.value === props.modelValue;

  switch (option.tone) {
    case 'green':
      return isActive ? 'bg-emerald-600 ring-emerald-200 shadow-sm' : 'bg-emerald-200';
    case 'red':
      return isActive ? 'bg-rose-600 ring-rose-200 shadow-sm' : 'bg-rose-200';
    case 'yellow':
      return isActive ? 'bg-amber-500 ring-amber-200 shadow-sm' : 'bg-amber-200';
    case 'blue':
      return isActive ? 'bg-sky-600 ring-sky-200 shadow-sm' : 'bg-sky-200';
    case 'gray':
    default:
      return isActive ? 'bg-slate-600 ring-slate-200 shadow-sm' : 'bg-slate-300';
  }
};

const getLabelClasses = (option: TriStateToggleOption) => {
  const isActive = option.value === props.modelValue;

  if (!isActive) {
    return 'text-slate-500';
  }

  switch (option.tone) {
    case 'green':
      return 'text-emerald-700';
    case 'red':
      return 'text-rose-700';
    case 'yellow':
      return 'text-amber-700';
    case 'blue':
      return 'text-sky-700';
    case 'gray':
    default:
      return 'text-slate-700';
  }
};

const updateValue = (value: string) => {
  if (props.disabled || value === props.modelValue) {
    return;
  }

  emit('update:modelValue', value);
};
</script>

<template>
  <div class="inline-flex w-full flex-col" :class="compact ? 'gap-1.5' : ''">
    <div
      v-if="showLabelsAbove"
      class="text-center text-[10px] font-semibold uppercase tracking-[0.14em]"
    >
      <span :class="activeLabelClass">
        {{ activeOption?.label }}
      </span>
    </div>

    <div
      class="inline-flex w-full items-center rounded-full border p-0.5"
      :class="[containerToneClass, compact ? 'gap-1' : '', disabled ? 'opacity-60' : '']"
      role="radiogroup"
      :aria-disabled="disabled"
    >
      <button
        v-for="option in options"
        :key="option.id"
        :type="'button'"
        :name="name"
        :disabled="disabled"
        :aria-checked="option.value === modelValue"
        :aria-label="option.label"
        role="radio"
        :class="getOptionClasses(option)"
        @click="updateValue(option.value)"
      >
        <span
          class="rounded-full transition-all duration-200"
          :class="[
            compact
              ? (option.value === modelValue ? 'h-4.5 w-4.5' : 'h-5 w-5')
              : 'h-2.5 w-2.5',
            getDotClasses(option),
            compact
              ? option.value === modelValue
                ? 'ring-2'
                : ''
              : option.value === modelValue
                ? 'ring-4'
                : ''
          ]"
          aria-hidden="true"
        />
        <span v-if="!compact" class="truncate" :class="getLabelClasses(option)">
          {{ option.label }}
        </span>
      </button>
    </div>
  </div>
</template>
