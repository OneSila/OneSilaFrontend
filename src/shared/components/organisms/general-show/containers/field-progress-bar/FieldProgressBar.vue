<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ProgressBar } from '../../../../molecules/progress-bar';
import type { ProgressBarField } from '../../showConfig';

type ProgressValue = {
  percentage?: number | null;
  percentageColor?: string | null;
  status?: string | null;
};

const props = defineProps<{
  field: ProgressBarField;
  modelValue: ProgressValue | null;
}>();

const { t } = useI18n();

const percentage = computed(() => {
  const rawValue = props.modelValue?.percentage;
  if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) {
    return 0;
  }

  return Math.max(0, Math.min(100, rawValue));
});

const normalizedColor = computed(() => String(props.modelValue?.percentageColor || '').toUpperCase());

const label = computed(() => {
  const status = String(props.modelValue?.status || '').trim();
  if (!status) {
    return `${Math.floor(percentage.value)}%`;
  }

  const translationKey = `importsExports.statuses.${status}`;
  const translated = t(translationKey);
  if (translated !== translationKey) {
    return translated;
  }

  return status.replace(/_/g, ' ');
});

const labelColor = computed(() => {
  switch (normalizedColor.value) {
    case 'RED':
      return 'text-red-600';
    case 'GREEN':
      return 'text-green-600';
    default:
      return 'text-orange-500';
  }
});

const barColor = computed(() => {
  switch (normalizedColor.value) {
    case 'RED':
      return 'bg-red-500';
    case 'GREEN':
      return 'bg-green-500';
    default:
      return 'bg-orange-400';
  }
});
</script>

<template>
  <div :class="field.customCssClass" :style="field.customCss">
    <ProgressBar
      :progress="percentage"
      :label="label"
      :label-color="labelColor"
      :bar-color="barColor"
    />
  </div>
</template>
