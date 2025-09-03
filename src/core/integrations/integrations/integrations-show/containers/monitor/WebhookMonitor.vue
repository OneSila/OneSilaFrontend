<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { Button } from '../../../../../../shared/components/atoms/button';
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
import KpiCards from './components/KpiCards.vue';
import EventTable from './components/EventTable.vue';
import EventDrawer from './components/EventDrawer.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  integrationId: string;
}>();

const timeOptions = ['live', 'last15m', '1h', '6h', '24h'] as const;
const selectedRange = ref('live');
const rpm = ref<number | null>(null);
const integration = ref<any | null>(null);

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
  stats,
  statsLoading,
  loading,
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

const integrationHeaders = ref<{ key: string; value: string }[]>([]);

const arrayBufferToHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const makeSignature = async (secret: string, timestamp: number, rawBody: string) => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const payload = enc.encode(`${timestamp}.${rawBody}`);
  const sig = await crypto.subtle.sign('HMAC', key, payload);
  return arrayBufferToHex(sig);
};

const buildHeaders = async (
  userAgent: string,
  event: string,
  action: string,
  version: string,
  deliveryId: string,
  secret: string,
  timestamp: number,
  rawBody: string
) => {
  const signature = await makeSignature(secret, timestamp, rawBody);
  return {
    'User-Agent': userAgent,
    'X-OneSila-Event': event,
    'X-OneSila-Action': action,
    'X-OneSila-Version': version,
    'X-OneSila-Delivery': deliveryId,
    'X-OneSila-Signature': `t=${timestamp},v1=${signature}`,
  } as Record<string, string>;
};

const generateHeaders = async () => {
  if (!selectedEvent.value || !integration.value) {
    integrationHeaders.value = [];
    return { rawBody: '', headers: {} as Record<string, string> };
  }
  const rawBody = JSON.stringify(selectedEvent.value.outbox.payload);
  const timestamp = Math.floor(Date.now() / 1000);
  const base = await buildHeaders(
    integration.value.userAgent || '',
    selectedEvent.value.outbox.topic,
    selectedEvent.value.outbox.action,
    integration.value.version || '',
    String(selectedEvent.value.id),
    integration.value.secret || '',
    timestamp,
    rawBody
  );
  const extra = integration.value.extraHeaders || {};
  const all = {
    'Content-Type': 'application/json',
    ...base,
    ...extra,
  } as Record<string, string>;
  integrationHeaders.value = Object.entries(all).map(([key, value]) => ({ key, value: String(value) }));
  return { rawBody, headers: all };
};

watch([selectedEvent, integration], () => {
  generateHeaders();
});

const replaySelected = async () => {
  if (!selectedEvent.value) return;
  const defaultSwalOptions = {
    title: t('shared.alert.mutationAlert.title'),
    text: t('webhooks.monitor.drawer.replay.confirm'),
    confirmButtonText: t('webhooks.monitor.drawer.replay.confirmButtonText'),
    cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
    icon: 'warning',
    showCancelButton: true,
    reverseButtons: true,
    padding: '2em',
  };
  const defaultSwalClasses = {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-secondary',
    cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
  };
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false,
  });
  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions as SweetAlertOptions);
  if (!result.isConfirmed) return;
  const { data } = await apolloClient.mutate({
    mutation: retryWebhookDeliveryMutation,
    variables: { instance: { id: selectedEvent.value.id } },
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

const copyCurl = async () => {
  if (!selectedEvent.value || !integration.value) return;
  const url = integration.value.url || '';
  const { rawBody, headers } = await generateHeaders();
  const headersStr = Object.entries(headers)
    .map(([k, v]) => `-H '${k}: ${v}'`)
    .join(' ');
  const payload = rawBody.replace(/'/g, "'\\''");
  const cmd = `curl -X POST '${url}' ${headersStr} -d '${payload}'`;
  navigator.clipboard.writeText(cmd);
  await Swal.fire({
    title: t('webhooks.monitor.drawer.replay.copied'),
    icon: 'success',
    timer: 1500,
    showConfirmButton: false,
    customClass: { popup: 'sweet-alerts' },
  });
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
    <div>
      <Title level="2">{{ t('webhooks.monitor.title') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.monitor.description') }}</p>
    </div>
    <div class="flex items-center justify-between">
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
      <div class="flex items-center gap-2">
        <Label>{{ t('webhooks.monitor.autoRefresh') }}</Label>
        <Toggle v-model="live" />
        <div v-if="rpm !== null"  class="flex items-center bg-gray-100 rounded-full px-3 py-2 text-sm">
          <span>{{ t('webhooks.monitor.rpmCap') }}: {{ rpmDisplay }}</span>
        </div>
      </div>
    </div>

    <hr />

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

    <KpiCards :stats="stats" :stats-loading="statsLoading" />

    <hr class="my-4" />

    <EventTable
      :events="events"
      :loading="loading"
      :option-label-map="optionLabelMap"
      :status-badge-map="statusBadgeMap"
      :open-drawer="openDrawer"
      :format-time="formatTime"
      :get-response-code-color="getResponseCodeColor"
    />

    <hr class="my-4" />

    <EventDrawer
      :event="selectedEvent"
      :active-tab="activeTab"
      :drawer-tabs="drawerTabs"
      :integration-headers="integrationHeaders"
      @close="closeDrawer"
      @update:activeTab="activeTab = $event"
      @replay="replaySelected"
      @copyCurl="copyCurl"
    />

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

