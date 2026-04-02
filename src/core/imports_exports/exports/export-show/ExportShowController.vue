<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../apollo-client';
import GeneralTemplate from '../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../shared/components/molecules/breadcrumbs';
import { Card } from '../../../../shared/components/atoms/card';
import { Link } from '../../../../shared/components/atoms/link';
import { Button } from '../../../../shared/components/atoms/button';
import { SecondaryButton } from '../../../../shared/components/atoms/button-secondary';
import { Badge } from '../../../../shared/components/atoms/badge';
import { Loader } from '../../../../shared/components/atoms/loader';
import { FieldBoolean } from '../../../../shared/components/organisms/general-show/containers/field-boolean';
import type { BooleanField } from '../../../../shared/components/organisms/general-show/showConfig';
import { FieldType } from '../../../../shared/utils/constants';
import { ProgressBar } from '../../../../shared/components/molecules/progress-bar';
import { ApolloSubscription } from '../../../../shared/components/molecules/apollo-subscription';
import { ApolloAlertMutation } from '../../../../shared/components/molecules/apollo-alert-mutation';
import { companyLanguagesQuery } from '../../../../shared/api/queries/languages.js';
import { Toast } from '../../../../shared/modules/toast';
import { getLanguageLabel, getStatusBadgeMap } from '../../configs';
import { exportSubscription } from '../../../../shared/api/subscriptions/importsExports.js';
import { deleteExportMutation, resyncExportMutation } from '../../../../shared/api/mutations/importsExports.js';

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const resyncing = ref(false);
const languageOptions = ref<Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>>([]);

const booleanField: BooleanField = { name: 'value', type: FieldType.Boolean };
const statusBadgeMap = getStatusBadgeMap(t);

const getExportNode = (result: any) => result?.['export'] ?? null;
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

const humanize = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const resyncExport = async () => {
  resyncing.value = true;

  try {
    await apolloClient.mutate({
      mutation: resyncExportMutation,
      variables: { id: id.value },
      fetchPolicy: 'network-only',
    });
    Toast.success(t('importsExports.exports.alerts.resyncSuccess'));
  } catch (error) {
    console.error(error);
    Toast.error(t('importsExports.exports.alerts.resyncError'));
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
          { path: { name: 'importsExports.exports.list' }, name: t('importsExports.exports.title') },
          { path: { name: 'importsExports.exports.show', params: { id } }, name: t('importsExports.exports.show.title') },
        ]"
      />
    </template>

    <template #content>
      <ApolloSubscription :subscription="exportSubscription" :variables="{ pk: id }">
        <template #default="{ loading, result }">
          <Loader :loading="loading" />

          <Card v-if="getExportNode(result)" class="border border-slate-200 shadow-sm">
            <div class="p-4">
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ProgressBar
                  :progress="getExportNode(result).percentage ?? 0"
                  :label="statusBadgeMap[getExportNode(result).status]?.text || getExportNode(result).status || ''"
                  :label-color="getProgressColor(getExportNode(result).percentageColor).labelColor"
                  :bar-color="getProgressColor(getExportNode(result).percentageColor).barColor"
                />
              </div>

              <div class="mt-4 divide-y divide-gray-200">
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.name') }}</span>
                  <span>{{ getExportNode(result).name || '-' }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('importsExports.fields.kind') }}</span>
                  <span>{{ t(`importsExports.exports.kinds.${getExportNode(result).kind}`) }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.type') }}</span>
                  <span>{{ t(`importsExports.exports.types.${getExportNode(result).type}`) }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.status') }}</span>
                  <Badge
                    :color="statusBadgeMap[getExportNode(result).status]?.color"
                    :text="statusBadgeMap[getExportNode(result).status]?.text || getExportNode(result).status"
                  />
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.language') }}</span>
                  <span>{{ getLanguageLabel(languageOptions, getExportNode(result).language) || '-' }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('importsExports.fields.isPeriodic') }}</span>
                  <FieldBoolean :field="booleanField" :model-value="Boolean(getExportNode(result).isPeriodic)" />
                </div>
                <div v-if="getExportNode(result).type === 'json_feed'" class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('importsExports.fields.intervalHours') }}</span>
                  <span>{{ getExportNode(result).intervalHours ?? '-' }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('importsExports.fields.totalRecords') }}</span>
                  <span>{{ getExportNode(result).totalRecords ?? 0 }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('importsExports.fields.lastRunAt') }}</span>
                  <span>{{ formatDate(getExportNode(result).lastRunAt) }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.createdAt') }}</span>
                  <span>{{ formatDate(getExportNode(result).createdAt) }}</span>
                </div>
                <div class="flex items-center py-3">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.updatedAt') }}</span>
                  <span>{{ formatDate(getExportNode(result).updatedAt) }}</span>
                </div>

                <div v-if="getExportNode(result).type === 'json_feed' && (getExportNode(result).feedKey || getExportNode(result).feedUrl)" class="py-3">
                  <span class="block font-medium">{{ t('importsExports.exports.sections.outputs') }}</span>
                  <div class="mt-2 space-y-2">
                    <div v-if="getExportNode(result).feedKey" class="flex items-center gap-2 text-sm">
                      <span class="font-medium">{{ t('importsExports.fields.feedKey') }}:</span>
                      <span>{{ getExportNode(result).feedKey }}</span>
                    </div>
                    <div class="flex flex-wrap gap-3">
                      <Link v-if="getExportNode(result).feedUrl" external :path="getExportNode(result).feedUrl">
                        <Button type="button" class="btn btn-outline-primary">
                          {{ t('importsExports.exports.actions.openFeed') }}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                <div v-if="getExportNode(result).fileUrl || getExportNode(result).file?.url" class="py-3">
                  <span class="block font-medium">{{ t('importsExports.exports.sections.generatedFile') }}</span>
                  <div class="mt-2">
                    <Link external :path="getExportNode(result).fileUrl || getExportNode(result).file?.url">
                      <Button type="button" class="btn btn-outline-primary">
                        {{ t('importsExports.exports.actions.downloadFile') }}
                      </Button>
                    </Link>
                  </div>
                </div>

                <div class="py-3">
                  <span class="block font-medium">{{ t('importsExports.fields.columns') }}</span>
                  <ul class="mt-2 flex flex-wrap gap-2">
                    <li
                      v-for="column in (getExportNode(result).columns?.length ? getExportNode(result).columns : ['*'])"
                      :key="column"
                      class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {{ column === '*' ? t('importsExports.exports.columnsBuilder.allSelectedNotice') : humanize(column) }}
                    </li>
                  </ul>
                </div>

                <div v-if="getExportNode(result).errorTraceback" class="py-3">
                  <span class="block font-medium">{{ t('importsExports.fields.errorTraceback') }}</span>
                  <pre class="mt-2 whitespace-pre-wrap rounded-md bg-red-50 p-3 text-xs text-red-900">{{ getExportNode(result).errorTraceback }}</pre>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8">
              <Link :path="{ name: 'importsExports.exports.list' }">
                <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-dark">
                  {{ t('shared.button.back') }}
                </Button>
              </Link>
              <Link :path="{ name: 'importsExports.exports.edit', params: { id } }">
                <Button type="button" class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info">
                  {{ t('shared.button.edit') }}
                </Button>
              </Link>
              <SecondaryButton :disabled="resyncing" @click="resyncExport">
                {{ t('shared.button.resync') }}
              </SecondaryButton>
              <ApolloAlertMutation :mutation="deleteExportMutation" :mutation-variables="{ id }">
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
