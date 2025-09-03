<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Selector } from '../../../../../../../../../shared/components/atoms/selector';
import { Badge } from '../../../../../../../../../shared/components/atoms/badge';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Card } from '../../../../../../../../../shared/components/atoms/card';
import { DiscreteLoader } from '../../../../../../../../../shared/components/atoms/discrete-loader';
import { Pagination } from '../../../../../../../../../shared/components/molecules/pagination';
import { Tabs } from '../../../../../../../../../shared/components/molecules/tabs';
import { Modal } from '../../../../../../../../../shared/components/atoms/modal';
import apolloClient from '../../../../../../../../../../apollo-client';
import { amazonImportBrokenRecordsQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';

const props = defineProps<{ importId: string }>();
const { t } = useI18n();

const codeFilter = ref<string | undefined>();
const records = ref<any[]>([]);
const pageInfo = ref({ endCursor: '', startCursor: '', hasNextPage: false, hasPreviousPage: false });
const loading = ref(false);
const showModal = ref(false);
const modalRecord = ref<any | null>(null);

const codeOptions = [
  { id: 'BROKEN_IMPORT_PROCESS', name: t('integrations.imports.brokenRecords.codes.BROKEN_IMPORT_PROCESS') },
  { id: 'MISSING_DATA', name: t('integrations.imports.brokenRecords.codes.MISSING_DATA') },
  { id: 'NO_MAPPED_PRODUCT_TYPE', name: t('integrations.imports.brokenRecords.codes.NO_MAPPED_PRODUCT_TYPE') },
  { id: 'PRODUCT_TYPE_MISMATCH', name: t('integrations.imports.brokenRecords.codes.PRODUCT_TYPE_MISMATCH') },
  { id: 'UPDATE_ONLY_NOT_FOUND', name: t('integrations.imports.brokenRecords.codes.UPDATE_ONLY_NOT_FOUND') },
];

const badgeMap = {
  BROKEN_IMPORT_PROCESS: { color: 'red', text: t('integrations.imports.brokenRecords.codes.BROKEN_IMPORT_PROCESS') },
  MISSING_DATA: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.MISSING_DATA') },
  NO_MAPPED_PRODUCT_TYPE: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.NO_MAPPED_PRODUCT_TYPE') },
  PRODUCT_TYPE_MISMATCH: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.PRODUCT_TYPE_MISMATCH') },
  UPDATE_ONLY_NOT_FOUND: { color: 'orange', text: t('integrations.imports.brokenRecords.codes.UPDATE_ONLY_NOT_FOUND') },
};

const limit = 10;

const fetchRecords = async (pagination: any = {}) => {
  loading.value = true;
  const variables: any = {
    first: pagination.before ? undefined : limit,
    last: pagination.before ? limit : undefined,
    after: pagination.after || undefined,
    before: pagination.before || undefined,
    filter: {
      importProcess: props.importId,
      excludeUnknownIssues: true,
      ...(codeFilter.value ? { code: codeFilter.value } : {}),
    },
  };
  const { data } = await apolloClient.query({
    query: amazonImportBrokenRecordsQuery,
    variables,
    fetchPolicy: 'network-only',
  });
  records.value = data.amazonImportBrokenRecords.edges.map((e: any) => e.node);
  pageInfo.value = data.amazonImportBrokenRecords.pageInfo;
  loading.value = false;
};

watch(codeFilter, () => fetchRecords());

onMounted(() => fetchRecords());

const openModal = (record: any) => {
  modalRecord.value = record;
  showModal.value = true;
};

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

const onPageChange = ({ query }) => {
  fetchRecords(query);
};
</script>

<template>
  <div>
    <div class="mb-4 w-72">
      <Selector
        v-model="codeFilter"
        :options="codeOptions"
        :label="t('shared.labels.code')"
        :clearable="true"
      />
    </div>
    <div v-if="!loading">
      <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
        <thead>
          <tr>
            <th class="p-2 text-left">{{ t('shared.labels.createdAt') }}</th>
            <th class="p-2 text-left">{{ t('shared.labels.code') }}</th>
            <th class="p-2 text-left">{{ t('shared.labels.message') }}</th>
            <th class="p-2 text-left">{{ t('shared.labels.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr v-for="record in records" :key="record.id" class="border-b">
            <td class="p-2">{{ formatDate(record.createdAt) }}</td>
            <td class="p-2">
              <Badge :color="badgeMap[record.record.code]?.color" :text="badgeMap[record.record.code]?.text || record.record.code" />
            </td>
            <td class="p-2">{{ record.record.message }}</td>
            <td class="p-2">
              <Button type="button" class="btn btn-primary" @click="openModal(record)">
                {{ t('shared.button.details') }}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="mt-4">
        <Pagination :page-info="pageInfo" :change-query-params="false" @query-changed="onPageChange" />
      </div>
    </div>
    <DiscreteLoader v-else :loading="true" />

    <Modal v-model="showModal" @closed="showModal = false">
      <Card>
        <Tabs :tabs="[
          { name: 'data', label: t('shared.labels.data'), alwaysRender: true },
          { name: 'context', label: t('shared.labels.context'), alwaysRender: true },
          ...(modalRecord?.record.error ? [{ name: 'error', label: t('shared.labels.error'), alwaysRender: true }] : []),
        ]">
          <template #data>
            <pre class="p-4 whitespace-pre-wrap">{{ JSON.stringify(modalRecord?.record.data, null, 2) }}</pre>
          </template>
          <template #context>
            <pre class="p-4 whitespace-pre-wrap">{{ JSON.stringify(modalRecord?.record.context, null, 2) }}</pre>
          </template>
          <template v-if="modalRecord?.record.error" #error>
            <pre class="p-4 whitespace-pre-wrap">{{ modalRecord?.record.error }}</pre>
          </template>
        </Tabs>
      </Card>
    </Modal>
  </div>
</template>
