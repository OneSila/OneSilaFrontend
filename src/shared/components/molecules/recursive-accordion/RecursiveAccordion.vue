<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Accordion } from '../../atoms/accordion';

defineOptions({
  name: 'RecursiveAccordion',
});

const props = withDefaults(defineProps<{
  value: unknown;
  depth?: number;
  startExpanded?: boolean;
}>(), {
  depth: 0,
  startExpanded: false,
});

const { t } = useI18n();

const isPrimitive = (value: unknown) =>
  value === null || ['string', 'number', 'boolean'].includes(typeof value);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const humanizeKey = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());

const formatPrimitive = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return t('importsExports.shared.emptyValue');
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  return String(value);
};

const arrayValue = computed(() => (Array.isArray(props.value) ? props.value : []));
const objectEntries = computed(() =>
  isPlainObject(props.value)
    ? Object.entries(props.value).map(([key, value]) => ({
      key,
      label: humanizeKey(key),
      value,
    }))
    : [],
);

const getArrayItemLabel = (value: unknown, index: number) => {
  const itemLabel = t('importsExports.shared.item');
  const prefix = `${itemLabel} ${index + 1}`;

  if (isPrimitive(value)) {
    const formatted = formatPrimitive(value);
    return formatted === t('importsExports.shared.emptyValue') ? prefix : `${prefix}: ${formatted}`;
  }

  if (isPlainObject(value)) {
    const candidateKeys = ['name', 'title', 'label', 'value', 'id'];
    const match = candidateKeys.find((key) => isPrimitive(value[key]) && value[key] !== null && value[key] !== '');

    if (match) {
      return `${prefix}: ${formatPrimitive(value[match])}`;
    }
  }

  return prefix;
};

const accordionItems = computed(() =>
  arrayValue.value.map((item, index) => ({
    name: `item-${index}`,
    label: getArrayItemLabel(item, index),
  })),
);

const defaultActiveItem = computed(() => {
  if (!props.startExpanded || !accordionItems.value.length) {
    return null;
  }

  return accordionItems.value[0].name;
});
</script>

<template>
  <div class="space-y-3">
    <div v-if="isPrimitive(value)" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 break-words">
      {{ formatPrimitive(value) }}
    </div>

    <div v-else-if="Array.isArray(value)">
      <div
        v-if="!arrayValue.length"
        class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
      >
        {{ t('importsExports.shared.emptyArray') }}
      </div>

      <Accordion v-else :items="accordionItems" :default-active="defaultActiveItem">
        <template
          v-for="(item, index) in arrayValue"
          :key="`array-item-${depth}-${index}`"
          #[`item-${index}`]
        >
          <div class="space-y-3">
            <div
              v-if="isPrimitive(item)"
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 break-words"
            >
              {{ formatPrimitive(item) }}
            </div>
            <RecursiveAccordion v-else :value="item" :depth="depth + 1" />
          </div>
        </template>
      </Accordion>
    </div>

    <div v-else>
      <div
        v-if="!objectEntries.length"
        class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
      >
        {{ t('importsExports.shared.emptyObject') }}
      </div>

      <div v-else class="space-y-3">
        <section
          v-for="entry in objectEntries"
          :key="`${depth}-${entry.key}`"
          class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ entry.label }}
          </div>

          <div class="mt-3">
            <div
              v-if="isPrimitive(entry.value)"
              class="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 break-words"
            >
              {{ formatPrimitive(entry.value) }}
            </div>
            <RecursiveAccordion v-else :value="entry.value" :depth="depth + 1" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
