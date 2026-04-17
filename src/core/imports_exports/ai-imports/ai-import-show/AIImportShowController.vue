<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../../shared/components/atoms/card';
import { Tabs } from '../../../../shared/components/molecules/tabs';
import { Link } from '../../../../shared/components/atoms/link';
import { Button } from '../../../../shared/components/atoms/button';
import { Badge } from '../../../../shared/components/atoms/badge';
import { Loader } from '../../../../shared/components/atoms/loader';
import { ProgressBar } from '../../../../shared/components/molecules/progress-bar';
import ImportBrokenRecordsTab from '../../components/ImportBrokenRecordsTab.vue';
import StructuredDataSection from '../../components/StructuredDataSection.vue';
import { getMcpToolLabel, getStatusBadgeMap } from '../../configs';
import { mcpToolRunQuery } from '../../../../shared/api/queries/mcpToolRuns.js';

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));

const tabs = computed(() => [
  { name: 'overview', label: t('importsExports.aiImports.tabs.overview'), icon: 'circle-info', alwaysRender: true },
  { name: 'brokenRecords', label: t('importsExports.aiImports.tabs.brokenRecords'), icon: 'triangle-exclamation', alwaysRender: true },
]);

const statusBadgeMap = getStatusBadgeMap(t);

const getProgressColor = (percentageColor?: string | null) => {
  switch (String(percentageColor || '').toUpperCase()) {
    case 'RED':
      return { labelColor: 'text-red-600', barColor: 'bg-red-500' };
    case 'GREEN':
      return { labelColor: 'text-green-600', barColor: 'bg-green-500' };
    default:
      return { labelColor: 'text-orange-500', barColor: 'bg-orange-400' };
  }
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
};

const getAssignedViews = (node: any) => node?.assignedViews?.filter(Boolean) || [];
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'importsExports.aiImports.list' }, name: t('importsExports.aiImports.title') },
          { path: { name: 'importsExports.aiImports.show', params: { id } }, name: t('importsExports.aiImports.show.title') },
        ]"
      />
    </template>

    <template #content>
      <ApolloQuery :query="mcpToolRunQuery" :variables="{ id }" fetch-policy="cache-and-network">
        <template v-slot="{ result: { loading, data } }">
          <Loader :loading="loading" />

          <Card v-if="data?.mcpToolRun" class="border border-slate-200 shadow-sm">
            <Tabs :tabs="tabs">
              <template #overview>
                <div class="p-4">
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <ProgressBar
                      :progress="data.mcpToolRun.percentage ?? 0"
                      :label="statusBadgeMap[data.mcpToolRun.status]?.text || data.mcpToolRun.status || ''"
                      :label-color="getProgressColor(data.mcpToolRun.percentageColor).labelColor"
                      :bar-color="getProgressColor(data.mcpToolRun.percentageColor).barColor"
                    />
                  </div>

                  <div class="mt-4 divide-y divide-gray-200">
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.name') }}</span>
                      <span>{{ data.mcpToolRun.name || '-' }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.aiImports.fields.tool') }}</span>
                      <Badge
                        color="indigo"
                        :text="getMcpToolLabel(t, data.mcpToolRun.tool, data.mcpToolRun.toolName)"
                      />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.aiImports.fields.toolName') }}</span>
                      <span>{{ data.mcpToolRun.toolName || '-' }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.status') }}</span>
                      <Badge
                        :color="statusBadgeMap[data.mcpToolRun.status]?.color"
                        :text="statusBadgeMap[data.mcpToolRun.status]?.text || data.mcpToolRun.status"
                      />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.totalRecords') }}</span>
                      <span>{{ data.mcpToolRun.totalRecords ?? 0 }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.processedRecords') }}</span>
                      <span>{{ data.mcpToolRun.processedRecords ?? 0 }}</span>
                    </div>
                    <div class="items-start py-3 sm:flex">
                      <span class="w-1/3 pt-1 font-medium">{{ t('importsExports.aiImports.fields.assignedViews') }}</span>
                      <div class="mt-2 flex flex-wrap gap-2 sm:mt-0">
                        <template v-if="getAssignedViews(data.mcpToolRun).length">
                          <template v-for="view in getAssignedViews(data.mcpToolRun)" :key="view.id">
                            <Link v-if="view.url" external :path="view.url">
                              <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                {{ view.name || view.id }}
                              </span>
                            </Link>
                            <span v-else class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                              {{ view.name || view.id }}
                            </span>
                          </template>
                        </template>
                        <span v-else class="text-sm text-slate-500">
                          {{ t('importsExports.aiImports.empty.assignedViews') }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.createdAt') }}</span>
                      <span>{{ formatDate(data.mcpToolRun.createdAt) }}</span>
                    </div>
                    <div v-if="data.mcpToolRun.errorTraceback" class="py-3">
                      <span class="block font-medium">{{ t('importsExports.fields.errorTraceback') }}</span>
                      <pre class="mt-2 whitespace-pre-wrap rounded-md bg-red-50 p-3 text-xs text-red-900">{{ data.mcpToolRun.errorTraceback }}</pre>
                    </div>
                    <StructuredDataSection
                      :title="t('importsExports.aiImports.sections.payloadContent')"
                      :value="data.mcpToolRun.payloadContent"
                      :start-expanded="true"
                    />
                    <StructuredDataSection
                      :title="t('importsExports.aiImports.sections.responseContent')"
                      :value="data.mcpToolRun.responseContent"
                      :start-expanded="true"
                    />
                  </div>
                </div>
              </template>

              <template #brokenRecords>
                <div class="p-4">
                  <ImportBrokenRecordsTab :import-process-id="data.mcpToolRun.proxyId || data.mcpToolRun.id" />
                </div>
              </template>
            </Tabs>

            <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <Link :path="{ name: 'importsExports.aiImports.list' }">
                <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-dark">
                  {{ t('shared.button.back') }}
                </Button>
              </Link>
            </div>
          </Card>
        </template>
      </ApolloQuery>
    </template>
  </GeneralTemplate>
</template>
