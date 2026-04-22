<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import { useI18n } from "vue-i18n";
import { Card } from "../../../../../../../../../shared/components/atoms/card";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Modal } from "../../../../../../../../../shared/components/atoms/modal";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";
import { Badge } from "../../../../../../../../../shared/components/atoms/badge";
import apolloClient from "../../../../../../../../../../apollo-client";
import { remoteLogsQuery, amazonRemoteLogsQuery } from "../../../../../../../../../shared/api/queries/salesChannels.js";
import { displayApolloError } from "../../../../../../../../../shared/utils";

export interface RemoteLog {
  id: string;
  frontendName: string;
  type: string;
  action: string;
  status: string;
  createdAt: string;
  frontendError: string;
  submissionId?: string | null;
  processingStatus?: string | null;
  formattedIssues?: { message?: string | null; severity?: string | null }[];
}

export interface RemoteLogEdge {
  node: RemoteLog;
  cursor: string;
}

const props = defineProps<{ modelValue: boolean; id?: string | null; integrationType?: string }>();
const emit = defineEmits(['modal-closed']);
const localShowModal = ref(props.modelValue);
const loading = ref(false);
const logs: Ref<RemoteLogEdge[]> = ref([]);

const ActionTypes = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
};

const StatusTypes = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
};
const { t } = useI18n();

const fetchLogs = async () => {
  if (props.id == null || props.id == undefined) {
    logs.value = [];
    return;
  }

  loading.value = true;
  logs.value = [];

  try {
    const query = props.integrationType === 'amazon' ? amazonRemoteLogsQuery : remoteLogsQuery;
    const { data } = await apolloClient.query({
      query,
      variables: { filter: { remoteProduct: { id: { exact: props.id } } } },
      fetchPolicy: 'cache-first'
    });

    const logsData = props.integrationType === 'amazon' ? data?.amazonRemoteLogs : data?.remoteLogs;
    logs.value = logsData?.edges ?? [];
  } catch (error) {
    displayApolloError(error);
    logs.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
  if (newVal) {
    fetchLogs();
  } else {
    logs.value = [];
  }
});

const closeModal = () => {
  localShowModal.value = false;
  emit('modal-closed');
};

const formatDate = (dateString: string) => {
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

const actionBadge = {
  [ActionTypes.CREATE]: { text: t('shared.button.create'), color: 'green' },
  [ActionTypes.UPDATE]: { text: t('shared.button.update'), color: 'blue' },
  [ActionTypes.DELETE]: { text: t('shared.button.delete'), color: 'red' },
};

const statusBadge = {
  [StatusTypes.SUCCESS]: { text: t('shared.labels.completed'), color: 'green' },
  [StatusTypes.FAILED]: { text: t('shared.labels.failed'), color: 'red' },
};

const typeLabels = {
  mirakl_product_feed: t('integrations.salesChannel.modal.logs.types.miraklProductFeed'),
};

const getActionBadge = (action?: string | null) => {
  if (!action) {
    return { text: '-', color: 'gray' };
  }

  return actionBadge[action] ?? { text: action, color: 'gray' };
};

const getStatusBadge = (status?: string | null) => {
  if (!status) {
    return { text: '-', color: 'gray' };
  }

  return statusBadge[status] ?? { text: status, color: 'gray' };
};

const getTypeLabel = (type?: string | null) => {
  if (!type) {
    return '-';
  }

  return typeLabels[type] ?? type;
};

const getTypeBadge = (type?: string | null) => ({
  text: getTypeLabel(type),
  color: 'gray',
});

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Loader :loading="loading"/>
      <Card class="modal-content w-[90%]">
        <div class="mb-6">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">{{
              t('integrations.salesChannel.modal.logs.title')
            }}</h3>
        </div>
        <div class="mb=4 overflow-y-auto max-h-96" :class="logs.length > 0 ? 'table-responsive custom-table-scroll' : ''">
          <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
            <thead>
            <tr>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.name') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.action') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.type') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.status') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.createdAt') }}
              </th>
              <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.error') }}
              </th>
              <th v-if="props.integrationType === 'amazon'" scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.submissionId') }}
              </th>
              <th v-if="props.integrationType === 'amazon'" scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.processingStatus') }}
              </th>
              <th v-if="props.integrationType === 'amazon'" scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                {{ t('shared.labels.issues') }}
              </th>

            </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="log in logs" :key="log.node.id">
                <td>{{ log.node.frontendName }}</td>
                <td>
                  <Badge :color="getActionBadge(log.node.action).color" :text="getActionBadge(log.node.action).text"/>
                </td>
                <td>
                  <Badge :color="getTypeBadge(log.node.type).color" :text="getTypeBadge(log.node.type).text"/>
                </td>
                <td>
                  <Badge :color="getStatusBadge(log.node.status).color" :text="getStatusBadge(log.node.status).text"/>
                </td>
                <td>{{ formatDate(log.node.createdAt) }}</td>
                <td>
                  <div class="whitespace-pre-wrap break-words">
                    {{ log.node.frontendError }}
                  </div>
                </td>
                <td v-if="props.integrationType === 'amazon'">{{ log.node.submissionId }}</td>
                <td v-if="props.integrationType === 'amazon'">{{ log.node.processingStatus }}</td>
                <td v-if="props.integrationType === 'amazon'">
                  <ul v-if="log.node.formattedIssues && log.node.formattedIssues.length" class="list-disc ml-4">
                    <li v-for="(issue, index) in log.node.formattedIssues" :key="index">
                      {{ issue.message }}
                    </li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr/>
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>
