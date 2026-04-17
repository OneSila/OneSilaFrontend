<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../apollo-client';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../../shared/components/atoms/card';
import { Tabs } from '../../../../shared/components/molecules/tabs';
import { Link } from '../../../../shared/components/atoms/link';
import { Button } from '../../../../shared/components/atoms/button';
import { SecondaryButton } from '../../../../shared/components/atoms/button-secondary';
import { Icon } from '../../../../shared/components/atoms/icon';
import { Badge } from '../../../../shared/components/atoms/badge';
import { ApolloSubscription } from '../../../../shared/components/molecules/apollo-subscription';
import { ApolloAlertMutation } from '../../../../shared/components/molecules/apollo-alert-mutation';
import { ProgressBar } from '../../../../shared/components/molecules/progress-bar';
import { Loader } from '../../../../shared/components/atoms/loader';
import { companyLanguagesQuery } from '../../../../shared/api/queries/languages.js';
import { FieldBoolean } from '../../../../shared/components/organisms/general-show/containers/field-boolean';
import type { BooleanField } from '../../../../shared/components/organisms/general-show/showConfig';
import { FieldType } from '../../../../shared/utils/constants';
import { Toast } from '../../../../shared/modules/toast';
import { getLanguageLabel, getStatusBadgeMap } from '../../configs';
import { mappedImportSubscription } from '../../../../shared/api/subscriptions/importsExports.js';
import { deleteMappedImportMutation, resyncMappedImportMutation } from '../../../../shared/api/mutations/importsExports.js';
import ImportBrokenRecordsTab from '../../components/ImportBrokenRecordsTab.vue';

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const resyncing = ref(false);
const languageOptions = ref<Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>>([]);

const tabs = [
  { name: 'overview', label: t('importsExports.mappedImports.tabs.overview'), icon: 'circle-info', alwaysRender: true },
  { name: 'brokenRecords', label: t('importsExports.mappedImports.tabs.brokenRecords'), icon: 'triangle-exclamation', alwaysRender: true },
];

const booleanField: BooleanField = { name: 'value', type: FieldType.Boolean };
const statusBadgeMap = getStatusBadgeMap(t);

const getMappedImportNode = (result: any) => result?.mappedImport ?? null;
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

const resyncMappedImport = async () => {
  resyncing.value = true;

  try {
    await apolloClient.mutate({
      mutation: resyncMappedImportMutation,
      variables: { id: id.value },
      fetchPolicy: 'network-only',
    });
    Toast.success(t('importsExports.mappedImports.alerts.resyncSuccess'));
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.mappedImports.alerts.resyncError'));
  } finally {
    resyncing.value = false;
  }
};

onMounted(async () => {
  try {
    const { data } = await apolloClient.query({
      query: companyLanguagesQuery,
      fetchPolicy: 'cache-first',
    });
    languageOptions.value = data?.companyLanguages || [];
  } catch (_error) {
    languageOptions.value = [];
  }
});
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'importsExports.mappedImports.list' }, name: t('importsExports.mappedImports.title') },
          { path: { name: 'importsExports.mappedImports.show', params: { id } }, name: t('importsExports.mappedImports.show.title') },
        ]"
      />
    </template>

    <template #content>
      <ApolloSubscription :subscription="mappedImportSubscription" :variables="{ pk: id }">
        <template #default="{ loading, result }">
          <Loader :loading="loading" />

          <Card v-if="getMappedImportNode(result)" class="border border-slate-200 shadow-sm">
            <Tabs :tabs="tabs">
              <template #overview>
                <div class="p-4">
                  <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <ProgressBar
                      :progress="getMappedImportNode(result).percentage ?? 0"
                      :label="statusBadgeMap[getMappedImportNode(result).status]?.text || getMappedImportNode(result).status || ''"
                      :label-color="getProgressColor(getMappedImportNode(result).percentageColor).labelColor"
                      :bar-color="getProgressColor(getMappedImportNode(result).percentageColor).barColor"
                    />
                  </div>

                  <div class="mt-4 divide-y divide-gray-200">
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.name') }}</span>
                      <span>{{ getMappedImportNode(result).name || '-' }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.type') }}</span>
                      <span>{{ t(`importsExports.mappedImports.types.${getMappedImportNode(result).type}`) }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.status') }}</span>
                      <Badge
                        :color="statusBadgeMap[getMappedImportNode(result).status]?.color"
                        :text="statusBadgeMap[getMappedImportNode(result).status]?.text || getMappedImportNode(result).status"
                      />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.language') }}</span>
                      <span>{{ getLanguageLabel(languageOptions, getMappedImportNode(result).language) || '-' }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.createOnly') }}</span>
                      <FieldBoolean :field="booleanField" :model-value="Boolean(getMappedImportNode(result).createOnly)" />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.updateOnly') }}</span>
                      <FieldBoolean :field="booleanField" :model-value="Boolean(getMappedImportNode(result).updateOnly)" />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.overrideOnly') }}</span>
                      <FieldBoolean :field="booleanField" :model-value="Boolean(getMappedImportNode(result).overrideOnly)" />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.skipBrokenRecords') }}</span>
                      <FieldBoolean :field="booleanField" :model-value="Boolean(getMappedImportNode(result).skipBrokenRecords)" />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.isPeriodic') }}</span>
                      <FieldBoolean :field="booleanField" :model-value="Boolean(getMappedImportNode(result).isPeriodic)" />
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.intervalHours') }}</span>
                      <span>{{ getMappedImportNode(result).intervalHours ?? '-' }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.totalRecords') }}</span>
                      <span>{{ getMappedImportNode(result).totalRecords ?? 0 }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.processedRecords') }}</span>
                      <span>{{ getMappedImportNode(result).processedRecords ?? 0 }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.lastRunAt') }}</span>
                      <span>{{ formatDate(getMappedImportNode(result).lastRunAt) }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.createdAt') }}</span>
                      <span>{{ formatDate(getMappedImportNode(result).createdAt) }}</span>
                    </div>
                    <div class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('shared.labels.updatedAt') }}</span>
                      <span>{{ formatDate(getMappedImportNode(result).updatedAt) }}</span>
                    </div>
                    <div v-if="getMappedImportNode(result).jsonFileUrl || getMappedImportNode(result).jsonFile?.url" class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.jsonFile') }}</span>
                      <Link external :path="getMappedImportNode(result).jsonFileUrl || getMappedImportNode(result).jsonFile?.url">
                        <Button type="button" class="btn btn-outline-primary">
                          <Icon name="download" class="mr-2" />
                          {{ t('importsExports.mappedImports.actions.downloadFile') }}
                        </Button>
                      </Link>
                    </div>
                    <div v-if="getMappedImportNode(result).jsonUrl" class="flex items-center py-3">
                      <span class="w-1/3 font-medium">{{ t('importsExports.fields.jsonUrl') }}</span>
                      <Link external :path="getMappedImportNode(result).jsonUrl">
                        <Button type="button" class="btn btn-outline-primary">
                          <Icon name="link" class="mr-2" />
                          {{ t('importsExports.mappedImports.actions.openUrl') }}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </template>

              <template #brokenRecords>
                <div class="p-4">
                  <ImportBrokenRecordsTab :import-process-id="getMappedImportNode(result).proxyId" />
                </div>
              </template>
            </Tabs>

            <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <Link :path="{ name: 'importsExports.mappedImports.list' }">
                <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-dark">
                  {{ t('shared.button.back') }}
                </Button>
              </Link>
              <Link :path="{ name: 'importsExports.mappedImports.edit', params: { id } }">
                <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info">
                  {{ t('shared.button.edit') }}
                </Button>
              </Link>
              <SecondaryButton :disabled="resyncing" @click="resyncMappedImport">
                {{ t('shared.button.resync') }}
              </SecondaryButton>
              <ApolloAlertMutation :mutation="deleteMappedImportMutation" :mutation-variables="{ id }">
                <template #default="{ loading: deleting, confirmAndMutate }">
                  <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-danger" :disabled="deleting" @click="confirmAndMutate">
                    {{ t('shared.button.delete') }}
                  </Button>
                </template>
              </ApolloAlertMutation>
            </div>
          </Card>
        </template>
      </ApolloSubscription>
    </template>
  </GeneralTemplate>
</template>
