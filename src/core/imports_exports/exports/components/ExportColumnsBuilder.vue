<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../shared/components/atoms/icon';
import { EXPORT_KIND_COLUMNS, EXPORT_KIND_DEFAULT_COLUMNS } from '../../configs';

const props = defineProps<{
  kind: string;
  modelValue: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const { t } = useI18n();

const supportedColumns = computed(() => EXPORT_KIND_COLUMNS[props.kind as keyof typeof EXPORT_KIND_COLUMNS] || []);
const defaultColumns = computed(() => EXPORT_KIND_DEFAULT_COLUMNS[props.kind as keyof typeof EXPORT_KIND_DEFAULT_COLUMNS] || []);
const selectedColumns = computed(() => (props.modelValue.length ? props.modelValue : supportedColumns.value));

const isSelected = (column: string) => selectedColumns.value.includes(column);
const isDefaultColumn = (column: string) => defaultColumns.value.includes(column);

const humanize = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const toggleColumn = (column: string) => {
  const next = isSelected(column)
    ? selectedColumns.value.filter((value) => value !== column)
    : [...selectedColumns.value, column];

  emit('update:modelValue', next.length ? next : [...supportedColumns.value]);
};

const selectDefaults = () => {
  emit('update:modelValue', [...defaultColumns.value]);
};

const selectAll = () => {
  emit('update:modelValue', [...supportedColumns.value]);
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ t('importsExports.exports.columnsBuilder.title') }}</h3>
        <p class="mt-1 text-sm text-slate-500">{{ t('importsExports.exports.columnsBuilder.subtitle') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          @click="selectDefaults"
        >
          {{ t('importsExports.exports.columnsBuilder.useDefaults') }}
        </button>
        <button
          type="button"
          class="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          @click="selectAll"
        >
          {{ t('importsExports.exports.columnsBuilder.selectAll') }}
        </button>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="column in supportedColumns"
        :key="column"
        type="button"
        class="rounded-2xl border p-4 text-left transition"
        :class="isSelected(column) ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'"
        @click="toggleColumn(column)"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ humanize(column) }}</p>
            <p class="mt-1 font-mono text-xs text-slate-500">{{ column }}</p>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span
              v-if="isDefaultColumn(column)"
              class="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600"
            >
              {{ t('importsExports.exports.columnsBuilder.defaultBadge') }}
            </span>
            <Icon
              :name="isSelected(column) ? 'check-circle' : 'circle'"
              :class="isSelected(column) ? 'text-primary' : 'text-slate-300'"
            />
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
