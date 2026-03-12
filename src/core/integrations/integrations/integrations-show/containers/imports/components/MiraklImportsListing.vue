<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { DiscreteLoader } from "../../../../../../../shared/components/atoms/discrete-loader";
import { ProgressBar } from "../../../../../../../shared/components/molecules/progress-bar";
import { Badge } from "../../../../../../../shared/components/atoms/badge";
import {
  miraklImportProcessesQuery,
  salesChannelImportsQuery,
} from "../../../../../../../shared/api/queries/salesChannels.js";
import { updateSalesChannelImportMutation } from "../../../../../../../shared/api/mutations/salesChannels";
import { Toast } from "../../../../../../../shared/modules/toast";
import { getStatusBadgeMap } from "../configs";
import apolloClient from "../../../../../../../../apollo-client";
import { getProgressBarUiForStatus } from "../../../../../../../shared/utils/constants";

type ImportSection = 'oneSila' | 'mirakl';

interface SalesChannelImportItem {
  id: string;
  status: 'new' | 'pending' | 'failed' | 'success' | 'processing';
  percentage: number;
  createdAt: string;
}

interface MiraklImportProcessItem {
  id: string;
  proxyId: string;
  status: 'new' | 'pending' | 'failed' | 'success' | 'processing';
  percentage: number;
  createdAt: string;
  remoteImportId?: string | null;
  sourceFileName?: string | null;
  hasErrorReport?: boolean;
  hasTransformedFile?: boolean;
  summaryData?: string | null;
}

defineProps<{ id: string; salesChannelId: string }>();

const route = useRoute();
const { t } = useI18n();
const statusBadgeMap = getStatusBadgeMap(t);
const activeSection = ref<ImportSection>('oneSila');

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const isRetryEnabled = (importItem: SalesChannelImportItem): boolean => {
  const createdDate = new Date(importItem.createdAt);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return ['success', 'failed'].includes(importItem.status) && createdDate >= oneWeekAgo;
};

const getProgressUi = (status: string) => getProgressBarUiForStatus(status);

const formatSummary = (summaryData?: string | null) => {
  if (!summaryData) return '';
  if (typeof summaryData === 'string') return summaryData;
  return JSON.stringify(summaryData);
};

const retryImport = async (importId: string, refetch?: () => Promise<unknown>) => {
  try {
    await apolloClient.mutate({
      mutation: updateSalesChannelImportMutation,
      variables: { data: { id: importId, status: 'pending' } },
    });
    await refetch?.();
    Toast.success(t('integrations.imports.retry.success'));
  } catch (error) {
    Toast.error(t('integrations.imports.retry.error'));
    console.error('Retry failed:', error);
  }
};
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
          @click="activeSection = 'oneSila'"
        >
          {{ t('integrations.imports.mirakl.oneSilaTitle') }}
        </button>
        <button
          type="button"
          class="w-full rounded-lg border px-4 py-3 text-left text-sm transition"
          :class="activeSection === 'mirakl'
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'"
          @click="activeSection = 'mirakl'"
        >
          {{ t('integrations.imports.mirakl.title') }}
        </button>
      </div>
    </div>

    <div class="min-w-0">
      <div v-if="activeSection === 'oneSila'">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 class="text-lg font-semibold">{{ t('integrations.imports.mirakl.oneSilaTitle') }}</h3>
            <p class="text-sm text-gray-500">{{ t('integrations.imports.mirakl.oneSilaHelp') }}</p>
          </div>
          <Link :path="{ name: 'integrations.imports.create', params: { integrationId: id } }">
            <Button type="button" class="btn btn-primary">
              {{ t('integrations.imports.create.title') }}
            </Button>
          </Link>
        </div>

        <ApolloQuery
          :query="salesChannelImportsQuery"
          fetch-policy="cache-and-network"
          :variables="{ first: 50, filter: { salesChannel: { id: { exact: salesChannelId } } } }"
        >
          <template #default="{ result: { loading, error, data }, query }">
            <DiscreteLoader v-if="loading && !data" :loading="true" />

            <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span class="font-medium">{{ t('shared.labels.error') }}:</span> {{ error.message }}
            </div>

            <div v-else-if="data?.salesChannelImports?.edges?.length" class="overflow-auto">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="p-2 text-left">{{ t('shared.labels.createdAt') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.status') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.progress') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.actions') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="edge in data.salesChannelImports.edges"
                    :key="edge.node.id"
                    class="border-b dark:border-[#191e3a]"
                  >
                    <td class="p-2">
                      <Link :path="{ name: 'integrations.imports.show', params: { type: route.params.type, id: edge.node.id } }">
                        {{ formatDate((edge.node as SalesChannelImportItem).createdAt) }}
                      </Link>
                    </td>
                    <td class="p-2">
                      <Badge
                        :color="statusBadgeMap[(edge.node as SalesChannelImportItem).status]?.color"
                        :text="statusBadgeMap[(edge.node as SalesChannelImportItem).status]?.text"
                      />
                    </td>
                    <td class="p-2">
                      <ProgressBar
                        :progress="(edge.node as SalesChannelImportItem).percentage"
                        :label="t(getProgressUi((edge.node as SalesChannelImportItem).status).labelKey)"
                        :label-color="getProgressUi((edge.node as SalesChannelImportItem).status).labelColor"
                        :bar-color="getProgressUi((edge.node as SalesChannelImportItem).status).barColor"
                      />
                    </td>
                    <td class="p-2 text-right">
                      <Button
                        :disabled="!isRetryEnabled(edge.node as SalesChannelImportItem)"
                        @click="retryImport((edge.node as SalesChannelImportItem).id, query.refetch)"
                      >
                        <Icon name="clock-rotate-left" size="lg" class="text-gray-500" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              {{ t('integrations.imports.mirakl.oneSilaEmpty') }}
            </div>
          </template>
        </ApolloQuery>
      </div>

      <div v-else>
        <div class="mb-4">
          <h3 class="text-lg font-semibold">{{ t('integrations.imports.mirakl.title') }}</h3>
          <p class="text-sm text-gray-500">{{ t('integrations.imports.mirakl.help') }}</p>
        </div>

        <ApolloQuery
          :query="miraklImportProcessesQuery"
          fetch-policy="cache-and-network"
          :variables="{ first: 50, filter: { salesChannel: { id: { exact: salesChannelId } } } }"
        >
          <template #default="{ result: { loading, error, data } }">
            <DiscreteLoader v-if="loading && !data" :loading="true" />

            <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span class="font-medium">{{ t('shared.labels.error') }}:</span> {{ error.message }}
            </div>

            <div v-else-if="data?.miraklImportProcesses?.edges?.length" class="overflow-auto">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="p-2 text-left">{{ t('shared.labels.createdAt') }}</th>
                    <th class="p-2 text-left">{{ t('integrations.imports.mirakl.sourceFileName') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.status') }}</th>
                    <th class="p-2 text-left">{{ t('shared.labels.progress') }}</th>
                    <th class="p-2 text-left">{{ t('integrations.imports.mirakl.files') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr
                    v-for="edge in data.miraklImportProcesses.edges"
                    :key="edge.node.id"
                    class="border-b dark:border-[#191e3a]"
                  >
                    <td class="p-2 align-top">{{ formatDate((edge.node as MiraklImportProcessItem).createdAt) }}</td>
                    <td class="p-2 align-top">
                      <div class="font-medium">{{ (edge.node as MiraklImportProcessItem).sourceFileName || '-' }}</div>
                      <div v-if="(edge.node as MiraklImportProcessItem).remoteImportId" class="text-xs text-gray-500">
                        {{ t('integrations.imports.mirakl.remoteImportId') }}:
                        {{ (edge.node as MiraklImportProcessItem).remoteImportId }}
                      </div>
                      <div v-if="(edge.node as MiraklImportProcessItem).summaryData" class="text-xs text-gray-500 whitespace-pre-wrap">
                        {{ formatSummary((edge.node as MiraklImportProcessItem).summaryData) }}
                      </div>
                    </td>
                    <td class="p-2 align-top">
                      <Badge
                        :color="statusBadgeMap[(edge.node as MiraklImportProcessItem).status]?.color"
                        :text="statusBadgeMap[(edge.node as MiraklImportProcessItem).status]?.text"
                      />
                    </td>
                    <td class="p-2 align-top">
                      <ProgressBar
                        :progress="(edge.node as MiraklImportProcessItem).percentage"
                        :label="t(getProgressUi((edge.node as MiraklImportProcessItem).status).labelKey)"
                        :label-color="getProgressUi((edge.node as MiraklImportProcessItem).status).labelColor"
                        :bar-color="getProgressUi((edge.node as MiraklImportProcessItem).status).barColor"
                      />
                    </td>
                    <td class="p-2 align-top text-sm">
                      <div>
                        {{ t('integrations.imports.mirakl.errorReport') }}:
                        {{ (edge.node as MiraklImportProcessItem).hasErrorReport ? t('shared.labels.yes') : t('shared.labels.no') }}
                      </div>
                      <div>
                        {{ t('integrations.imports.mirakl.transformedFile') }}:
                        {{ (edge.node as MiraklImportProcessItem).hasTransformedFile ? t('shared.labels.yes') : t('shared.labels.no') }}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              {{ t('integrations.imports.mirakl.empty') }}
            </div>
          </template>
        </ApolloQuery>
      </div>
    </div>
  </div>
</template>
