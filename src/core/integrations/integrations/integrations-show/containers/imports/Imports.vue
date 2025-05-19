<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from 'vue-i18n';
import { Link } from "../../../../../../shared/components/atoms/link";
import { Button } from "../../../../../../shared/components/atoms/button";
import { ApolloSubscription } from "../../../../../../shared/components/molecules/apollo-subscription";
import { salesChannelSubscription } from "../../../../../../shared/api/subscriptions/salesChannels.js"
import { DiscreteLoader } from "../../../../../../shared/components/atoms/discrete-loader";
import { AssignProgressBar } from "../../../../../../shared/components/molecules/assign-progress-bar";
import { getStatusBadgeMap, SalesChannelSubscriptionResult } from "./configs";
import { Badge } from "../../../../../../shared/components/atoms/badge";
import {
  createSalesChannelImportMutation,
  updateSalesChannelImportMutation
} from "../../../../../../shared/api/mutations/salesChannels";
import { Toast } from "../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../apollo-client";
import {Icon} from "../../../../../../shared/components/atoms/icon";
import { useRoute } from "vue-router";
import { processGraphQLErrors } from "../../../../../../shared/utils";

const route = useRoute();
const props = defineProps<{ id: string; salesChannelId: string }>();
const type = ref(String(route.params.type));

const { t } = useI18n();

const statusBadgeMap = ref(getStatusBadgeMap(t));

const formatDate = (dateString) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
};

const isRetryEnabled = (importItem): boolean => {
  const createdDate = new Date(importItem.createdAt);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  console.log(['success', 'failed'].includes(importItem.status))
  return ['success', 'failed'].includes(importItem.status) && createdDate >= oneWeekAgo;
};


const retryImport = async (importId: string) => {
  try {
    await apolloClient.mutate({
      mutation: updateSalesChannelImportMutation,
      variables: {
        data: {
          id: importId,
          status: "pending",
        },
      },
    });
    Toast.success(t("integrations.imports.retry.success"));
  } catch (e) {
    Toast.error(t("integrations.imports.retry.error"));
    console.error("Retry failed:", e);
  }
};

const createImport = async () => {
  try {
    const { data } = await apolloClient.mutate({
      mutation: createSalesChannelImportMutation,
      variables: {
        data: {
          salesChannel: { id: props.salesChannelId },
          status: 'pending',
        },
      },
    });

    Toast.success(t("integrations.imports.create.success"));
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);
    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    }
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
          <template v-if="type === 'shopify'">
            <Button
              :disabled="(result as SalesChannelSubscriptionResult).salesChannel.isImporting"
              @click="createImport"
              type="button"
              class="btn btn-primary"
            >
              {{ t('integrations.imports.create.title') }}
            </Button>
          </template>
          <template v-else>
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
          </template>
        </div>
      </div>

      <div class="mt-2 h-full">
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
              v-for="importItem in (result as SalesChannelSubscriptionResult).salesChannel.saleschannelimportSet"
              :key="importItem.id"
              class="border-b dark:border-[#191e3a]"
            >
              <td class="p-2">{{ formatDate(importItem.createdAt) }}</td>
              <td class="p-2">
                <Badge
                  :color="statusBadgeMap[importItem.status]?.color"
                  :text="statusBadgeMap[importItem.status]?.text"
                />
              </td>
              <td class="p-2">
                <AssignProgressBar
                  :progress="importItem.percentage"
                  :is-error="importItem.status === 'failed'"
                />
              </td>
              <td class="p-2 text-right">
              <Button
                :disabled="!isRetryEnabled(importItem)"
                @click="retryImport(importItem.id)"
              >
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