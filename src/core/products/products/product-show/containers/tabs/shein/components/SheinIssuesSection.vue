<script setup lang="ts">
import { useI18n } from 'vue-i18n';

type FailReasonEntry = { language?: string | null; content?: string | null };

interface SheinProductIssue {
  id: string;
  createdAt?: string | null;
  failedReason?: FailReasonEntry[] | null;
  storeName?: string | null;
}

const props = defineProps<{
  issues: SheinProductIssue[];
}>();

const { t } = useI18n();

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
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

const getFailReasonText = (failedReason?: FailReasonEntry[] | null) => {
  if (!Array.isArray(failedReason) || !failedReason.length) {
    return '-';
  }

  const contents = failedReason
    .map((entry) => (entry?.content ?? '').toString().trim())
    .filter(Boolean);

  return contents.length ? contents.join(' · ') : '-';
};
</script>

<template>
  <div class="mt-6">
    <div class="mb-3">
      <h4 class="font-semibold">{{ t('products.products.shein.issues.title') }}</h4>
      <p class="text-xs text-gray-500">{{ t('products.products.shein.issues.description') }}</p>
    </div>

    <div v-if="props.issues.length" class="overflow-x-auto">
      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead>
          <tr>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
              {{ t('products.products.shein.issues.columns.store') }}
            </th>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
              {{ t('products.products.shein.issues.columns.reason') }}
            </th>
            <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">
              {{ t('products.products.shein.issues.columns.lastFetchedAt') }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="issue in props.issues" :key="issue.id">
            <td class="px-3 py-2 text-sm text-gray-900">{{ issue.storeName || '-' }}</td>
            <td class="px-3 py-2 text-sm text-gray-900 break-words max-w-xl">
              {{ getFailReasonText(issue.failedReason) }}
            </td>
            <td class="px-3 py-2 text-sm text-gray-900">{{ formatDate(issue.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-sm text-gray-500">
      {{ t('products.products.shein.issues.empty') }}
    </div>
  </div>
</template>

