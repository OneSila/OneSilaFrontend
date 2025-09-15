import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import apolloClient from '../../../../../../../apollo-client';
import { webhookDeliveriesQuery, webhookDeliveryStatsQuery } from '../../../../../../shared/api/queries/webhooks.js';

interface TimeRange {
  from?: string;
  to?: string;
}

interface Pagination {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
}

interface Options {
  live?: boolean;
  filters?: Record<string, any>;
  timeRange?: TimeRange | null;
  pagination?: Pagination;
}

export function useLiveMonitor(options: Options = {}) {
  const events = ref<any[]>([]);
  const pageInfo = ref<any | null>(null);
  const loading = ref(false);
  const error = ref<unknown>(null);
  const stats = ref<any | null>(null);
  const statsLoading = ref(false);

  const filters = ref(options.filters || {});
  const timeRange = ref<TimeRange | null>(options.timeRange || null);
  const pagination = reactive<Pagination>({ first: 20, ...(options.pagination || {}) });
  const live = ref(options.live !== false);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let emptyPolls = 0;

  const getInterval = () => {
    if (!live.value) {
      return null;
    }
    if (document.hidden) {
      return 15000;
    }
    return emptyPolls >= 3 ? 12000 : 6000;
  };

  const withJitter = (ms: number) => {
    const jitter = ms * 0.15;
    return ms + (Math.random() * jitter * 2 - jitter);
  };

  const fetchEvents = async () => {
    loading.value = true;
    try {
      const filter = { ...filters.value };
      if (timeRange.value?.from && timeRange.value?.to) {
        filter.sentAt = {
          gte: timeRange.value.from,
          lte: timeRange.value.to,
        };
      }
      const { data } = await apolloClient.watchQuery({
        query: webhookDeliveriesQuery,
        fetchPolicy: 'cache-and-network',
        variables: {
          filter,
          ...pagination,
        },
      }).result();
      const edges = data?.webhookDeliveries?.edges || [];
      pageInfo.value = data?.webhookDeliveries?.pageInfo || null;
      const nodes = edges.map((e: any) => e.node);
      if (nodes.length > 0) {
        if (!live.value || events.value.length === 0) {
          events.value = nodes;
        } else {
          const existing = new Set(events.value.map((e) => e.outbox?.id));
          const fresh = nodes.filter((n: any) => !existing.has(n.outbox?.id));
          if (fresh.length) {
            events.value = [...fresh, ...events.value];
          }
        }
        emptyPolls = 0;
      } else {
        emptyPolls += 1;
      }
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    statsLoading.value = true;
    try {
      const filter = { ...filters.value };
      if (timeRange.value?.from && timeRange.value?.to) {
        filter.sentAt = {
          gte: timeRange.value.from,
          lte: timeRange.value.to,
        };
      }
      const { data } = await apolloClient.watchQuery({
        query: webhookDeliveryStatsQuery,
        fetchPolicy: 'cache-and-network',
        variables: { filter },
      }).result();
      stats.value = data?.webhookDeliveryStats || null;
    } catch (e) {
      stats.value = null;
    } finally {
      statsLoading.value = false;
    }
  };

  const schedule = () => {
    if (!live.value) {
      return;
    }
    const base = getInterval();
    if (!base) {
      return;
    }
    timer = setTimeout(async () => {
      await fetchEvents();
      schedule();
    }, withJitter(base));
  };

  const refresh = async () => {
    emptyPolls = 0;
    await fetchEvents();
    if (live.value) {
      schedule();
    }
  };

  const updateFilters = (newFilters: Record<string, any>) => {
    filters.value = newFilters;
    events.value = [];
    refresh();
    fetchStats();
  };

  const updateTimeRange = (range: TimeRange | null) => {
    timeRange.value = range;
    events.value = [];
    refresh();
    fetchStats();
  };

  const stop = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const visibilityHandler = () => {
    if (live.value) {
      stop();
      schedule();
    }
  };

  watch(live, (val) => {
    if (val) {
      refresh();
    } else {
      stop();
    }
  });

  onMounted(() => {
    if (live.value) {
      refresh();
    } else {
      fetchEvents();
    }
    fetchStats();
    document.addEventListener('visibilitychange', visibilityHandler);
  });

  onBeforeUnmount(() => {
    stop();
    document.removeEventListener('visibilitychange', visibilityHandler);
  });

  return {
    events,
    pageInfo,
    loading,
    error,
    filters,
    timeRange,
    pagination,
    live,
    refresh,
    updateFilters,
    updateTimeRange,
    stats,
    statsLoading,
  };
}

