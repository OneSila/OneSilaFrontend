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
import { amazonProductIssueShowQuery } from "../../../../../../../shared/api/queries/amazonProductIssues.js";
import { Toast } from "../../../../../../../shared/modules/toast";

type IssueNode = {
  id: string;
  code?: string | null;
  message?: string | null;
  severity?: string | null;
  categories?: string[] | null;
  enforcementActions?: string[] | null;
  enforcementExemptionStatus?: string | null;
  enforcementExemptionExpiryDate?: string | null;
  enforcementAttributeNames?: string[] | null;
  isSuppressed?: boolean | null;
  isValidationIssue?: boolean | null;
  rawData?: any;
  view?: { apiRegionCode?: string | null } | null;
  remoteProduct?: { localInstance?: { id: string; name?: string | null } | null } | null;
};

const { t } = useI18n();
const route = useRoute();

const issueId = ref(String(route.params.issueId));
const type = ref(String(route.params.type));
const integrationId = computed(() => (typeof route.query.integrationId === 'string' ? route.query.integrationId : null));

const loading = ref(false);
const issue = ref<IssueNode | null>(null);

const product = computed(() => issue.value?.remoteProduct?.localInstance ?? null);
const marketplace = computed(() => issue.value?.view?.apiRegionCode ?? null);

const jsonRawData = computed(() => {
  try {
    return JSON.stringify(issue.value?.rawData ?? {}, null, 2);
  } catch (e) {
    return String(issue.value?.rawData ?? '');
  }
});

const enforcementExemptionExpiryDateLabel = computed(() => {
  const value = issue.value?.enforcementExemptionExpiryDate;
  if (!value) {
    return '-';
  }
  return new Date(value).toLocaleString();
});

const exemptionBadge = computed(() => {
  const status = issue.value?.enforcementExemptionStatus;
  if (!status) {
    return null;
  }
  if (status === 'EXEMPT') {
    return { text: t('integrations.show.amazonIssues.enforcementExemptionStatus.EXEMPT'), color: 'green' };
  }
  if (status === 'EXEMPT_UNTIL_EXPIRY_DATE') {
    return { text: t('integrations.show.amazonIssues.enforcementExemptionStatus.EXEMPT_UNTIL_EXPIRY_DATE'), color: 'yellow' };
  }
  if (status === 'NOT_EXEMPT') {
    return { text: t('integrations.show.amazonIssues.enforcementExemptionStatus.NOT_EXEMPT'), color: 'gray' };
  }
  return { text: status, color: 'gray' };
});

const categories = computed(() => issue.value?.categories ?? []);
const enforcementActions = computed(() => issue.value?.enforcementActions ?? []);
const enforcementAttributeNames = computed(() => issue.value?.enforcementAttributeNames ?? []);

const categoryLabel = (value: string) => {
  const key = `integrations.show.amazonIssues.categories.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
};

const enforcementActionLabel = (value: string) => {
  const key = `integrations.show.amazonIssues.enforcementActions.${value}`;
  const translated = t(key);
  return translated === key ? value : translated;
};

async function copyToClipboard(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (e) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
}

const fetchIssue = async () => {
  loading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: amazonProductIssueShowQuery,
      variables: { id: issueId.value },
      fetchPolicy: 'network-only',
    });
    issue.value = data?.amazonProductIssues?.edges?.[0]?.node ?? null;
  } catch (e) {
    console.error(e);
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
          { name: t('integrations.show.amazonIssues.show.breadcrumb') },
        ]"
      />
    </template>

    <template v-slot:content>
      <Card>
        <Loader :loading="loading" />

        <div v-if="issue" class="overflow-hidden">
          <div class="px-4 py-6 sm:px-6">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h3 class="text-xl font-semibold leading-7 text-gray-900">
                  {{ t('integrations.show.amazonIssues.show.title') }}
                </h3>
                <div class="mt-2 text-sm text-gray-600">
                  <span>{{ t('integrations.show.amazonIssues.show.amazonDocsPrefix') }}</span>
                  <Link external :path="'https://sellercentral.amazon.com/help/hub/reference/external/G17781'">
                    <span class="ml-1 text-primary hover:underline">{{ t('integrations.show.amazonIssues.show.amazonDocsLink') }}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-gray-100">
            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.columns.product') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <Link v-if="product?.id" :path="{ name: 'products.products.show', params: { id: product.id } }" target="_blank">
                  <span class="break-words">{{ product?.name || '-' }}</span>
                </Link>
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.columns.marketplace') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ marketplace || '-' }}
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.code') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div class="relative">
                  <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{{ issue.code || '-' }}</pre>
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
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.message') }}</dt>
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
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.severity') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div
                  class="capitalize flex items-center gap-1"
                  :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }"
                >
                  <Icon :name="issue.severity === 'ERROR' ? 'circle-xmark' : 'circle-exclamation'" class="w-4 h-4" />
                  {{ issue.severity || '-' }}
                </div>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.categories') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div v-if="categories.length" class="flex flex-wrap gap-2">
                  <Badge v-for="c in categories" :key="c" :text="categoryLabel(c)" color="blue" />
                </div>
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.enforcementActions') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div v-if="enforcementActions.length" class="flex flex-wrap gap-2">
                  <Badge v-for="a in enforcementActions" :key="a" :text="enforcementActionLabel(a)" color="purple" />
                </div>
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.enforcementExemptionStatus') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <Badge v-if="exemptionBadge" :text="exemptionBadge.text" :color="exemptionBadge.color" />
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.enforcementExemptionExpiryDate') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {{ enforcementExemptionExpiryDateLabel }}
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.enforcementAttributeNames') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <div v-if="enforcementAttributeNames.length" class="flex flex-wrap gap-2">
                  <Badge v-for="n in enforcementAttributeNames" :key="n" :text="n" color="gray" />
                </div>
                <span v-else>-</span>
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.isSuppressed') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <Icon v-if="issue.isSuppressed" name="check-circle" class="ml-2 text-green-500" />
                <Icon v-else name="times-circle" class="ml-2 text-red-500" />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.isValidationIssue') }}</dt>
              <dd class="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <Icon v-if="issue.isValidationIssue" name="check-circle" class="ml-2 text-green-500" />
                <Icon v-else name="times-circle" class="ml-2 text-red-500" />
              </dd>
            </div>

            <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt class="text-sm font-medium text-gray-900">{{ t('integrations.show.amazonIssues.show.fields.rawData') }}</dt>
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
          class="flex items-center justify-end gap-x-3 border-t border-gray-900/10 px-4 py-4 sm:px-8"
          v-if="integrationId"
        >
          <Link :path="{ name: 'integrations.integrations.show', params: { type, id: integrationId }, query: { tab: 'issues' } }">
            <CancelButton>{{ t('shared.button.back') }}</CancelButton>
          </Link>
        </div>
      </Card>
    </template>
  </GeneralTemplate>
</template>
