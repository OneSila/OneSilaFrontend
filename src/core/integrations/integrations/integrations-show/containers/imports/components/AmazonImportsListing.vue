<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../../shared/components/atoms/button";
import { ApolloSubscription } from "../../../../../../../shared/components/molecules/apollo-subscription";
import { DiscreteLoader } from "../../../../../../../shared/components/atoms/discrete-loader";
import { AssignProgressBar } from "../../../../../../../shared/components/molecules/assign-progress-bar";
import { Badge } from "../../../../../../../shared/components/atoms/badge";
import { salesChannelSubscription } from "../../../../../../../shared/api/subscriptions/salesChannels.js";
import {
  updateAmazonImportProcessMutation,
} from "../../../../../../../shared/api/mutations/salesChannels";
import { Toast } from "../../../../../../../shared/modules/toast";
import { getStatusBadgeMap, SalesChannelSubscriptionResult } from "../configs";
import apolloClient from "../../../../../../../../apollo-client";
import {Icon} from "../../../../../../../shared/components/atoms/icon";

const props = defineProps<{ id: string; salesChannelId: string }>();
const { t } = useI18n();

const statusBadgeMap = getStatusBadgeMap(t);

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

const isRetryEnabled = (importItem: any): boolean => {
  const createdDate = new Date(importItem.createdAt);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return ['success', 'failed'].includes(importItem.status) && createdDate >= oneWeekAgo;
};

const retryImport = async (importId: string) => {
  try {
    await apolloClient.mutate({
      mutation: updateAmazonImportProcessMutation,
      variables: { data: { id: importId, status: 'pending' } },
    });
    Toast.success(t('integrations.imports.retry.success'));
  } catch (e) {
    Toast.error(t('integrations.imports.retry.error'));
    console.error('Retry failed:', e);
  }
};
</script>

<template>
  <ApolloSubscription :subscription="salesChannelSubscription" :variables="{ pk: props.salesChannelId }">
    <template #default="{ result }">
      <div v-if="result">
        <div class="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div></div>
          <div>
            <Link :path="{ name: 'integrations.imports.create', params: { integrationId: id } }">
              <Button type="button" class="btn btn-primary">
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
              <tr v-for="importItem in (result as SalesChannelSubscriptionResult).salesChannel.amazonImports" :key="importItem.id" class="border-b dark:border-[#191e3a]">
                <td class="p-2">{{ formatDate(importItem.createdAt) }}</td>
                <td class="p-2">{{ t(`integrations.imports.types.${importItem.type}`) }}</td>
                <td class="p-2">
                  <Badge :color="statusBadgeMap[importItem.status]?.color" :text="statusBadgeMap[importItem.status]?.text" />
                </td>
                <td class="p-2">
                  <AssignProgressBar :progress="importItem.percentage" :is-error="importItem.status === 'failed'" />
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
      <div v-else>
        <DiscreteLoader :loading="true" />
      </div>
    </template>
  </ApolloSubscription>
</template>
