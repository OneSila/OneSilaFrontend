<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Badge } from '../../../../../../../../shared/components/atoms/badge';
import { Link } from '../../../../../../../../shared/components/atoms/link';

interface MiraklIssue {
  id: string;
  mainCode?: string | null;
  code?: string | null;
  message?: string | null;
  severity?: string | null;
  isRejected?: boolean | null;
}

const props = defineProps<{
  issues: MiraklIssue[];
  integrationId?: string | null;
  lastDifferentialIssuesFetch?: string | null;
  lastFullIssuesFetch?: string | null;
}>();

const { t } = useI18n();

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateString));
};

const differentialIssuesFetchLabel = computed(() => formatDate(props.lastDifferentialIssuesFetch));
const fullFetchLabel = computed(() => formatDate(props.lastFullIssuesFetch));

const severityBadge = (severity?: string | null) => {
  if (severity === 'ERROR') {
    return { text: t('integrations.show.miraklIssues.severity.error'), color: 'red' };
  }
  if (severity === 'WARNING') {
    return { text: t('integrations.show.miraklIssues.severity.warning'), color: 'yellow' };
  }
  if (severity === 'INFO') {
    return { text: t('integrations.show.miraklIssues.severity.info'), color: 'blue' };
  }
  return { text: severity || '-', color: 'gray' };
};

const rejectionBadge = (isRejected?: boolean | null) =>
  isRejected
    ? { text: t('integrations.show.miraklIssues.rejected.yes'), color: 'red' }
    : { text: t('integrations.show.miraklIssues.rejected.no'), color: 'green' };
</script>

<template>
  <div>
    <div class="mb-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 class="font-semibold mb-2">{{ t('products.products.mirakl.issues.title') }}</h4>
          <p class="text-xs text-gray-500">{{ t('products.products.mirakl.issues.description') }}</p>
        </div>
        <div class="grid grid-cols-1 gap-2 text-xs text-gray-500 sm:text-right">
          <span>{{ t('products.products.mirakl.issues.lastDifferentialIssuesFetch') }}: {{ differentialIssuesFetchLabel }}</span>
          <span>{{ t('products.products.mirakl.issues.lastFullFetch') }}: {{ fullFetchLabel }}</span>
        </div>
      </div>
    </div>

    <div v-if="issues.length" class="overflow-x-auto">
      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead>
          <tr>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('integrations.show.miraklIssues.columns.code') }}</th>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('integrations.show.miraklIssues.columns.severity') }}</th>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('integrations.show.miraklIssues.columns.isRejected') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="issue in issues" :key="issue.id">
            <td class="px-3 py-2 text-sm max-w-[12rem] break-words">
              <Link
                :path="{
                  name: 'integrations.miraklProductIssues.show',
                  params: { type: 'mirakl', issueId: issue.id },
                  query: integrationId ? { integrationId } : undefined,
                }"
              >
                {{ issue.code || issue.mainCode || '-' }}
              </Link>
            </td>
            <td class="px-3 py-2 text-sm max-w-md">
              <span :title="issue.message || undefined">
                {{ issue.message?.length && issue.message.length > 120 ? `${issue.message.slice(0, 117)}...` : issue.message || '-' }}
              </span>
            </td>
            <td class="px-3 py-2 text-sm">
              <Badge :text="severityBadge(issue.severity).text" :color="severityBadge(issue.severity).color" />
            </td>
            <td class="px-3 py-2 text-sm">
              <Badge :text="rejectionBadge(issue.isRejected).text" :color="rejectionBadge(issue.isRejected).color" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-sm text-gray-500">
      {{ t('products.products.mirakl.issues.empty') }}
    </div>
  </div>
</template>
