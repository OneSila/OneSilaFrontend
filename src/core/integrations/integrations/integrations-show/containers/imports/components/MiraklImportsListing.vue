<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { DiscreteLoader } from "../../../../../../../shared/components/atoms/discrete-loader";
import { Badge } from "../../../../../../../shared/components/atoms/badge";
import { ProgressBar } from "../../../../../../../shared/components/molecules/progress-bar";
import { ApolloSubscription } from "../../../../../../../shared/components/molecules/apollo-subscription";
import { salesChannelSubscription } from "../../../../../../../shared/api/subscriptions/salesChannels.js";
import { miraklFeedsQuery } from "../../../../../../../shared/api/queries/miraklFeeds.js";
import { resyncMiraklFeedMutation } from "../../../../../../../shared/api/mutations/miraklFeeds.js";
import { updateMiraklImportProcessMutation } from "../../../../../../../shared/api/mutations/salesChannels";
import { Toast } from "../../../../../../../shared/modules/toast";
import {
  concludedMiraklFeedStatuses,
  getMiraklFeedImportStatusLabel,
  getMiraklFeedStatusBadgeMap,
  getStatusBadgeMap,
  MiraklFeedListItem,
  SalesChannelSubscriptionResult,
} from "../configs";
import apolloClient from "../../../../../../../../apollo-client";
import { getProgressBarUiForStatus } from "../../../../../../../shared/utils/constants";

const props = defineProps<{ id: string; salesChannelId: string }>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const activeSection = ref<'oneSila' | 'mirakl'>('oneSila');
const loadingFeeds = ref(false);
const feeds = ref<MiraklFeedListItem[]>([]);
const selectedStatus = ref<string>('all');
const selectedImportStatus = ref<string>('all');
const resyncingFeedId = ref<string | null>(null);

const statusBadgeMap = getStatusBadgeMap(t);
const miraklFeedStatusBadgeMap = computed(() => getMiraklFeedStatusBadgeMap(t));

const miraklFeedStatusOptions = computed(() => [
  { value: 'all', label: t('integrations.imports.miraklFeeds.filters.allStatuses') },
  { value: 'new', label: t('integrations.imports.miraklFeeds.status.new') },
  { value: 'pending', label: t('integrations.imports.miraklFeeds.status.pending') },
  { value: 'gathering_products', label: t('integrations.imports.miraklFeeds.status.gathering_products') },
  { value: 'gathering_offers', label: t('integrations.imports.miraklFeeds.status.gathering_offers') },
  { value: 'ready_to_render', label: t('integrations.imports.miraklFeeds.status.ready_to_render') },
  { value: 'submitted', label: t('integrations.imports.miraklFeeds.status.submitted') },
  { value: 'processing', label: t('integrations.imports.miraklFeeds.status.processing') },
  { value: 'success', label: t('integrations.imports.miraklFeeds.status.success') },
  { value: 'partial', label: t('integrations.imports.miraklFeeds.status.partial') },
  { value: 'failed', label: t('integrations.imports.miraklFeeds.status.failed') },
  { value: 'cancelled', label: t('integrations.imports.miraklFeeds.status.cancelled') },
]);

const miraklImportStatusOptions = computed(() => [
  { value: 'all', label: t('integrations.imports.miraklFeeds.filters.allImportStatuses') },
  { value: 'TRANSFORMATION_WAITING', label: t('integrations.imports.miraklFeeds.importStatus.TRANSFORMATION_WAITING') },
  { value: 'TRANSFORMATION_RUNNING', label: t('integrations.imports.miraklFeeds.importStatus.TRANSFORMATION_RUNNING') },
  { value: 'TRANSFORMATION_FAILED', label: t('integrations.imports.miraklFeeds.importStatus.TRANSFORMATION_FAILED') },
  { value: 'WAITING', label: t('integrations.imports.miraklFeeds.importStatus.WAITING') },
  { value: 'RUNNING', label: t('integrations.imports.miraklFeeds.importStatus.RUNNING') },
  { value: 'SENT', label: t('integrations.imports.miraklFeeds.importStatus.SENT') },
  { value: 'COMPLETE', label: t('integrations.imports.miraklFeeds.importStatus.COMPLETE') },
  { value: 'CANCELLED', label: t('integrations.imports.miraklFeeds.importStatus.CANCELLED') },
  { value: 'FAILED', label: t('integrations.imports.miraklFeeds.importStatus.FAILED') },
]);

const formatDate = (dateString?: string | null) => {
  if (!dateString) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateString));
};

const summary = computed(() => ({
  total: feeds.value.length,
  concluded: feeds.value.filter((feed) => concludedMiraklFeedStatuses.includes(feed.status || '')).length,
  active: feeds.value.filter((feed) => !concludedMiraklFeedStatuses.includes(feed.status || '')).length,
  withReports: feeds.value.filter((feed) =>
    Boolean(
      feed.hasErrorReport ||
      feed.hasNewProductReport ||
      feed.hasTransformationErrorReport ||
      feed.hasTransformedFile,
    ),
  ).length,
}));

const isRetryEnabled = (importItem: any): boolean => {
  const createdDate = new Date(importItem.createdAt);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return ['success', 'failed'].includes(importItem.status) && createdDate >= oneWeekAgo;
};

const getProgressUi = (status: string) => getProgressBarUiForStatus(status);

const buildFeedFilters = () => {
  const filter: Record<string, any> = {
    salesChannel: { id: { exact: props.salesChannelId } },
  };

  if (selectedStatus.value !== 'all') {
    filter.status = { exact: selectedStatus.value };
  }

  if (selectedImportStatus.value !== 'all') {
    filter.importStatus = { exact: selectedImportStatus.value };
  }

  return filter;
};

const fetchMiraklFeeds = async () => {
  loadingFeeds.value = true;

  try {
    const { data } = await apolloClient.query({
      query: miraklFeedsQuery,
      variables: {
        first: 50,
        filter: buildFeedFilters(),
        order: { createdAt: 'DESC' },
      },
      fetchPolicy: 'network-only',
    });

    feeds.value = data?.miraklFeeds?.edges?.map((edge: any) => edge.node) || [];
  } catch (error) {
    feeds.value = [];
    Toast.error(t('integrations.imports.miraklFeeds.fetchError'));
    console.error('Failed to fetch Mirakl feeds:', error);
  } finally {
    loadingFeeds.value = false;
  }
};

const canResync = (feed: MiraklFeedListItem) => concludedMiraklFeedStatuses.includes(feed.status || '');

const resyncFeed = async (feedId: string) => {
  resyncingFeedId.value = feedId;

  try {
    await apolloClient.mutate({
      mutation: resyncMiraklFeedMutation,
      variables: { id: feedId },
    });
    Toast.success(t('integrations.imports.miraklFeeds.resyncSuccess'));
    await fetchMiraklFeeds();
  } catch (error) {
    Toast.error(t('integrations.imports.miraklFeeds.resyncError'));
    console.error('Failed to resync Mirakl feed:', error);
  } finally {
    resyncingFeedId.value = null;
  }
};

const retryImport = async (importId: string) => {
  try {
    await apolloClient.mutate({
      mutation: updateMiraklImportProcessMutation,
      variables: { data: { id: importId, status: 'pending' } },
    });
    Toast.success(t('integrations.imports.retry.success'));
  } catch (error) {
    Toast.error(t('integrations.imports.retry.error'));
    console.error('Retry failed:', error);
  }
};

const setActiveSection = async (section: 'oneSila' | 'mirakl') => {
  if (activeSection.value === section) {
    return;
  }

  activeSection.value = section;
  await router.push({
    query: {
      ...route.query,
      tab: section === 'mirakl' ? 'miraklImports' : 'imports',
    },
  });
};

watch([selectedStatus, selectedImportStatus], () => {
  if (activeSection.value === 'mirakl') {
    void fetchMiraklFeeds();
  }
});

watch(
  () => route.query.tab,
  (tab) => {
    if (tab === 'miraklImports') {
      activeSection.value = 'mirakl';
      return;
    }

    activeSection.value = 'oneSila';
  },
  { immediate: true },
);

watch(activeSection, (value) => {
  if (value === 'mirakl' && !feeds.value.length) {
    void fetchMiraklFeeds();
  }
});

onMounted(() => {
  if (activeSection.value === 'mirakl') {
    void fetchMiraklFeeds();
  }
});
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
    <div class="border-r border-gray-200 pr-4">
      <div class="space-y-2">
        <button
          type="button"
          class="w-full rounded-lg border px-4 py-3 text-left text-sm transition"
          :class="activeSection === 'oneSila'
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'"
          @click="setActiveSection('oneSila')"
        >
          {{ t('integrations.imports.mirakl.oneSilaTitle') }}
        </button>
        <button
          type="button"
          class="w-full rounded-lg border px-4 py-3 text-left text-sm transition"
          :class="activeSection === 'mirakl'
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'"
          @click="setActiveSection('mirakl')"
        >
          {{ t('integrations.imports.mirakl.title') }}
        </button>
      </div>
    </div>

    <div class="min-w-0">
      <ApolloSubscription v-if="activeSection === 'oneSila'" :subscription="salesChannelSubscription" :variables="{ pk: props.salesChannelId }">
        <template #default="{ result, error }">
          <div v-if="result">
            <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
              <div></div>
              <div>
                <Link
                  :disabled="(result as SalesChannelSubscriptionResult).salesChannel.isImporting"
                  :path="{ name: 'integrations.imports.create', params: { integrationId: id } }"
                >
                  <Button
                    :disabled="(result as SalesChannelSubscriptionResult).salesChannel.isImporting"
                    type="button"
                    class="btn btn-primary"
                  >
                    {{ t('integrations.imports.create.title') }}
                  </Button>
                </Link>
              </div>
            </div>
            <div class="mt-2 h-full">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="p-2 text-left">{{ t('shared.labels.createdAt') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.type') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.status') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.progress') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="importItem in (result as SalesChannelSubscriptionResult).salesChannel.miraklImports"
                    :key="importItem.id"
                    class="border-b dark:border-[#191e3a]"
                  >
                    <td class="p-2">
                      <Link :path="{ name: 'integrations.imports.show', params: { type: route.params.type, id: importItem.proxyId } }">
                        {{ formatDate(importItem.createdAt) }}
                      </Link>
                    </td>
                    <td class="p-2">{{ t(`integrations.imports.types.${importItem.type}`) }}</td>
                    <td class="p-2">
                      <Badge :color="statusBadgeMap[importItem.status]?.color" :text="statusBadgeMap[importItem.status]?.text" />
                    </td>
                    <td class="p-2">
                      <ProgressBar
                        :progress="importItem.percentage"
                        :label="t(getProgressUi(importItem.status).labelKey)"
                        :label-color="getProgressUi(importItem.status).labelColor"
                        :bar-color="getProgressUi(importItem.status).barColor"
                      />
                    </td>
                    <td class="p-2 text-right">
                      <Button :disabled="!isRetryEnabled(importItem)" @click="retryImport(importItem.id)">
                        <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span class="font-medium">{{ t('shared.labels.error') }}:</span> {{ (error as Error).message }}
          </div>

          <div v-else>
            <DiscreteLoader :loading="true" />
          </div>
        </template>
      </ApolloSubscription>

      <div v-else class="space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {{ t('integrations.imports.mirakl.title') }}
              </div>
              <h3 class="mt-2 text-2xl font-semibold text-slate-900">
                {{ t('integrations.imports.miraklFeeds.heading') }}
              </h3>
              <p class="mt-2 max-w-3xl text-sm text-slate-600">
                {{ t('integrations.imports.miraklFeeds.description') }}
              </p>
            </div>
            <div class="flex flex-wrap gap-3">
              <Button class="btn btn-outline-primary" @click="fetchMiraklFeeds">
                <Icon name="arrows-rotate" class="mr-2 h-4 w-4" />
                {{ t('shared.button.refresh') }}
              </Button>
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-xl border border-slate-200 bg-white/80 p-4">
              <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.summary.total') }}</div>
              <div class="mt-2 text-2xl font-semibold text-slate-900">{{ summary.total }}</div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white/80 p-4">
              <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.summary.active') }}</div>
              <div class="mt-2 text-2xl font-semibold text-blue-700">{{ summary.active }}</div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white/80 p-4">
              <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.summary.concluded') }}</div>
              <div class="mt-2 text-2xl font-semibold text-emerald-700">{{ summary.concluded }}</div>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white/80 p-4">
              <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.summary.withReports') }}</div>
              <div class="mt-2 text-2xl font-semibold text-amber-700">{{ summary.withReports }}</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-gray-700">{{ t('shared.labels.status') }}</span>
              <select v-model="selectedStatus" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option v-for="option in miraklFeedStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-gray-700">{{ t('integrations.imports.miraklFeeds.labels.importStatus') }}</span>
              <select v-model="selectedImportStatus" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                <option v-for="option in miraklImportStatusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-200 px-5 py-4">
            <h4 class="text-lg font-semibold text-gray-900">{{ t('integrations.imports.miraklFeeds.tableTitle') }}</h4>
          </div>

          <div v-if="loadingFeeds" class="p-6">
            <DiscreteLoader :loading="true" />
          </div>

          <div v-else-if="!feeds.length" class="px-6 py-10 text-sm text-gray-500">
            {{ t('integrations.imports.miraklFeeds.empty') }}
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full min-w-[980px] divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('shared.labels.createdAt') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('shared.labels.status') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('integrations.imports.miraklFeeds.labels.importStatus') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('integrations.imports.miraklFeeds.labels.remoteId') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('integrations.imports.miraklFeeds.labels.productType') }}</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('integrations.imports.miraklFeeds.labels.view') }}</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">{{ t('shared.labels.actions') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="feed in feeds" :key="feed.id" class="align-top hover:bg-slate-50/70">
                  <td class="px-4 py-4 text-sm text-gray-700">
                    <Link
                      :path="{ name: 'integrations.imports.show', params: { type: route.params.type, id: feed.id }, query: { integrationId: props.id } }"
                      class="font-medium text-slate-900"
                    >
                      {{ formatDate(feed.createdAt) }}
                    </Link>
                    <div class="mt-1 text-xs text-gray-500">
                      {{ t('shared.labels.updatedAt') }}: {{ formatDate(feed.remoteDateCreated || feed.lastSyncedAt) }}
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm">
                    <div class="flex flex-col gap-2">
                      <Badge
                        :color="miraklFeedStatusBadgeMap[feed.status || 'new']?.color || 'gray'"
                        :text="miraklFeedStatusBadgeMap[feed.status || 'new']?.text || (feed.status || '-')"
                      />
                      <span class="text-xs text-gray-500">{{ feed.stage || '-' }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-700">
                    <div class="font-medium text-slate-900">{{ getMiraklFeedImportStatusLabel(t, feed.importStatus) }}</div>
                    <div class="mt-1 text-xs text-gray-500">{{ feed.reasonStatus || '-' }}</div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-700">
                    <div class="font-medium text-slate-900">{{ feed.remoteId || '-' }}</div>
                    <div class="mt-1 max-w-xs truncate text-xs text-gray-500" :title="feed.errorMessage || undefined">
                      {{ feed.errorMessage || '-' }}
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-700">
                    <div class="font-medium text-slate-900">{{ feed.productType?.name || '-' }}</div>
                    <div class="mt-1 text-xs text-gray-500">
                      {{ feed.productType?.remoteId || '-' }}
                    </div>
                    <div class="mt-2">
                      <Badge :color="feed.productType?.templateUrl ? 'green' : 'gray'" :text="feed.productType?.templateUrl ? t('integrations.imports.miraklFeeds.template.available') : t('integrations.imports.miraklFeeds.template.missing')" />
                    </div>
                  </td>
                  <td class="px-4 py-4 text-sm text-gray-700">
                    <div class="font-medium text-slate-900">{{ feed.salesChannelView?.name || '-' }}</div>
                    <div class="mt-1 text-xs text-gray-500">{{ feed.salesChannelView?.remoteId || '-' }}</div>
                  </td>
                  <td class="px-4 py-4 text-right text-sm">
                    <div class="flex items-center justify-end gap-2">
                      <Link :path="{ name: 'integrations.imports.show', params: { type: route.params.type, id: feed.id }, query: { integrationId: props.id } }">
                        <Button class="btn btn-outline-primary">
                          {{ t('shared.button.show') }}
                        </Button>
                      </Link>
                      <Button
                        :disabled="!canResync(feed) || resyncingFeedId === feed.id"
                        class="btn btn-outline-dark"
                        :title="canResync(feed) ? t('shared.button.resync') : t('integrations.imports.miraklFeeds.resyncDisabled')"
                        @click="resyncFeed(feed.id)"
                      >
                        <Icon name="clock-rotate-left" class="mr-2 h-4 w-4" />
                        {{ t('shared.button.resync') }}
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
