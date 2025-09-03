import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import apolloClient from '../../../../../../../apollo-client';
import { webhookDeliveriesQuery } from '../../../../../../shared/api/queries/webhooks.js';

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
      return 12000;
    }
    return emptyPolls >= 3 ? 8000 : 4000;
  };

  const withJitter = (ms: number) => {
    const jitter = ms * 0.15;
    return ms + (Math.random() * jitter * 2 - jitter);
  };

  const fetchEvents = async () => {
    loading.value = true;
    try {
      const { data } = await apolloClient.query({
        query: webhookDeliveriesQuery,
        fetchPolicy: 'network-only',
        variables: {
          filter: filters.value,
          ...pagination,
          from: timeRange.value?.from,
          to: timeRange.value?.to,
        },
      });
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
  };

  const updateTimeRange = (range: TimeRange | null) => {
    timeRange.value = range;
    events.value = [];
    refresh();
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
  };
}

