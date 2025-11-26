<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../atoms/selector';
import { Icon } from '../../atoms/icon';
import { Flex, FlexCell } from '../../layouts/flex';
import { TextInput } from '../../atoms/input-text';
import { ConfigTypes, getPropertyTypeOptions } from '../../../utils/constants';
import apolloClient from '../../../../../apollo-client';
import { productPropertiesRulesQuery } from '../../../api/queries/properties.js';

const props = withDefaults(defineProps<{
  searchQuery: string;
  selectedPropertyTypes: string[];
  filters: Record<string, boolean>;
  addFilled?: boolean;
  productTypeValueId?: string | null;
  selectedSalesChannelId?: string | null;
  fetchSalesChannelsOnMounted?: boolean;
}>(), {
  fetchSalesChannelsOnMounted: true,
});

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'update:selectedPropertyTypes', value: string[]): void;
  (e: 'update:filters', value: Record<string, boolean>): void;
  (e: 'update:selectedSalesChannelId', value: string | null): void;
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

const DEFAULT_SALES_CHANNEL_KEY = 'default';

const internalSelectedSalesChannelId = ref<string>(DEFAULT_SALES_CHANNEL_KEY);
const currentProductTypeValueId = ref<string | null>(props.productTypeValueId ?? null);

const updateSelectedSalesChannelId = (value: string | null | undefined) => {
  const normalizedValue = value ?? DEFAULT_SALES_CHANNEL_KEY;
  if (internalSelectedSalesChannelId.value === normalizedValue) {
    return;
  }
  internalSelectedSalesChannelId.value = normalizedValue;
  emit('update:selectedSalesChannelId', normalizedValue === DEFAULT_SALES_CHANNEL_KEY ? null : normalizedValue);
};

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

const salesChannelOptions = ref<{ id: string; label: string }[]>([]);
const isFetchingSalesChannels = ref(false);

const formatSalesChannelLabel = (channel?: { id?: string | null; hostname?: string | null; type?: string | null }) => {
  if (!channel) {
    return t('properties.rule.labels.defaultSalesChannel');
  }

  return (
    channel.hostname ||
    channel.type ||
    channel.id ||
    t('properties.rule.labels.unknownSalesChannel')
  );
};

const fetchSalesChannels = async (productTypeValueId: string | null) => {
  if (!productTypeValueId) {
    salesChannelOptions.value = [];
    updateSelectedSalesChannelId(DEFAULT_SALES_CHANNEL_KEY);
    return;
  }

  isFetchingSalesChannels.value = true;

  try {
    const { data } = await apolloClient.query({
      query: productPropertiesRulesQuery,
      variables: {
        filter: { productType: { id: { exact: productTypeValueId } } },
        first: 100,
      },
      fetchPolicy: 'network-only',
    });

    const edges = data?.productPropertiesRules?.edges ?? [];
    const optionMap = new Map<string, { id: string; label: string }>();

    optionMap.set(DEFAULT_SALES_CHANNEL_KEY, {
      id: DEFAULT_SALES_CHANNEL_KEY,
      label: t('properties.rule.labels.defaultSalesChannel'),
    });

    edges.forEach((edge: any) => {
      const node = edge?.node;
      if (!node) {
        return;
      }

      const channelId = node.salesChannel?.id ?? DEFAULT_SALES_CHANNEL_KEY;
      if (optionMap.has(channelId)) {
        return;
      }

      optionMap.set(channelId, {
        id: channelId,
        label: formatSalesChannelLabel(node.salesChannel),
      });
    });

    const defaultOption = optionMap.get(DEFAULT_SALES_CHANNEL_KEY) ?? null;
    const otherOptions = Array.from(optionMap.entries())
      .filter(([key]) => key !== DEFAULT_SALES_CHANNEL_KEY)
      .map(([, value]) => value)
      .sort((a, b) => a.label.localeCompare(b.label));

    salesChannelOptions.value = defaultOption
      ? [defaultOption, ...otherOptions]
      : otherOptions;

    const hasSelected = salesChannelOptions.value.some(
      option => option.id === internalSelectedSalesChannelId.value,
    );

    if (!hasSelected) {
      const nextValue = salesChannelOptions.value[0]?.id ?? DEFAULT_SALES_CHANNEL_KEY;
      updateSelectedSalesChannelId(nextValue);
    }
  } finally {
    isFetchingSalesChannels.value = false;
  }
};

onMounted(() => {
  if (!props.fetchSalesChannelsOnMounted) {
    return;
  }
  void fetchSalesChannels(currentProductTypeValueId.value);
});

defineExpose({
  fetchSalesChannels,
});

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
  <Flex gap="2" wrap class="w-full items-start space-y-2">
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
    <FlexCell v-if="salesChannelOptions.length > 1">
      <Selector
        :model-value="internalSelectedSalesChannelId"
        @update:modelValue="updateSelectedSalesChannelId"
        :options="salesChannelOptions"
        :placeholder="t('properties.rule.placeholders.salesChannel')"
        class="min-w-48"
        labelBy="label"
        valueBy="id"
        :removable="false"
        :is-loading="isFetchingSalesChannels"
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
