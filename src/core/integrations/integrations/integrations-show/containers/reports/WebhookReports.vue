<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Title } from '../../../../../../shared/components/atoms/title';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { FilterManager } from '../../../../../../shared/components/molecules/filter-manager';
import { FieldType } from '../../../../../../shared/utils/constants';
import type { SearchConfig } from '../../../../../../shared/components/organisms/general-search/searchConfig';
import apolloClient from '../../../../../../../apollo-client';
import { webhookReportsKpiQuery, webhookReportsSeriesQuery } from '../../../../../../shared/api/queries/webhooks.js';
import ApexChart from 'vue3-apexcharts';
import KpiCards from './components/KpiCards.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  integrationId: string;
}>();

const timeOptions = ['today', '7d', '30d'] as const;
const heatmapMetrics = ['failures', 'latency'] as const;
const selectedRange = ref<typeof timeOptions[number] | 'custom'>('today');
const heatmapMetric = ref<typeof heatmapMetrics[number]>('failures');

const stats = ref<any | null>(null);
const seriesData = ref<any | null>(null);
const statsLoading = ref(false);
const autoRefresh = ref(false);
let refreshHandle: number | null = null;

const fetchStats = async () => {
  statsLoading.value = true;
  try {
    const q = route.query as Record<string, any>;
    const integration = typeof q.integration === 'string' && q.integration ? q.integration : props.integrationId;
    let from: Date | null = null;
    let to: Date | null = null;
    if (typeof q.date === 'string') {
      const [f, t] = q.date.split(',');
      if (f && t) {
        from = new Date(f);
        to = new Date(t);
        selectedRange.value = 'custom';
      }
    }
    if (!from || !to) {
      to = new Date();
      if (selectedRange.value === 'today') {
        from = new Date(to.getFullYear(), to.getMonth(), to.getDate());
      } else if (selectedRange.value === '7d') {
        from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (selectedRange.value === '30d') {
        from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }
    const filter: Record<string, any> = {
      webhookIntegration: { id: { exact: integration } },
      sentAt: { gte: from!.toISOString(), lte: to!.toISOString() },
    };
    ['status', 'responseCode'].forEach((k) => {
      const v = q[k];
      if (typeof v === 'string' && v) {
        filter[k] = { exact: v };
      }
    });
    ['topic', 'action'].forEach((k) => {
      const v = q[k];
      if (typeof v === 'string' && v) {
        filter.outbox = filter.outbox || {};
        filter.outbox[k] = { exact: v };
      }
    });
    const variables = { filter };
    const { data } = await apolloClient.query({
      query: webhookReportsKpiQuery,
      fetchPolicy: 'cache-first',
      variables,
    });
    stats.value = data?.webhookReportsKpi || null;
    const { data: seriesResp } = await apolloClient.query({
      query: webhookReportsSeriesQuery,
      fetchPolicy: 'cache-first',
      variables,
    });
    seriesData.value = seriesResp?.webhookReportsSeries || null;
  } catch {
    stats.value = null;
    seriesData.value = null;
  } finally {
    statsLoading.value = false;
  }
};

watch([() => route.query, selectedRange], fetchStats, { immediate: true });

watch(autoRefresh, (val) => {
  if (val) {
    refreshHandle = window.setInterval(fetchStats, 5000);
  } else if (refreshHandle) {
    clearInterval(refreshHandle);
    refreshHandle = null;
  }
});

onBeforeUnmount(() => {
  if (refreshHandle) {
    clearInterval(refreshHandle);
  }
});

const selectRange = (opt: typeof timeOptions[number]) => {
  selectedRange.value = opt;
  const newQuery = { ...route.query } as Record<string, any>;
  delete newQuery.date;
  router.replace({ query: newQuery });
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

const optionLabelMap = {
  action: Object.fromEntries(actionOptions.map((o) => [o.value, o.label])),
  status: Object.fromEntries(statusOptions.map((o) => [o.value, o.label])),
  responseCode: Object.fromEntries(responseCodeOptions.map((o) => [o.value, o.label])),
  topic: Object.fromEntries(topicOptions.map((o) => [o.value, o.label])),
} as Record<string, Record<string, string>>;

const filterLabelMap: Record<string, string> = {
  action: 'webhooks.monitor.filters.action',
  status: 'webhooks.monitor.filters.status',
  responseCode: 'webhooks.reports.filters.responseCodeBucket',
  topic: 'webhooks.monitor.filters.topic',
  date: 'webhooks.reports.filters.date',
};

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

const filterChips = computed(() =>
  Object.entries(route.query)
    .filter(([k]) => ['action', 'status', 'responseCode', 'topic', 'date'].includes(k))
    .map(([k, v]) => ({ key: k, value: optionLabelMap[k]?.[String(v)] || v }))
);

const removeFilter = (key: string) => {
  const newQuery = { ...route.query } as Record<string, any>;
  delete newQuery[key];
  router.replace({ query: newQuery });
};

const deliveryOutcomeSeries = computed(() => {
  if (!seriesData.value) return [];
  return [
    {
      name: t('webhooks.monitor.statuses.delivered'),
      data: seriesData.value.deliveryOutcomeBuckets.map((b: any) => [b.timestamp, b.delivered]),
    },
    {
      name: t('webhooks.monitor.statuses.failed'),
      data: seriesData.value.deliveryOutcomeBuckets.map((b: any) => [b.timestamp, b.failed]),
    },
    {
      name: t('webhooks.monitor.statuses.pending'),
      data: seriesData.value.deliveryOutcomeBuckets.map((b: any) => [b.timestamp, b.pending]),
    },
    {
      name: t('webhooks.monitor.statuses.sending'),
      data: seriesData.value.deliveryOutcomeBuckets.map((b: any) => [b.timestamp, b.sending]),
    },
  ];
});

const deliveryOutcomeOptions = computed(() => ({
  chart: { type: 'area', stacked: true, toolbar: { show: false } },
  xaxis: { type: 'datetime' },
  colors: ['#22c55e', '#ef4444', '#f97316', '#3b82f6'],
}));

const latencySeries = computed(() => {
  if (!seriesData.value) return [];
  return [
    {
      name: t('webhooks.reports.charts.p50'),
      data: seriesData.value.latencyBuckets.map((b: any) => [b.timestamp, b.p50]),
    },
    {
      name: t('webhooks.reports.charts.p95'),
      data: seriesData.value.latencyBuckets.map((b: any) => [b.timestamp, b.p95]),
    },
  ];
});

const latencyOptions = computed(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  xaxis: { type: 'datetime' },
}));

const topicsSeries = computed(() => {
  if (!seriesData.value) return [];
  return [
    {
      name: t('webhooks.reports.kpis.deliveries'),
      type: 'bar',
      data: seriesData.value.topicsBreakdown.map((b: any) => b.deliveries),
    },
    {
      name: t('webhooks.reports.kpis.successRate'),
      type: 'line',
      data: seriesData.value.topicsBreakdown.map((b: any) => b.successRate),
    },
  ];
});

const topicsOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    events: {
      dataPointSelection: (_e: any, _ctx: any, config: any) => {
        const topic = seriesData.value?.topicsBreakdown[config.dataPointIndex]?.topic;
        if (topic) {
          router.replace({ query: { ...route.query, topic } });
        }
      },
    },
  },
  stroke: { width: [0, 3] },
  plotOptions: { bar: { horizontal: false } },
  xaxis: { categories: seriesData.value ? seriesData.value.topicsBreakdown.map((b: any) => b.topic) : [] },
  yaxis: [
    { title: { text: t('webhooks.reports.kpis.deliveries') } },
    {
      opposite: true,
      max: 100,
      title: { text: t('webhooks.reports.kpis.successRate') },
      labels: { formatter: (val: number) => `${val}%` },
    },
  ],
  tooltip: { shared: true, intersect: false },
}));

const responseCodesSeries = computed(() => {
  if (!seriesData.value) return [];
  return [
    {
      name: t('webhooks.reports.kpis.deliveries'),
      data: seriesData.value.responseCodesBreakdown.map((b: any) => b.count),
    },
  ];
});

const responseCodesOptions = computed(() => {
  const categories = seriesData.value
    ? seriesData.value.responseCodesBreakdown.map((b: any) => b.codeBucket)
    : [];
  const colors = categories.map((bucket: string) => {
    if (bucket.startsWith('2')) return '#22c55e';
    if (bucket.startsWith('4')) return '#ef4444';
    if (bucket.startsWith('5')) return '#f97316';
    return '#3b82f6';
  });
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      events: {
        dataPointSelection: (_e: any, _ctx: any, config: any) => {
          const bucket = seriesData.value?.responseCodesBreakdown[config.dataPointIndex]?.codeBucket;
          if (bucket) {
            const mapping: Record<string, string> = { '2xx': '200', '4xx': '400', '429': '429', '5xx': '500' };
            router.replace({ query: { ...route.query, responseCode: mapping[bucket] || bucket } });
          }
        },
      },
    },
    plotOptions: { bar: { distributed: true } },
    colors,
    xaxis: { categories },
  };
});

const retriesSeries = computed(() => {
  if (!seriesData.value) return [];
  return [
    {
      name: t('webhooks.reports.kpis.deliveries'),
      data: seriesData.value.retriesDistribution.map((b: any) => b.count),
    },
  ];
});

const retriesOptions = computed(() => {
  const categories = seriesData.value
    ? seriesData.value.retriesDistribution.map((b: any) => b.attempts.toString())
    : [];
  const colors = categories.map((c: string) => {
    const n = Number(c);
    if (n === 1) return '#22c55e';
    if (n === 2) return '#f97316';
    if (n === 3) return '#ef4444';
    return '#3b82f6';
  });
  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      events: {
        dataPointSelection: (_e: any, _ctx: any, config: any) => {
          const attempts = seriesData.value?.retriesDistribution[config.dataPointIndex]?.attempts;
          if (attempts !== undefined) {
            router.replace({ query: { ...route.query, attempt: attempts.toString() } });
          }
        },
      },
    },
    plotOptions: { bar: { distributed: true } },
    colors,
    xaxis: { categories },
  };
});

const heatmapSeries = computed(() => {
  if (!seriesData.value) return [];
  const metric = heatmapMetric.value === 'failures' ? 'failures' : 'medianLatency';
  const map: Record<number, Record<number, number>> = {};
  for (const e of seriesData.value.heatmap) {
    if (!map[e.weekday]) map[e.weekday] = {};
    const val = metric === 'failures' ? e.failures : e.medianLatency;
    map[e.weekday][e.hour] = val;
  }
  return Array.from({ length: 7 }, (_v, i) => {
    const wd = i + 1;
    return {
      name: t(`webhooks.reports.heatmap.weekdays.${wd}`),
      data: Array.from({ length: 24 }, (_vv, h) => ({ x: h, y: map[wd]?.[h] || 0 })),
    };
  });
});

const heatmapOptions = computed(() => ({
  chart: { type: 'heatmap', toolbar: { show: false } },
  dataLabels: { enabled: false },
}));

const topOffenders = computed(() => seriesData.value?.topOffenders || []);
</script>

<template>
  <div class="space-y-4">
    <FilterManager :search-config="searchConfig" />
    <div>
      <Title level="1">{{ t('integrations.show.tabs.reports') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.description') }}</p>
    </div>
    <hr />
    <div class="flex items-center justify-between">
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
      <label class="flex items-center gap-1 text-sm">
        {{ t('webhooks.monitor.autoRefresh') }}
        <Toggle v-model="autoRefresh" />
      </label>
    </div>
    <hr />
    <div class="flex flex-wrap gap-2">
      <div
        v-for="chip in filterChips"
        :key="chip.key"
        class="flex items-center bg-gray-100 rounded-full px-3 py-2 text-sm"
      >
        <span>{{ t(filterLabelMap[chip.key]) }}: {{ chip.value }}</span>
        <button class="ml-1" @click="removeFilter(chip.key)">×</button>
      </div>
    </div>
    <KpiCards :stats="stats" :stats-loading="statsLoading" />
    <div class="mt-2 text-sm text-gray-500">
      <p>{{ t('webhooks.reports.charts.latencyLegend.title') }}</p>
      <ul class="list-disc ml-5">
        <li>{{ t('webhooks.reports.charts.latencyLegend.p50') }}</li>
        <li>{{ t('webhooks.reports.charts.latencyLegend.p95') }}</li>
        <li>{{ t('webhooks.reports.charts.latencyLegend.p99') }}</li>
      </ul>
    </div>
    <hr class="my-4" />
    <div v-if="seriesData">
      <Title level="3">{{ t('webhooks.reports.charts.deliveryOutcome') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.deliveryOutcome') }}</p>
      <ApexChart type="area" height="300" :options="deliveryOutcomeOptions" :series="deliveryOutcomeSeries" />
    </div>
    <hr class="my-4" v-if="seriesData" />
    <div v-if="seriesData">
      <Title level="3">{{ t('webhooks.reports.charts.latency') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.latency') }}</p>
      <ApexChart type="line" height="300" :options="latencyOptions" :series="latencySeries" class="mt-4" />
    </div>
    <hr class="my-4" v-if="seriesData" />
    <div v-if="seriesData">
      <Title level="3">{{ t('webhooks.reports.charts.topics') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.topics') }}</p>
      <ApexChart type="bar" height="300" :options="topicsOptions" :series="topicsSeries" class="mt-4" />
    </div>
    <hr class="my-4" v-if="seriesData" />
    <div v-if="seriesData">
      <Title level="3">{{ t('webhooks.reports.charts.responseCodes') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.responseCodes') }}</p>
      <ApexChart type="bar" height="300" :options="responseCodesOptions" :series="responseCodesSeries" class="mt-4" />
    </div>
    <hr class="my-4" v-if="seriesData" />
    <div v-if="seriesData">
      <Title level="3">{{ t('webhooks.reports.charts.retries') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.retries') }}</p>
      <ApexChart type="bar" height="300" :options="retriesOptions" :series="retriesSeries" class="mt-4" />
    </div>
    <hr class="my-4" v-if="seriesData" />
    <div v-if="seriesData" class="mt-4">
      <Title level="3">{{ t('webhooks.reports.charts.heatmap') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.heatmap') }}</p>
      <div class="flex items-center gap-2 mb-2">
        <Button
          v-for="m in heatmapMetrics"
          :key="m"
          :custom-class="`px-2 py-1 rounded text-sm ${heatmapMetric === m ? 'bg-primary text-white' : 'bg-gray-100'}`"
          @click="heatmapMetric = m"
        >
          {{ t(`webhooks.reports.heatmap.metric.${m}`) }}
        </Button>
      </div>
      <ApexChart type="heatmap" height="300" :options="heatmapOptions" :series="heatmapSeries" />
    </div>
    <hr class="my-4" v-if="topOffenders.length" />
    <div v-if="topOffenders.length">
      <Title level="3">{{ t('webhooks.reports.charts.topOffenders') }}</Title>
      <p class="text-sm text-gray-600">{{ t('webhooks.reports.chartDescriptions.topOffenders') }}</p>
      <table class="mt-4 w-full text-sm border-collapse">
        <thead>
          <tr>
            <th class="p-2 text-left">{{ t('webhooks.reports.topOffenders.columns.failureRate') }}</th>
            <th class="p-2 text-left">{{ t('webhooks.reports.topOffenders.columns.latencyP95') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in topOffenders" :key="o.integrationId" class="odd:bg-gray-50">
            <td class="p-2">{{ o.failureRate.toFixed(2) }}%</td>
            <td class="p-2">{{ o.latencyP95 }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

