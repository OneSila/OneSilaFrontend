<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface Props {
  stats: any;
  statsLoading: boolean;
}

defineProps<Props>();

const kpis = [
  { key: 'deliveries', format: (s: any) => s?.deliveries ?? 0 },
  { key: 'delivered', format: (s: any) => s?.delivered ?? 0 },
  { key: 'failed', format: (s: any) => s?.failed ?? 0 },
  { key: 'successRate', format: (s: any) => `${(s?.successRate ?? 0).toFixed(1)}%` },
  { key: 'latency', format: (s: any) => `${s?.medianLatency ?? 0} / ${s?.p95Latency ?? 0}` },
  { key: 'rate429', format: (s: any) => `${(s?.rate429 ?? 0).toFixed(1)}%` },
  { key: 'queueDepth', format: (s: any) => s?.queueDepth ?? 0 },
];
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    <div
      v-for="kpi in kpis"
      :key="kpi.key"
      class="p-4 bg-gray-50 rounded"
      :title="t(`webhooks.monitor.kpis.${kpi.key}Tooltip`)">
      <div class="text-sm text-gray-500">
        {{ t(`webhooks.monitor.kpis.${kpi.key}`) }}
      </div>
      <div v-if="!statsLoading" class="text-xl font-semibold">
        {{ kpi.format(stats) }}
      </div>
      <div v-else class="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
</template>
