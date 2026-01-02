<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../atoms/selector';
import { formatIntegrationLabel } from '../../../utils';

interface IntegrationOption {
  id: string;
  hostname?: string | null;
  type?: string | null;
  name?: string | null;
}

const props = withDefaults(
  defineProps<{
    integrations: IntegrationOption[];
    modelValue?: string | string[] | null;
    placeholder?: string;
    multiple?: boolean;
    filterable?: boolean;
    removable?: boolean;
    addDefault?: boolean;
    disabled?: boolean;
    excludeIds?: string[];
  }>(),
  {
    integrations: () => [],
    multiple: false,
    filterable: true,
    removable: true,
    addDefault: false,
    disabled: false,
    excludeIds: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | string[] | null): void;
}>();

const { t } = useI18n();

const exclusionSet = computed(() => new Set(props.excludeIds));

const options = computed(() => {
  const mapped = props.integrations
    .filter((integration) => !exclusionSet.value.has(integration.id))
    .map((integration) => ({
      id: integration.id,
      label: formatIntegrationLabel(integration) || integration.id,
    }));

  if (props.addDefault) {
    mapped.unshift({ id: 'default', label: t('shared.labels.default') });
  }

  return mapped;
});

const model = computed<string | string[] | null>({
  get: () => props.modelValue ?? null,
  set: (value) => emit('update:modelValue', value),
});
</script>

<template>
  <Selector
    v-model="model"
    :options="options"
    label-by="label"
    value-by="id"
    :multiple="props.multiple"
    :filterable="props.filterable"
    :placeholder="props.placeholder"
    :removable="props.removable"
    :disabled="props.disabled || !options.length"
  />
</template>
