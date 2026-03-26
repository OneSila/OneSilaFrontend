<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from '../../../../../../../../shared/templates/GeneralTemplate.vue';
import { Card } from '../../../../../../../../shared/components/atoms/card';
import { DiscreteLoader } from '../../../../../../../../shared/components/atoms/discrete-loader';
import { Badge } from '../../../../../../../../shared/components/atoms/badge';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Breadcrumbs } from '../../../../../../../../shared/components/molecules/breadcrumbs';
import { getMiraklImportProcessQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { getStatusBadgeMap } from '../../configs';
import apolloClient from '../../../../../../../../../apollo-client';

const route = useRoute();
const { t } = useI18n();

const id = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = ref('');
const loading = ref(false);
const result = ref<any>(null);

const statusBadgeMap = getStatusBadgeMap(t);

const miraklImport = computed(() => result.value?.miraklImportProcess ?? null);

const miraklExportFiles = computed(() =>
  (miraklImport.value?.exportFiles || []).map((node: any) => {
    return {
      id: node.id,
      name: node.file?.name || '-',
      url: node.fileUrl || node.file?.url || null,
    };
  }),
);

const fetchImport = async () => {
  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: getMiraklImportProcessQuery,
      variables: { id: id.value },
      fetchPolicy: 'network-only',
    });

    result.value = data;
    integrationId.value = data?.miraklImportProcess?.salesChannel?.id || '';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void fetchImport();
});

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
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        v-if="integrationId"
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show', params: { id: integrationId, type }, query: { tab: 'imports' } }, name: t('integrations.show.title') },
          { name: t('integrations.imports.show.title') }
        ]"
      />
    </template>

    <template #content>
      <Card>
        <div v-if="!loading && miraklImport" class="p-4">
          <div class="divide-y divide-gray-200">
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('shared.labels.createdAt') }}</span>
              <span>{{ formatDate(miraklImport.createdAt) }}</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('shared.labels.type') }}</span>
              <span>{{ t(`integrations.imports.types.${miraklImport.type}`) }}</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('shared.labels.status') }}</span>
              <Badge :color="statusBadgeMap[miraklImport.status]?.color" :text="statusBadgeMap[miraklImport.status]?.text" />
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('shared.labels.progress') }}</span>
              <span>{{ miraklImport.percentage }}%</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.createOnly') }}</span>
              <span>{{ miraklImport.createOnly ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.updateOnly') }}</span>
              <span>{{ miraklImport.updateOnly ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.skipBrokenRecords') }}</span>
              <span>{{ miraklImport.skipBrokenRecords ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.totalRecords') }}</span>
              <span>{{ miraklImport.totalRecords }}</span>
            </div>
            <div class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.processedRecords') }}</span>
              <span>{{ miraklImport.processedRecords }}</span>
            </div>
            <div v-if="miraklImport.errorTraceback" class="flex items-center py-2">
              <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.errorTraceback') }}</span>
              <span class="whitespace-pre-wrap">{{ miraklImport.errorTraceback }}</span>
            </div>
          </div>

          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 class="text-lg font-semibold text-slate-900">{{ t('integrations.imports.mirakl.uploadedFilesTitle') }}</h3>
                <p class="mt-1 text-sm text-slate-500">{{ t('integrations.imports.mirakl.uploadedFilesDescription') }}</p>
              </div>
              <Badge :text="String(miraklExportFiles.length)" color="blue" />
            </div>

            <div v-if="miraklExportFiles.length" class="mt-4 space-y-3">
              <div
                v-for="file in miraklExportFiles"
                :key="file.id"
                class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium text-slate-900">{{ file.name }}</div>
                  <div class="mt-1 truncate text-xs text-slate-500">{{ file.url || '-' }}</div>
                </div>
                <div>
                  <Link v-if="file.url" external :path="file.url">
                    <Button class="btn btn-outline-primary">
                      <Icon name="download" class="mr-2 h-4 w-4" />
                      {{ t('shared.button.download') }}
                    </Button>
                  </Link>
                  <Button v-else class="btn btn-outline-dark" disabled>
                    {{ t('integrations.imports.mirakl.uploadedFilesUnavailable') }}
                  </Button>
                </div>
              </div>
            </div>

            <div
              v-else
              class="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500"
            >
              {{ t('integrations.imports.mirakl.uploadedFilesEmpty') }}
            </div>
          </div>
        </div>

        <DiscreteLoader v-else :loading="true" />
      </Card>
    </template>
  </GeneralTemplate>
</template>
