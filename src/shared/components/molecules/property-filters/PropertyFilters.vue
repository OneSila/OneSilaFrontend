<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../atoms/selector';
import { Icon } from '../../atoms/icon';
import { Flex, FlexCell } from '../../layouts/flex';
import { TextInput } from '../../atoms/input-text';
import { ConfigTypes, getPropertyTypeOptions } from '../../../utils/constants';

const props = defineProps<{
  searchQuery: string;
  selectedPropertyTypes: string[];
  filters: Record<string, boolean>;
  addFilled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedPropertyTypes', value: string[]): void;
  (e: 'update:filters', value: Record<string, boolean>): void;
}>();

const { t } = useI18n();

const localSearch = computed({
  get: () => props.searchQuery,
  set: val => emit('update:searchQuery', val),
});

const localSelectedTypes = computed<string[]>({
  get: () => props.selectedPropertyTypes,
  set: val => emit('update:selectedPropertyTypes', val),
});

const localFilters = computed<Record<string, boolean>>({
  get: () => props.filters,
  set: val => emit('update:filters', val),
});

const requireTypes = computed(() => {
  const types = [
    { value: ConfigTypes.REQUIRED, label: t('properties.rule.configTypes.required.title') },
    { value: ConfigTypes.OPTIONAL, label: t('properties.rule.configTypes.optional.title') },
  ];
  if (props.addFilled) {
    types.push({ value: ConfigTypes.FILLED, label: t('properties.rule.configTypes.filled.title') });
  }
  return types;
});

const propertyTypeOptions = computed(() => getPropertyTypeOptions(t));

const toggleFilter = (type: string) => {
  localFilters.value = { ...localFilters.value, [type]: !localFilters.value[type] };
};

const getIconColor = (requireType: string) => {
  if ([ConfigTypes.REQUIRED, ConfigTypes.REQUIRED_IN_CONFIGURATOR, ConfigTypes.OPTIONAL_IN_CONFIGURATOR].includes(requireType as ConfigTypes)) {
    return 'text-red-500';
  }
  if (requireType === ConfigTypes.OPTIONAL) {
    return 'text-orange-400';
  }
  return 'text-gray-400';
};
</script>

<template>
  <Flex gap="2" wrap class="w-full items-start">
    <FlexCell grow>
      <div class="relative w-full">
        <TextInput
          v-model="localSearch"
          :placeholder="t('products.products.properties.searchPlaceholder')"
          class="w-full pl-9"
        />
        <Icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </FlexCell>
    <FlexCell>
      <Selector
        v-model="localSelectedTypes"
        :options="propertyTypeOptions"
        multiple
        :placeholder="t('products.products.properties.typePlaceholder')"
        class="min-w-48"
        labelBy="name"
        valueBy="code"
      />
    </FlexCell>
    <FlexCell>
      <Flex gap="2">
        <button
          v-for="type in requireTypes"
          :key="type.value"
          :title="type.label"
          @click="toggleFilter(type.value)"
          class="w-9 h-9 flex items-center justify-center rounded border cursor-pointer hover:border-blue-500"
          :class="localFilters[type.value] ? 'border-blue-500' : 'border-transparent'"
        >
          <Icon name="circle-dot" :class="getIconColor(type.value)" />
        </button>
      </Flex>
    </FlexCell>
  </Flex>
</template>
