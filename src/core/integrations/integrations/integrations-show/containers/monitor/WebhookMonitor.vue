<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Badge } from '../../../../../../shared/components/atoms/badge';
import { Title } from '../../../../../../shared/components/atoms/title';
import { Label } from '../../../../../../shared/components/atoms/label';
import { FilterManager } from '../../../../../../shared/components/molecules/filter-manager';
import { Pagination } from '../../../../../../shared/components/molecules/pagination';
import { FieldType } from '../../../../../../shared/utils/constants';
import type { SearchConfig } from '../../../../../../shared/components/organisms/general-search/searchConfig';
import apolloClient from '../../../../../../../apollo-client';
import { getWebhookIntegrationQuery } from '../../../../../../shared/api/queries/webhooks.js';
import { useLiveMonitor } from './useLiveMonitor';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  integrationId: string;
}>();

const timeOptions = ['live', 'last15m', '1h', '6h', '24h'] as const;
const selectedRange = ref('live');

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

const optionLabelMap = {
  action: Object.fromEntries(actionOptions.map((o) => [o.value, o.label])),
  status: Object.fromEntries(statusOptions.map((o) => [o.value, o.label])),
  responseCode: Object.fromEntries(responseCodeOptions.map((o) => [o.value, o.label])),
  topic: Object.fromEntries(topicOptions.map((o) => [o.value, o.label])),
} as Record<string, Record<string, string>>;

const searchConfig: SearchConfig = {
  search: false,
  filters: [
    { type: FieldType.RangeDate, name: 'date', label: t('webhooks.monitor.filters.date') },
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
      name: 'status',
      label: t('webhooks.monitor.filters.status'),
      options: statusOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'responseCode',
      label: t('webhooks.monitor.filters.responseCode'),
      options: responseCodeOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'topic',
      label: t('webhooks.monitor.filters.topic'),
      options: topicOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
  ],
  orders: [],
};

const {
  events,
  pageInfo,
  pagination,
  live,
  refresh,
  updateFilters,
  updateTimeRange,
} = useLiveMonitor({ filters: { webhookIntegration: { id: { exact: props.integrationId } } } });

const parentRef = ref<HTMLElement | null>(null);
const rowVirtualizer = useVirtualizer({
  count: events.value.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 40,
});

watch(
  () => events.value.length,
  (len) => {
    rowVirtualizer.value.setOptions({
      ...rowVirtualizer.value.options,
      count: len,
      getScrollElement: () => parentRef.value,
      estimateSize: () => 40,
    });
  }
);

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems());
const totalSize = computed(() => rowVirtualizer.value.getTotalSize());

const statusBadgeMap = {
  PENDING: { text: t('webhooks.monitor.statuses.pending'), color: 'gray' },
  SENDING: { text: t('webhooks.monitor.statuses.sending'), color: 'blue' },
  DELIVERED: { text: t('webhooks.monitor.statuses.delivered'), color: 'green' },
  FAILED: { text: t('webhooks.monitor.statuses.failed'), color: 'red' },
};

const getResponseCodeColor = (code?: number | null) => {
  if (!code) return 'gray';
  if (code >= 200 && code < 300) return 'green';
  if (code >= 400 && code < 500) return 'yellow';
  if (code >= 500 && code < 600) return 'red';
  return 'gray';
};

const formatTime = (iso: string) => new Date(iso).toLocaleString();

const handlePageChange = ({ query }: { query: Record<string, any> }) => {
  const before = typeof query.before === 'string' ? query.before : null;
  const after = typeof query.after === 'string' ? query.after : null;
  if (before) {
    pagination.before = before;
    delete pagination.after;
    delete pagination.first;
    pagination.last = 20;
  } else if (after) {
    pagination.after = after;
    delete pagination.before;
    delete pagination.last;
    pagination.first = 20;
  } else if (query.last === 'true') {
    delete pagination.after;
    delete pagination.before;
    delete pagination.first;
    pagination.last = 20;
  } else if (query.first === 'true') {
    delete pagination.after;
    delete pagination.before;
    delete pagination.last;
    pagination.first = 20;
  }
  refresh();
};

const rpm = ref<number | null>(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getWebhookIntegrationQuery,
    variables: { id: props.integrationId },
    fetchPolicy: 'network-only',
  });
  rpm.value = data?.webhookIntegration?.requestsPerMinute || null;
});

watch(
  () => route.query,
  (query) => {
    const newFilters: Record<string, any> = { webhookIntegration: { id: { exact: props.integrationId } } };
    ['action', 'status', 'responseCode', 'topic'].forEach((k) => {
      const v = query[k];
      if (typeof v === 'string' && v) {
        newFilters[k] = v;
      }
    });
    updateFilters(newFilters);

    if (typeof query.date === 'string') {
      const [from, to] = query.date.split(',');
      if (from && to) {
        updateTimeRange({
          from: new Date(from).toISOString(),
          to: new Date(to).toISOString(),
        });
        live.value = false;
        selectedRange.value = 'custom';
        return;
      }
    }
    if (selectedRange.value === 'custom') {
      selectedRange.value = 'live';
      updateTimeRange(null);
    }
  },
  { immediate: true }
);

const filterChips = computed(() =>
  Object.entries(route.query)
    .filter(([k]) => ['action', 'status', 'responseCode', 'topic', 'date'].includes(k))
    .map(([k, v]) => ({ key: k, value: optionLabelMap[k]?.[String(v)] || v }))
);

const selectRange = (option: string) => {
  selectedRange.value = option;
  const newQuery = { ...route.query } as Record<string, any>;
  delete newQuery.date;
  router.replace({ query: newQuery });
  if (option === 'live') {
    live.value = true;
    updateTimeRange(null);
    refresh();
    return;
  }
  live.value = false;
  const to = new Date();
  let from = new Date();
  switch (option) {
    case 'last15m':
      from = new Date(to.getTime() - 15 * 60 * 1000);
      break;
    case '1h':
      from = new Date(to.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      from = new Date(to.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '24h':
      from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
      break;
  }
  updateTimeRange({ from: from.toISOString(), to: to.toISOString() });
  refresh();
};

watch(live, (val) => {
  if (val) {
    selectedRange.value = 'live';
    updateTimeRange(null);
    refresh();
  }
});

const removeFilter = (key: string) => {
  const newQuery = { ...route.query } as Record<string, any>;
  delete newQuery[key];
  router.replace({ query: newQuery });
};

const rpmDisplay = computed(() => `${rpm.value ?? 0}/120`);
</script>

<template>
  <div class="space-y-4">
    <FilterManager :search-config="searchConfig" />
    <div class="flex items-center justify-between">
      <Title>{{ t('webhooks.monitor.title') }}</Title>
      <div class="flex items-center gap-2">
        <Label>{{ t('webhooks.monitor.autoRefresh') }}</Label>
        <Toggle v-model="live" />
        <div v-if="rpm !== null"  class="flex items-center bg-gray-100 rounded-full px-3 py-2 text-sm">
          <span>{{ t('webhooks.monitor.rpmCap') }}: {{ rpmDisplay }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button
        v-for="opt in timeOptions"
        :key="opt"
        :custom-class="`px-2 py-1 rounded text-sm ${selectedRange === opt ? 'bg-primary text-white' : 'bg-gray-100'}`"
        @click="selectRange(opt)"
      >
        {{ t(`webhooks.monitor.timeRange.${opt}`) }}
      </Button>
    </div>

    <hr>

    <div class="flex flex-wrap gap-2">
      <div
        v-for="chip in filterChips"
        :key="chip.key"
        class="flex items-center bg-gray-100 rounded-full px-3 py-2 text-sm"
      >
        <span>{{ t(`webhooks.monitor.filters.${chip.key}`) }}: {{ chip.value }}</span>
        <button class="ml-1" @click="removeFilter(chip.key)">×</button>
      </div>
    </div>

    <div class="mt-4">
      <div class="grid grid-cols-8 bg-gray-50 border-b border-gray-300">
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.time') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.topic') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.action') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.subjectId') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.status') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.httpCode') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.latency') }}
        </div>
        <div class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
          {{ t('webhooks.monitor.table.attempt') }}
        </div>
      </div>
      <div ref="parentRef" class="max-h-96 overflow-auto">
        <div :style="{ height: totalSize + 'px', position: 'relative' }">
          <div
            v-for="virtualRow in virtualRows"
            :key="virtualRow.index"
            :style="{ position: 'absolute', top: virtualRow.start + 'px', width: '100%' }"
            class="grid grid-cols-8 border-b border-gray-200 bg-white"
          >
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ formatTime(events[virtualRow.index].sentAt) }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ optionLabelMap.topic[events[virtualRow.index].outbox.topic] || events[virtualRow.index].outbox.topic }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ optionLabelMap.action[events[virtualRow.index].outbox.action] }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ events[virtualRow.index].outbox.subjectId }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              <Badge
                :color="statusBadgeMap[events[virtualRow.index].status].color"
                :text="statusBadgeMap[events[virtualRow.index].status].text"
              />
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              <Badge
                :color="getResponseCodeColor(events[virtualRow.index].responseCode)"
                :text="events[virtualRow.index].responseCode"
              />
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ events[virtualRow.index].responseMs }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ events[virtualRow.index].attempt }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <Pagination v-if="pageInfo" class="mt-4" :page-info="pageInfo" :change-query-params="false" @query-changed="handlePageChange" />
  </div>
</template>

