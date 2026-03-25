<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../../../../../../../shared/components/organisms/general-listing";
import { SearchConfig } from "../../../../../../../../../shared/components/organisms/general-search/searchConfig";
import { ListingConfig } from "../../../../../../../../../shared/components/organisms/general-listing/listingConfig";
import { Breadcrumbs } from "../../../../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../../../../shared/components/atoms/card";
import { Tabs } from "../../../../../../../../../shared/components/molecules/tabs";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";
import { Badge } from "../../../../../../../../../shared/components/atoms/badge";
import { Link } from "../../../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { Toast } from "../../../../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../../../../apollo-client";
import { miraklFeedShowQuery } from "../../../../../../../../../shared/api/queries/miraklFeeds.js";
import { productsQuery } from "../../../../../../../../../shared/api/queries/products.js";
import { resyncMiraklFeedMutation } from "../../../../../../../../../shared/api/mutations/miraklFeeds.js";
import { FieldType } from "../../../../../../../../../shared/utils/constants";
import { getProductTypeBadgeMap } from "../../../../../../../../products/products/configs";
import {
  concludedMiraklFeedStatuses,
  getMiraklFeedImportStatusLabel,
  getMiraklFeedStatusBadgeMap,
} from "../../../configs";

type MiraklFeedShowResult = {
  id: string;
  type?: string | null;
  stage?: string | null;
  status?: string | null;
  importStatus?: string | null;
  reasonStatus?: string | null;
  remoteId?: string | null;
  productRemoteId?: string | null;
  offerRemoteId?: string | null;
  errorMessage?: string | null;
  payloadData?: any;
  rawData?: any;
  itemsCount?: number | null;
  rowsCount?: number | null;
  lastSyncedAt?: string | null;
  lastSubmittedAt?: string | null;
  lastPolledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  remoteDateCreated?: string | null;
  remoteShopId?: string | null;
  conversionType?: string | null;
  conversionOptionsAiEnrichmentEnabled?: boolean | null;
  conversionOptionsAiRewriteEnabled?: boolean | null;
  integrationDetailsInvalidProducts?: number | null;
  integrationDetailsProductsNotAcceptedInTime?: number | null;
  integrationDetailsProductsNotSynchronizedInTime?: number | null;
  integrationDetailsProductsReimported?: number | null;
  integrationDetailsProductsSuccessfullySynchronized?: number | null;
  integrationDetailsProductsWithSynchronizationIssues?: number | null;
  integrationDetailsProductsWithWrongIdentifiers?: number | null;
  integrationDetailsRejectedProducts?: number | null;
  hasErrorReport?: boolean | null;
  hasNewProductReport?: boolean | null;
  hasTransformationErrorReport?: boolean | null;
  hasTransformedFile?: boolean | null;
  transformLinesRead?: number | null;
  transformLinesInSuccess?: number | null;
  transformLinesInError?: number | null;
  transformLinesWithWarning?: number | null;
  fileUrl?: string | null;
  errorReportFileUrl?: string | null;
  newProductReportFileUrl?: string | null;
  transformedFileUrl?: string | null;
  transformationErrorReportFileUrl?: string | null;
  productType?: { id?: string | null; name?: string | null; remoteId?: string | null; templateUrl?: string | null } | null;
  salesChannel?: { id?: string | null; hostname?: string | null } | null;
  salesChannelView?: { id?: string | null; name?: string | null; remoteId?: string | null } | null;
  products?: { id?: string | null; sku?: string | null; name?: string | null }[] | null;
};

const route = useRoute();
const { t } = useI18n();

const feedId = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = computed(() => (typeof route.query.integrationId === 'string' ? route.query.integrationId : null));

const loading = ref(false);
const resyncing = ref(false);
const feed = ref<MiraklFeedShowResult | null>(null);
const productIds = computed(() =>
  (feed.value?.products || [])
    .map((product) => product.id)
    .filter((id): id is string => Boolean(id)),
);

const statusBadgeMap = computed(() => getMiraklFeedStatusBadgeMap(t));
const canResync = computed(() => concludedMiraklFeedStatuses.includes(feed.value?.status || ''));

const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
  { name: 'products', label: t('integrations.imports.miraklFeeds.tabs.products'), icon: 'box', alwaysRender: true },
]);

const productsSearchConfig: SearchConfig = {
  search: false,
  orderKey: "sort",
  filters: [],
  orders: []
};

const productsListingConfig = computed<ListingConfig>(() => ({
  headers: [t('shared.labels.name'), t('products.products.labels.type.title'), t('shared.labels.active')],
  fields: [
    {
      type: FieldType.Text,
      name: 'name',
    },
    {
      type: FieldType.Badge,
      name: 'type',
      badgeMap: getProductTypeBadgeMap(t),
    },
    {
      type: FieldType.Boolean,
      name: 'active',
    },
  ],
  identifierKey: 'id',
  addActions: false,
  showUrlName: 'products.products.show',
  addShow: true,
  addPagination: true,
}));

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

const toPrettyJson = (value: unknown) => {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch (_error) {
    return String(value ?? '');
  }
};

const payloadJson = computed(() => toPrettyJson(feed.value?.payloadData));
const rawJson = computed(() => toPrettyJson(feed.value?.rawData));

const copyToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const fileCards = computed(() => [
  {
    key: 'file',
    title: t('integrations.imports.miraklFeeds.files.sourceFile'),
    url: feed.value?.fileUrl,
    available: Boolean(feed.value?.fileUrl),
  },
  {
    key: 'error',
    title: t('integrations.imports.miraklFeeds.files.errorReport'),
    url: feed.value?.errorReportFileUrl,
    available: Boolean(feed.value?.hasErrorReport && feed.value?.errorReportFileUrl),
  },
  {
    key: 'new',
    title: t('integrations.imports.miraklFeeds.files.newProductReport'),
    url: feed.value?.newProductReportFileUrl,
    available: Boolean(feed.value?.hasNewProductReport && feed.value?.newProductReportFileUrl),
  },
  {
    key: 'transformed',
    title: t('integrations.imports.miraklFeeds.files.transformedFile'),
    url: feed.value?.transformedFileUrl,
    available: Boolean(feed.value?.hasTransformedFile && feed.value?.transformedFileUrl),
  },
]);

const templateAvailable = computed(() => Boolean(feed.value?.productType?.templateUrl));

const feedFacts = computed(() => [
  { label: t('shared.labels.type'), value: feed.value?.type || '-' },
  { label: t('integrations.imports.miraklFeeds.labels.stage'), value: feed.value?.stage || '-' },
  { label: t('integrations.imports.miraklFeeds.labels.reasonStatus'), value: feed.value?.reasonStatus || '-' },
  { label: t('integrations.imports.miraklFeeds.labels.remoteDateCreated'), value: formatDate(feed.value?.remoteDateCreated) },
  { label: t('integrations.imports.miraklFeeds.labels.conversionType'), value: feed.value?.conversionType || '-' },
  { label: t('integrations.imports.miraklFeeds.labels.lastSubmittedAt'), value: formatDate(feed.value?.lastSubmittedAt) },
  { label: t('integrations.imports.miraklFeeds.labels.lastPolledAt'), value: formatDate(feed.value?.lastPolledAt) },
  { label: t('integrations.imports.miraklFeeds.labels.lastSyncedAt'), value: formatDate(feed.value?.lastSyncedAt) },
  { label: t('shared.labels.createdAt'), value: formatDate(feed.value?.createdAt) },
  { label: t('shared.labels.updatedAt'), value: formatDate(feed.value?.updatedAt) },
]);

const transformCounters = computed(() => [
  { label: t('integrations.imports.miraklFeeds.labels.transformLinesRead'), value: feed.value?.transformLinesRead ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.transformLinesInSuccess'), value: feed.value?.transformLinesInSuccess ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.transformLinesInError'), value: feed.value?.transformLinesInError ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.transformLinesWithWarning'), value: feed.value?.transformLinesWithWarning ?? 0 },
]);

const integrationDetails = computed(() => [
  { label: t('integrations.imports.miraklFeeds.labels.invalidProducts'), value: feed.value?.integrationDetailsInvalidProducts ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.productsNotAcceptedInTime'), value: feed.value?.integrationDetailsProductsNotAcceptedInTime ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.productsNotSynchronizedInTime'), value: feed.value?.integrationDetailsProductsNotSynchronizedInTime ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.productsReimported'), value: feed.value?.integrationDetailsProductsReimported ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.productsSuccessfullySynchronized'), value: feed.value?.integrationDetailsProductsSuccessfullySynchronized ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.productsWithSynchronizationIssues'), value: feed.value?.integrationDetailsProductsWithSynchronizationIssues ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.productsWithWrongIdentifiers'), value: feed.value?.integrationDetailsProductsWithWrongIdentifiers ?? 0 },
  { label: t('integrations.imports.miraklFeeds.labels.rejectedProducts'), value: feed.value?.integrationDetailsRejectedProducts ?? 0 },
]);

const fetchFeed = async () => {
  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: miraklFeedShowQuery,
      variables: { id: feedId.value },
      fetchPolicy: 'network-only',
    });

    feed.value = data?.miraklFeed ?? null;
  } catch (error) {
    console.error('Failed to fetch Mirakl feed:', error);
    Toast.error(t('integrations.imports.miraklFeeds.fetchError'));
  } finally {
    loading.value = false;
  }
};

const refreshAll = async () => {
  await fetchFeed();
};

const resyncFeed = async () => {
  if (!canResync.value) {
    return;
  }

  resyncing.value = true;

  try {
    await apolloClient.mutate({
      mutation: resyncMiraklFeedMutation,
      variables: { id: feedId.value },
    });
    Toast.success(t('integrations.imports.miraklFeeds.resyncSuccess'));
    await fetchFeed();
  } catch (error) {
    console.error('Failed to resync Mirakl feed:', error);
    Toast.error(t('integrations.imports.miraklFeeds.resyncError'));
  } finally {
    resyncing.value = false;
  }
};

onMounted(async () => {
  await refreshAll();
});
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: integrationId ? { name: 'integrations.integrations.show', params: { id: integrationId, type }, query: { tab: 'miraklImports' } } : undefined, name: t('integrations.show.title') },
          { name: t('integrations.imports.miraklFeeds.showTitle') }
        ]"
      />
    </template>

    <template #content>
      <Card>
        <Loader :loading="loading" />

        <Tabs :tabs="tabItems">
          <template #general>
            <div v-if="feed" class="space-y-6 p-6">
              <div class="rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_45%),linear-gradient(135deg,#0f172a,#1e293b)] p-6 text-white">
                <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div class="max-w-3xl">
                    <div class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {{ t('integrations.imports.miraklFeeds.showTitle') }}
                    </div>
                    <div class="mt-3 flex flex-wrap items-center gap-3">
                      <h2 class="text-3xl font-semibold tracking-tight">
                        {{ feed.remoteId || feed.id }}
                      </h2>
                      <Badge
                        :text="statusBadgeMap[feed.status || 'new']?.text || (feed.status || '-')"
                        :color="statusBadgeMap[feed.status || 'new']?.color || 'gray'"
                      />
                      <Badge :text="getMiraklFeedImportStatusLabel(t, feed.importStatus)" color="blue" />
                    </div>
                    <p class="mt-3 max-w-2xl text-sm text-slate-300">
                      {{ feed.errorMessage || t('integrations.imports.miraklFeeds.showDescription') }}
                    </p>
                  </div>
                  <div class="flex flex-wrap gap-3">
                    <Button class="btn btn-outline-light" @click="refreshAll">
                      <Icon name="arrows-rotate" class="mr-2 h-4 w-4" />
                      {{ t('shared.button.refresh') }}
                    </Button>
                    <Button
                      :disabled="!canResync || resyncing"
                      class="btn btn-light"
                      :title="canResync ? t('shared.button.resync') : t('integrations.imports.miraklFeeds.resyncDisabled')"
                      @click="resyncFeed"
                    >
                      <Icon name="clock-rotate-left" class="mr-2 h-4 w-4" />
                      {{ t('shared.button.resync') }}
                    </Button>
                  </div>
                </div>

                <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs uppercase tracking-wide text-slate-300">{{ t('integrations.imports.miraklFeeds.labels.counts') }}</div>
                    <div class="mt-2 text-2xl font-semibold">{{ feed.itemsCount ?? 0 }}</div>
                    <div class="mt-1 text-sm text-slate-300">{{ t('integrations.imports.miraklFeeds.counts.rows', { count: feed.rowsCount || 0 }) }}</div>
                  </div>
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs uppercase tracking-wide text-slate-300">{{ t('integrations.imports.miraklFeeds.labels.remoteDateCreated') }}</div>
                    <div class="mt-2 text-lg font-semibold">{{ formatDate(feed.remoteDateCreated) }}</div>
                    <div class="mt-1 text-sm text-slate-300">{{ t('integrations.imports.miraklFeeds.labels.stage') }}: {{ feed.stage || '-' }}</div>
                  </div>
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs uppercase tracking-wide text-slate-300">{{ t('integrations.imports.miraklFeeds.labels.lastSubmittedAt') }}</div>
                    <div class="mt-2 text-lg font-semibold">{{ formatDate(feed.lastSubmittedAt) }}</div>
                    <div class="mt-1 text-sm text-slate-300">{{ t('integrations.imports.miraklFeeds.labels.lastPolledAt') }}: {{ formatDate(feed.lastPolledAt) }}</div>
                  </div>
                  <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div class="text-xs uppercase tracking-wide text-slate-300">{{ t('integrations.imports.miraklFeeds.labels.conversionType') }}</div>
                    <div class="mt-2 text-lg font-semibold">{{ feed.conversionType || '-' }}</div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <Badge
                        :text="`${t('integrations.imports.miraklFeeds.labels.aiEnrichment')}: ${feed.conversionOptionsAiEnrichmentEnabled ? t('shared.labels.yes') : t('shared.labels.no')}`"
                        :color="feed.conversionOptionsAiEnrichmentEnabled ? 'green' : 'gray'"
                      />
                      <Badge
                        :text="`${t('integrations.imports.miraklFeeds.labels.aiRewrite')}: ${feed.conversionOptionsAiRewriteEnabled ? t('shared.labels.yes') : t('shared.labels.no')}`"
                        :color="feed.conversionOptionsAiRewriteEnabled ? 'green' : 'gray'"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
                <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-slate-900">{{ t('shared.tabs.general') }}</h3>
                    <Badge :text="feed.type || '-'" color="gray" />
                  </div>
                  <dl class="grid gap-x-6 gap-y-4 md:grid-cols-2">
                    <div v-for="fact in feedFacts" :key="fact.label" class="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
                      <dt class="text-xs uppercase tracking-wide text-slate-500">{{ fact.label }}</dt>
                      <dd class="mt-1 break-words text-sm font-medium text-slate-900">{{ fact.value }}</dd>
                    </div>
                  </dl>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.sections.productContext') }}</h3>
                  <div class="mt-4 space-y-4">
                    <div class="rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.labels.productType') }}</div>
                      <div class="mt-1 text-base font-semibold text-slate-900">{{ feed.productType?.name || '-' }}</div>
                      <div class="mt-1 text-sm text-slate-500">{{ feed.productType?.remoteId || '-' }}</div>
                      <div class="mt-3 flex items-center gap-2">
                        <Badge :text="templateAvailable ? t('integrations.imports.miraklFeeds.template.available') : t('integrations.imports.miraklFeeds.template.missing')" :color="templateAvailable ? 'green' : 'gray'" />
                        <Link v-if="feed.productType?.templateUrl" external :path="feed.productType.templateUrl">
                          <Button class="btn btn-outline-primary">
                            <Icon name="download" class="mr-2 h-4 w-4" />
                            {{ t('integrations.imports.miraklFeeds.template.download') }}
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div class="rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.labels.view') }}</div>
                      <div class="mt-1 text-base font-semibold text-slate-900">{{ feed.salesChannelView?.name || '-' }}</div>
                      <div class="mt-1 text-sm text-slate-500">{{ feed.salesChannelView?.remoteId || '-' }}</div>
                    </div>
                    <div class="rounded-xl border border-gray-100 bg-slate-50 p-4">
                      <div class="text-xs uppercase tracking-wide text-slate-500">{{ t('integrations.imports.miraklFeeds.labels.salesChannel') }}</div>
                      <div class="mt-1 text-base font-semibold text-slate-900">{{ feed.salesChannel?.hostname || '-' }}</div>
                    </div>
                  </div>
                </section>
              </div>

              <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div class="mb-4 flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.sections.files') }}</h3>
                  <Badge :text="t('integrations.imports.miraklFeeds.sections.fourCardLayout')" color="blue" />
                </div>
                <div class="grid gap-4 xl:grid-cols-4">
                  <div v-for="card in fileCards" :key="card.key" class="flex h-full flex-col rounded-2xl border border-gray-200 bg-gradient-to-b from-white to-slate-50 p-4">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <div class="text-sm font-semibold text-slate-900">{{ card.title }}</div>
                        <div class="mt-1 text-xs text-slate-500">
                          {{ card.available ? t('integrations.imports.miraklFeeds.fileAvailable') : t('integrations.imports.miraklFeeds.fileMissing') }}
                        </div>
                      </div>
                      <Badge :text="card.available ? t('integrations.imports.miraklFeeds.fileStatus.available') : t('integrations.imports.miraklFeeds.fileStatus.missing')" :color="card.available ? 'green' : 'gray'" />
                    </div>
                    <div class="mt-6">
                      <Link v-if="card.url" external :path="card.url">
                        <Button class="btn btn-outline-primary w-full justify-center">
                          <Icon name="download" class="mr-2 h-4 w-4" />
                          {{ t('shared.button.download') }}
                        </Button>
                      </Link>
                      <Button v-else class="btn btn-outline-dark w-full justify-center" disabled>
                        {{ t('integrations.imports.miraklFeeds.noFile') }}
                      </Button>
                    </div>
                  </div>
                </div>

                <div class="mt-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50 p-4">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div class="text-sm font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.files.transformationErrorReport') }}</div>
                      <div class="mt-1 text-xs text-slate-600">
                        {{ feed.transformationErrorReportFileUrl ? t('integrations.imports.miraklFeeds.fileAvailable') : t('integrations.imports.miraklFeeds.fileMissing') }}
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <Badge :text="feed.transformationErrorReportFileUrl ? t('integrations.imports.miraklFeeds.fileStatus.available') : t('integrations.imports.miraklFeeds.fileStatus.missing')" :color="feed.transformationErrorReportFileUrl ? 'orange' : 'gray'" />
                      <Link v-if="feed.transformationErrorReportFileUrl" external :path="feed.transformationErrorReportFileUrl">
                        <Button class="btn btn-outline-dark">
                          <Icon name="download" class="mr-2 h-4 w-4" />
                          {{ t('shared.button.download') }}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <div class="grid gap-6 xl:grid-cols-2">
                <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.sections.integrationDetails') }}</h3>
                  <dl class="mt-4 grid gap-3 sm:grid-cols-2">
                    <div v-for="item in integrationDetails" :key="item.label" class="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
                      <dt class="text-xs uppercase tracking-wide text-slate-500">{{ item.label }}</dt>
                      <dd class="mt-1 text-lg font-semibold text-slate-900">{{ item.value }}</dd>
                    </div>
                  </dl>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.sections.transformCounters') }}</h3>
                  <dl class="mt-4 grid gap-3 sm:grid-cols-2">
                    <div v-for="item in transformCounters" :key="item.label" class="rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
                      <dt class="text-xs uppercase tracking-wide text-slate-500">{{ item.label }}</dt>
                      <dd class="mt-1 text-lg font-semibold text-slate-900">{{ item.value }}</dd>
                    </div>
                  </dl>
                </section>
              </div>

              <div class="grid gap-6 xl:grid-cols-2">
                <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.sections.payloadData') }}</h3>
                    <Button class="btn btn-outline-dark" @click="copyToClipboard(payloadJson)">
                      <Icon name="clipboard" class="mr-2 h-4 w-4" />
                      {{ t('shared.button.copy') }}
                    </Button>
                  </div>
                  <pre class="max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{{ payloadJson }}</pre>
                </section>

                <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.sections.rawData') }}</h3>
                    <Button class="btn btn-outline-dark" @click="copyToClipboard(rawJson)">
                      <Icon name="clipboard" class="mr-2 h-4 w-4" />
                      {{ t('shared.button.copy') }}
                    </Button>
                  </div>
                  <pre class="max-h-[28rem] overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100">{{ rawJson }}</pre>
                </section>
              </div>
            </div>
          </template>

          <template #products>
            <div class="p-6">
              <div class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
                <div>
                  <h3 class="text-xl font-semibold text-slate-900">{{ t('integrations.imports.miraklFeeds.tabs.products') }}</h3>
                  <p class="mt-1 text-sm text-slate-600">{{ t('integrations.imports.miraklFeeds.productsDescription') }}</p>
                </div>
                <Badge :text="t('integrations.imports.miraklFeeds.counts.items', { count: productIds.length })" color="blue" />
              </div>

              <div v-if="loading" class="py-8">
                <Loader :loading="true" />
              </div>

              <div v-else-if="!productIds.length" class="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-sm text-gray-500">
                {{ t('integrations.imports.miraklFeeds.productsEmpty') }}
              </div>

              <div v-else>
                <GeneralListing
                  :searchConfig="productsSearchConfig"
                  :config="productsListingConfig as ListingConfig"
                  :query="productsQuery"
                  :query-key="'products'"
                  :fixed-filter-variables="{ id: { inList: productIds } }"
                />
              </div>
            </div>
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>
