<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Title } from '../../../../../../shared/components/atoms/title';
import { FilterManager } from '../../../../../../shared/components/molecules/filter-manager';
import { FieldType } from '../../../../../../shared/utils/constants';
import type { SearchConfig } from '../../../../../../shared/components/organisms/general-search/searchConfig';

const { t } = useI18n();

defineProps<{
  integrationId: string;
}>();

const timeOptions = ['today', '7d', '30d'] as const;
const selectedRange = ref<typeof timeOptions[number]>('today');

const selectRange = (opt: typeof timeOptions[number]) => {
  selectedRange.value = opt;
};

const actionOptions = [
  { label: t('webhooks.monitor.actions.create'), value: 'CREATE' },
  { label: t('webhooks.monitor.actions.update'), value: 'UPDATE' },
  { label: t('webhooks.monitor.actions.delete'), value: 'DELETE' },
];

const statusOptions = [
  { label: t('webhooks.monitor.statuses.pending'), value: 'PENDING' },
  { label: t('webhooks.monitor.statuses.sending'), value: 'SENDING' },
  { label: t('webhooks.monitor.statuses.delivered'), value: 'DELIVERED' },
  { label: t('webhooks.monitor.statuses.failed'), value: 'FAILED' },
];

const responseCodeOptions = [
  { label: '200', value: '200' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
];

const topicOptions = [
  { label: t('webhooks.monitor.topics.product'), value: 'product' },
  { label: t('webhooks.monitor.topics.ean_code'), value: 'ean_code' },
  { label: t('webhooks.monitor.topics.price_list'), value: 'price_list' },
  { label: t('webhooks.monitor.topics.price_list_item'), value: 'price_list_item' },
  { label: t('webhooks.monitor.topics.media'), value: 'media' },
  { label: t('webhooks.monitor.topics.media_through'), value: 'media_through' },
  { label: t('webhooks.monitor.topics.property'), value: 'property' },
  { label: t('webhooks.monitor.topics.select_value'), value: 'select_value' },
  { label: t('webhooks.monitor.topics.property_rule'), value: 'property_rule' },
  { label: t('webhooks.monitor.topics.property_rule_item'), value: 'property_rule_item' },
  { label: t('webhooks.monitor.topics.product_property'), value: 'product_property' },
  { label: t('webhooks.monitor.topics.sales_channel_view_assign'), value: 'sales_channel_view_assign' },
  { label: t('webhooks.monitor.topics.all'), value: 'all' },
];

const integrationOptions = [
  { label: t('webhooks.monitor.topics.all'), value: 'all' },
];

const searchConfig: SearchConfig = {
  search: false,
  filters: [
    {
      type: FieldType.RangeDate,
      name: 'date',
      label: t('webhooks.reports.filters.date'),
    },
    {
      type: FieldType.Choice,
      name: 'topic',
      label: t('webhooks.monitor.filters.topic'),
      options: topicOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'action',
      label: t('webhooks.monitor.filters.action'),
      options: actionOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'integration',
      label: t('webhooks.reports.filters.integration'),
      options: integrationOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('webhooks.monitor.filters.status'),
      options: statusOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'responseCode',
      label: t('webhooks.reports.filters.responseCodeBucket'),
      options: responseCodeOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
  ],
  orders: [],
};
</script>

<template>
  <div class="space-y-4">
    <FilterManager :search-config="searchConfig" />
    <div class="flex items-center justify-between">
      <Title>{{ t('integrations.show.tabs.reports') }}</Title>
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-for="opt in timeOptions"
        :key="opt"
        :custom-class="`px-2 py-1 rounded text-sm ${selectedRange === opt ? 'bg-primary text-white' : 'bg-gray-100'}`"
        @click="selectRange(opt)"
      >
        {{ t(`webhooks.reports.timeRange.${opt}`) }}
      </Button>
    </div>
  </div>
</template>

