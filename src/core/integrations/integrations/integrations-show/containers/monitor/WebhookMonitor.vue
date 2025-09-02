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
  { label: t('webhooks.monitor.statuses.success'), value: 'SUCCESS' },
  { label: t('webhooks.monitor.statuses.failed'), value: 'FAILED' },
];

const responseCodeOptions = [
  { label: '200', value: '200' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
];

const subjectOptions = [
  { label: t('webhooks.monitor.subjects.order'), value: 'ORDER' },
  { label: t('webhooks.monitor.subjects.product'), value: 'PRODUCT' },
];

const optionLabelMap = {
  action: Object.fromEntries(actionOptions.map((o) => [o.value, o.label])),
  status: Object.fromEntries(statusOptions.map((o) => [o.value, o.label])),
  responseCode: Object.fromEntries(responseCodeOptions.map((o) => [o.value, o.label])),
  subject: Object.fromEntries(subjectOptions.map((o) => [o.value, o.label])),
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
      name: 'subject',
      label: t('webhooks.monitor.filters.subject'),
      options: subjectOptions,
      labelBy: 'label',
      valueBy: 'value',
    },
  ],
  orders: [],
};

const {
  live,
  refresh,
  updateFilters,
  updateTimeRange,
} = useLiveMonitor({ filters: { webhookIntegration: { id: { exact: props.integrationId } } } });

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
    ['action', 'status', 'responseCode', 'subject'].forEach((k) => {
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
    .filter(([k]) => ['action', 'status', 'responseCode', 'subject', 'date'].includes(k))
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
  </div>
</template>

