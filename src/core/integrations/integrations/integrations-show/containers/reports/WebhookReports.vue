<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Title } from '../../../../../../shared/components/atoms/title';
import { FilterManager } from '../../../../../../shared/components/molecules/filter-manager';
import { FieldType } from '../../../../../../shared/utils/constants';
import type { SearchConfig } from '../../../../../../shared/components/organisms/general-search/searchConfig';
import apolloClient from '../../../../../../../apollo-client';
import { webhookReportsKpiQuery } from '../../../../../../shared/api/queries/webhooks.js';
import KpiCards from './components/KpiCards.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const props = defineProps<{
  integrationId: string;
}>();

const timeOptions = ['today', '7d', '30d', 'custom'] as const;
const selectedRange = ref<typeof timeOptions[number]>('today');

const stats = ref<any | null>(null);
const statsLoading = ref(false);

const fetchStats = async () => {
  statsLoading.value = true;
  try {
    const q = route.query as Record<string, any>;
    const integration = typeof q.integration === 'string' && q.integration ? q.integration : props.integrationId;
    const filter: Record<string, any> = {
      webhookIntegration: { id: { exact: integration } },
    };
    ['status', 'responseCode'].forEach((k) => {
      const v = q[k];
      if (typeof v === 'string' && v) {
        filter[k] = { exact: v };
      }
    });
    ['action', 'topic'].forEach((k) => {
      const v = q[k];
      if (typeof v === 'string' && v) {
        filter.outbox = filter.outbox || {};
        filter.outbox[k] = { exact: v };
      }
    });
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
    if (from && to) {
      filter.sentAt = { gte: from.toISOString(), lte: to.toISOString() };
    }
    const { data } = await apolloClient.query({
      query: webhookReportsKpiQuery,
      fetchPolicy: 'network-only',
      variables: { filter },
    });
    stats.value = data?.webhookReportsKpi || null;
  } catch {
    stats.value = null;
  } finally {
    statsLoading.value = false;
  }
};

watch([() => route.query, selectedRange], fetchStats, { immediate: true });

const selectRange = (opt: typeof timeOptions[number]) => {
  selectedRange.value = opt;
  if (opt !== 'custom') {
    const newQuery = { ...route.query } as Record<string, any>;
    delete newQuery.date;
    router.replace({ query: newQuery });
  }
};

const searchConfig: SearchConfig = {
  search: false,
  filters: [
    {
      type: FieldType.Choice,
      name: 'topic',
      label: t('webhooks.monitor.filters.topic'),
      options: [],
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'action',
      label: t('webhooks.monitor.filters.action'),
      options: [],
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'integration',
      label: t('webhooks.reports.filters.integration'),
      options: [],
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'status',
      label: t('webhooks.monitor.filters.status'),
      options: [],
      labelBy: 'label',
      valueBy: 'value',
    },
    {
      type: FieldType.Choice,
      name: 'responseCode',
      label: t('webhooks.reports.filters.responseCodeBucket'),
      options: [],
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
    <KpiCards :stats="stats" :stats-loading="statsLoading" />
  </div>
</template>

