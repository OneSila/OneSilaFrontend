<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../../../../shared/components/molecules/breadcrumbs";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { Link } from "../../../../../../../shared/components/atoms/link";
import { Loader } from "../../../../../../../shared/components/atoms/loader";
import { Badge } from "../../../../../../../shared/components/atoms/badge";
import { CancelButton } from "../../../../../../../shared/components/atoms/button-cancel";
import apolloClient from "../../../../../../../../apollo-client";
import { miraklProductIssueShowQuery } from "../../../../../../../shared/api/queries/miraklProductIssues.js";
import { Toast } from "../../../../../../../shared/modules/toast";

type MiraklIssueNode = {
  id: string;
  mainCode?: string | null;
  code?: string | null;
  message?: string | null;
  severity?: string | null;
  reasonLabel?: string | null;
  attributeCode?: string | null;
  isRejected?: boolean | null;
  rawData?: any;
  views?: { id: string; remoteId?: string | null; name?: string | null }[] | null;
  remoteProduct?: {
    id: string;
    remoteSku?: string | null;
    localInstance?: { id: string; name?: string | null; sku?: string | null } | null;
  } | null;
};

const { t } = useI18n();
const route = useRoute();

const issueId = ref(String(route.params.issueId));
const type = ref(String(route.params.type));
const integrationId = computed(() => (typeof route.query.integrationId === 'string' ? route.query.integrationId : null));

const loading = ref(false);
const issue = ref<MiraklIssueNode | null>(null);

const product = computed(() => issue.value?.remoteProduct?.localInstance ?? null);
const remoteSku = computed(() => issue.value?.remoteProduct?.remoteSku ?? null);
const views = computed(() => issue.value?.views ?? []);

const severityBadge = computed(() => {
  if (issue.value?.severity === 'ERROR') {
    return { text: t('integrations.show.miraklIssues.severity.error'), color: 'red' };
  }
  if (issue.value?.severity === 'WARNING') {
    return { text: t('integrations.show.miraklIssues.severity.warning'), color: 'yellow' };
  }
  if (issue.value?.severity === 'INFO') {
    return { text: t('integrations.show.miraklIssues.severity.info'), color: 'blue' };
  }
  return issue.value?.severity ? { text: issue.value.severity, color: 'gray' } : null;
});

const jsonRawData = computed(() => {
  try {
    return JSON.stringify(issue.value?.rawData ?? {}, null, 2);
  } catch (_error) {
    return String(issue.value?.rawData ?? '');
  }
});

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
}

const fetchIssue = async () => {
  loading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: miraklProductIssueShowQuery,
      variables: { id: issueId.value },
      fetchPolicy: 'network-only',
    });
    issue.value = data?.miraklProductIssue ?? null;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchIssue);
</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: integrationId ? { name: 'integrations.integrations.show', params: { type, id: integrationId }, query: { tab: 'issues' } } : undefined, name: t('integrations.show.tabs.issues') },
          { name: t('integrations.show.miraklIssues.show.breadcrumb') },
        ]"
      />
    </template>

    <template v-slot:content>
      <Card>
        <Loader :loading="loading" />

        <div v-if="issue" class="overflow-hidden">
          <div class="px-4 py-6 sm:px-6">
            <h3 class="text-xl font-semibold leading-7 text-gray-900">
              {{ t('integrations.show.miraklIssues.show.title') }}
            </h3>
          </div>

          <div class="border-t border-gray-100">
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.columns.product') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div class="flex flex-col gap-1">
                  <Link v-if="product?.id" :path="{ name: 'products.products.show', params: { id: product.id } }" target="_blank">
                    <span class="break-words">{{ product?.name || product?.sku || '-' }}</span>
                  </Link>
                  <span v-else>{{ remoteSku || '-' }}</span>
                  <span v-if="remoteSku" class="text-xs text-gray-500">
                    {{ t('integrations.show.miraklIssues.show.fields.remoteSku') }}: {{ remoteSku }}
                  </span>
                </div>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.columns.views') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div v-if="views.length" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="view in views"
                    :key="view.id"
                    :text="view.name || view.remoteId || view.id"
                    color="gray"
                  />
                </div>
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.mainCode') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">{{ issue.mainCode || '-' }}</pre>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.code') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div class="relative">
                  <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">{{ issue.code || '-' }}</pre>
                  <button
                    v-if="issue.code"
                    class="absolute top-2 right-2"
                    :title="t('shared.button.copy')"
                    @click="copyToClipboard(issue.code)"
                  >
                    <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </button>
                </div>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.message') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div class="relative">
                  <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">{{ issue.message || '-' }}</pre>
                  <button
                    v-if="issue.message"
                    class="absolute top-2 right-2"
                    :title="t('shared.button.copy')"
                    @click="copyToClipboard(issue.message)"
                  >
                    <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </button>
                </div>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.severity') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <Badge v-if="severityBadge" :text="severityBadge.text" :color="severityBadge.color" />
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.isRejected') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <Icon v-if="issue.isRejected" name="check-circle" class="ml-2 text-green-500" />
                  <Icon v-else name="times-circle" class="ml-2 text-red-500" />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.reasonLabel') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ issue.reasonLabel || '-' }}
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.attributeCode') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ issue.attributeCode || '-' }}
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.miraklIssues.show.fields.rawData') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div class="relative">
                  <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ jsonRawData }}</pre>
                  <button class="absolute top-2 right-2" :title="t('shared.button.copy')" @click="copyToClipboard(jsonRawData)">
                    <Icon name="clipboard" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                  </button>
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div
          v-if="integrationId"
          class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8"
        >
          <Link :path="{ name: 'integrations.integrations.show', params: { type, id: integrationId }, query: { tab: 'issues' } }">
            <CancelButton>{{ t('shared.button.back') }}</CancelButton>
          </Link>
        </div>
      </Card>
    </template>
  </GeneralTemplate>
</template>
