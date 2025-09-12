<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../atoms/selector';
import { Icon } from '../../atoms/icon';
import { ConfigTypes, getPropertyTypeOptions } from '../../../utils/constants';

const props = defineProps<{
  searchQuery: string;
  selectedPropertyTypes: string[];
  filters: Record<string, boolean>;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedPropertyTypes', value: string[]): void;
  (e: 'update:filters', value: Record<string, boolean>): void;
}>();

const { t } = useI18n();

const localSearch = ref(props.searchQuery);
watch(() => props.searchQuery, val => { localSearch.value = val; });
watch(localSearch, val => emit('update:searchQuery', val));

const localSelectedTypes = ref<string[]>([...props.selectedPropertyTypes]);
watch(() => props.selectedPropertyTypes, val => { localSelectedTypes.value = [...val]; });
watch(localSelectedTypes, val => emit('update:selectedPropertyTypes', val));

const localFilters = reactive({ ...props.filters });
watch(() => props.filters, val => { Object.assign(localFilters, val); });
watch(localFilters, val => emit('update:filters', val), { deep: true });

const requireTypes = [
  { value: ConfigTypes.REQUIRED, label: t('properties.rule.configTypes.required.title') },
  { value: ConfigTypes.OPTIONAL, label: t('properties.rule.configTypes.optional.title') },
  { value: 'FILLED', label: t('properties.rule.configTypes.filled.title') },
];

const propertyTypeOptions = computed(() => getPropertyTypeOptions(t));

const toggleFilter = (type: string) => {
  localFilters[type] = !localFilters[type];
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
  <div class="flex items-start gap-2 w-full">
    <div class="flex-1 relative">
      <input
        v-model="localSearch"
        :placeholder="t('products.products.properties.searchPlaceholder')"
        class="w-full h-12 border border-gray-300 rounded-lg pl-10 pr-2 text-sm"
        type="text"
      />
      <Icon name="search" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
    <Selector
      v-model="localSelectedTypes"
      :options="propertyTypeOptions"
      multiple
      :placeholder="t('products.products.properties.typePlaceholder')"
      class="w-48 h-12"
      labelBy="name"
      valueBy="code"
    />
    <div class="flex flex-col items-center gap-2">
      <div class="flex gap-2">
        <button
          v-for="type in requireTypes"
          :key="type.value"
          :title="type.label"
          @click="toggleFilter(type.value)"
          class="w-12 h-12 flex items-center justify-center rounded border cursor-pointer hover:border-blue-500"
          :class="localFilters[type.value] ? 'border-blue-500' : 'border-transparent'"
        >
          <Icon name="circle-dot" :class="getIconColor(type.value)" />
        </button>
      </div>
    </div>
  </div>
</template>
