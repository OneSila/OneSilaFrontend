<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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
import { retryWebhookDeliveryMutation } from '../../../../../../shared/api/mutations/webhooks.js';
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

const selectedEvent = ref<any | null>(null);
const activeTab = ref('overview');
const drawerTabs = ['overview', 'attempts', 'payload', 'headers', 'replay'] as const;

const openDrawer = (ev: any) => {
  selectedEvent.value = ev;
  activeTab.value = 'overview';
};

const closeDrawer = () => {
  selectedEvent.value = null;
};

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

const integrationHeaders = computed(() => {
  const headers: { key: string; value: string }[] = [
    { key: 'Content-Type', value: 'application/json' },
  ];
  const extra = integration.value?.extraHeaders || {};
  Object.entries(extra).forEach(([key, value]) => {
    headers.push({ key, value: String(value) });
  });
  if (integration.value?.secret) {
    headers.push({ key: 'X-Webhook-Secret', value: t('webhooks.monitor.drawer.headers.redacted') });
  }
  return headers;
});

const replaySelected = async () => {
  if (!selectedEvent.value) return;
  if (!confirm(t('webhooks.monitor.drawer.replay.confirm'))) return;
  const { data } = await apolloClient.mutate({
    mutation: retryWebhookDeliveryMutation,
    variables: { data: { id: selectedEvent.value.id } },
  });
  const updated = data?.retryWebhookDelivery;
  if (updated) {
    selectedEvent.value = updated;
    const idx = events.value.findIndex((e) => e.id === updated.id);
    if (idx !== -1) {
      events.value[idx] = updated;
    }
    refresh();
  }
};

const copyCurl = () => {
  if (!selectedEvent.value || !integration.value) return;
  const url = integration.value.url || '';
  const headersStr = integrationHeaders.value
    .map((h) => `-H '${h.key}: ${h.value}'`)
    .join(' ');
  const payload = JSON.stringify(selectedEvent.value.outbox.payload, null, 2).replace(/'/g, "'\\''");
  const cmd = `curl -X POST '${url}' ${headersStr} -d '${payload}'`;
  navigator.clipboard.writeText(cmd);
  alert(t('webhooks.monitor.drawer.replay.copied'));
};

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
const integration = ref<any | null>(null);

onMounted(async () => {
  const { data } = await apolloClient.query({
    query: getWebhookIntegrationQuery,
    variables: { id: props.integrationId },
    fetchPolicy: 'network-only',
  });
  rpm.value = data?.webhookIntegration?.requestsPerMinute || null;
  integration.value = data?.webhookIntegration || null;
});

watch(
  () => route.query,
  (query) => {
    const newFilters: Record<string, any> = { webhookIntegration: { id: { exact: props.integrationId } } };
    ['status', 'responseCode'].forEach((k) => {
      const v = query[k];
      if (typeof v === 'string' && v) {
        newFilters[k] = { exact: v };
      }
    });
    ['action', 'topic'].forEach((k) => {
      const v = query[k];
      if (typeof v === 'string' && v) {
        newFilters.outbox = newFilters.outbox || {};
        newFilters.outbox[k] = { exact: v };
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
      <div class="max-h-96 overflow-auto">
        <transition-group name="list" tag="div">
          <div
            v-for="ev in events"
            :key="ev.outbox.id"
            class="grid grid-cols-8 border-b border-gray-200 bg-white cursor-pointer"
            @click="openDrawer(ev)"
          >
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ formatTime(ev.sentAt) }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ optionLabelMap.topic[ev.outbox.topic] || ev.outbox.topic }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ optionLabelMap.action[ev.outbox.action] }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ ev.outbox.subjectId }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              <Badge :color="statusBadgeMap[ev.status].color" :text="statusBadgeMap[ev.status].text" />
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              <Badge :color="getResponseCodeColor(ev.responseCode)" :text="ev.responseCode" />
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ ev.responseMs }}
            </div>
            <div class="px-3 py-2 text-sm text-gray-500">
              {{ ev.attempt }}
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <transition name="fade">
      <div v-if="selectedEvent" class="fixed inset-0 z-50 flex">
        <div class="flex-1 bg-black/50" @click="closeDrawer"></div>
        <div class="w-96 bg-white h-full overflow-y-auto p-4">
          <div class="flex items-center justify-between mb-4">
            <Title>{{ t('webhooks.monitor.title') }}</Title>
            <button @click="closeDrawer">×</button>
          </div>
          <div class="flex items-center gap-2 mb-4">
            <Button
              v-for="tab in drawerTabs"
              :key="tab"
              :custom-class="`px-2 py-1 rounded text-sm ${activeTab === tab ? 'bg-primary text-white' : 'bg-gray-100'}`"
              @click="activeTab = tab"
            >
              {{ t(`webhooks.monitor.drawer.tabs.${tab}`) }}
            </Button>
          </div>

          <div v-if="activeTab === 'overview'" class="space-y-2 text-sm">
            <div><strong>{{ t('webhooks.monitor.drawer.overview.status') }}:</strong> {{ selectedEvent.status }}</div>
            <div><strong>{{ t('webhooks.monitor.drawer.overview.attemptCount') }}:</strong> {{ selectedEvent.attempt }}</div>
            <div v-if="selectedEvent.errorMessage"><strong>{{ t('webhooks.monitor.drawer.overview.lastError') }}:</strong> {{ selectedEvent.errorMessage }}</div>
            <div><strong>{{ t('webhooks.monitor.drawer.overview.idempotencyKey') }}:</strong> {{ selectedEvent.outbox.id }}</div>
          </div>

          <div v-else-if="activeTab === 'attempts'" class="space-y-2 text-sm">
            <div v-for="att in selectedEvent.attempts" :key="att.number" class="border-b pb-2">
              <div><strong>{{ t('webhooks.monitor.drawer.attempts.number') }}:</strong> {{ att.number }}</div>
              <div><strong>{{ t('webhooks.monitor.drawer.attempts.responseCode') }}:</strong> {{ att.responseCode }}</div>
              <div><strong>{{ t('webhooks.monitor.drawer.attempts.latency') }}:</strong> {{ att.responseMs }}</div>
              <div v-if="att.errorText"><strong>{{ t('webhooks.monitor.drawer.attempts.error') }}:</strong> {{ att.errorText }}</div>
            </div>
          </div>

          <div v-else-if="activeTab === 'payload'" class="text-sm">
            <pre class="bg-gray-100 p-2 rounded overflow-auto">{{ JSON.stringify(selectedEvent.outbox.payload, null, 2) }}</pre>
          </div>

          <div v-else-if="activeTab === 'headers'" class="space-y-2 text-sm">
            <div v-for="h in integrationHeaders" :key="h.key">
              <strong>{{ h.key }}</strong>: {{ h.value }}
            </div>
          </div>

          <div v-else-if="activeTab === 'replay'" class="flex flex-col gap-2 text-sm">
            <Button :custom-class="'bg-primary text-white px-2 py-1 rounded'" @click="replaySelected">
              {{ t('webhooks.monitor.drawer.replay.replayButton') }}
            </Button>
            <Button :custom-class="'bg-gray-100 px-2 py-1 rounded'" @click="copyCurl">
              {{ t('webhooks.monitor.drawer.replay.copyCurlButton') }}
            </Button>
          </div>
        </div>
      </div>
    </transition>

    <Pagination v-if="pageInfo" class="mt-4" :page-info="pageInfo" :change-query-params="false" @query-changed="handlePageChange" />
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

