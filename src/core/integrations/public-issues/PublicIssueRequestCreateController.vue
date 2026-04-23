<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import GeneralTemplate from "../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../shared/components/atoms/button";
import { Card } from "../../../shared/components/atoms/card";
import { Link } from "../../../shared/components/atoms/link";
import { Loader } from "../../../shared/components/atoms/loader";
import { GeneralForm } from "../../../shared/components/organisms/general-form";
import { publicIssueRequestFormConfigConstructor } from "./configs";
import { publicIntegrationTypesQuery } from "../../../shared/api/queries/publicIntegrationTypes.js";
import apolloClient from "../../../../apollo-client";
import { displayApolloError } from "../../../shared/utils";

const { t } = useI18n();
const route = useRoute();
const loadingIntegrationType = ref(false);
const publicIntegrationTypeId = ref('');

const valueFromQuery = (key: string) => {
  const value = route.query[key];
  return Array.isArray(value) ? value[0] || '' : String(value || '');
};

const defaults = computed(() => ({
  issue: valueFromQuery('issue') || valueFromQuery('search'),
  integrationType: valueFromQuery('integrationType'),
  publicIntegrationTypeId: publicIntegrationTypeId.value || valueFromQuery('publicIntegrationTypeId'),
  submissionId: valueFromQuery('submissionId'),
  productSku: valueFromQuery('productSku'),
  publicIssueId: valueFromQuery('publicIssueId'),
}));

const resolvePublicIntegrationTypeId = async () => {
  publicIntegrationTypeId.value = valueFromQuery('publicIntegrationTypeId');

  if (publicIntegrationTypeId.value || !defaults.value.integrationType) {
    return;
  }

  loadingIntegrationType.value = true;

  try {
    const { data } = await apolloClient.query({
      query: publicIntegrationTypesQuery,
      variables: {
        first: 1,
        filter: {
          key: { exact: defaults.value.integrationType },
        },
      },
      fetchPolicy: 'cache-first',
    });

    publicIntegrationTypeId.value = data?.publicIntegrationTypes?.edges?.[0]?.node?.id || '';
  } catch (error) {
    displayApolloError(error);
  } finally {
    loadingIntegrationType.value = false;
  }
};

const backToProductRoute = computed(() => {
  if (!route.query.productId) {
    return null;
  }

  return {
    name: 'products.products.show',
    params: { id: String(route.query.productId) },
    query: { tab: 'websites' },
  };
});

const submitUrl = computed(() => backToProductRoute.value || {
  name: 'integrations.publicIssues.list',
  query: route.query,
});

const formConfig = computed(() => publicIssueRequestFormConfigConstructor(t, defaults.value, submitUrl.value));

const canRenderForm = computed(() => Boolean(defaults.value.publicIntegrationTypeId));

onMounted(resolvePublicIntegrationTypeId);

watch(
  () => route.query.integrationType,
  () => {
    resolvePublicIntegrationTypeId();
  },
);
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.publicIssues.list', query: route.query }, name: t('publicIssues.title') },
          { path: { name: 'integrations.publicIssues.request.create', query: route.query }, name: t('publicIssues.request.title') },
        ]"
      />
    </template>

    <template #buttons>
      <Link v-if="backToProductRoute" :path="backToProductRoute">
        <Button type="button" class="btn btn-outline-dark">
          {{ t('publicIssues.actions.backToProduct') }}
        </Button>
      </Link>
    </template>

    <template #content>
      <Card>
        <Loader :loading="loadingIntegrationType" />
        <div class="mb-4">
          <h1 class="text-xl font-semibold text-slate-900">{{ t('publicIssues.request.title') }}</h1>
          <p class="mt-1 text-sm text-slate-500">{{ t('publicIssues.request.subtitle') }}</p>
        </div>

        <div
          v-if="!loadingIntegrationType && !canRenderForm"
          class="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-800"
        >
          {{ t('publicIssues.request.integrationTypeMissing') }}
        </div>

        <GeneralForm
          v-if="canRenderForm"
          :key="`${defaults.integrationType}-${defaults.publicIntegrationTypeId}`"
          :config="formConfig"
        >
          <template #before-fields>
            <div class="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <dl class="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt class="font-semibold text-slate-700">{{ t('publicIssues.labels.integrationType') }}</dt>
                  <dd class="mt-1 text-slate-600">{{ defaults.integrationType || '-' }}</dd>
                </div>
                <div>
                  <dt class="font-semibold text-slate-700">{{ t('shared.labels.sku') }}</dt>
                  <dd class="mt-1 text-slate-600">{{ defaults.productSku || '-' }}</dd>
                </div>
                <div v-if="defaults.submissionId">
                  <dt class="font-semibold text-slate-700">{{ t('shared.labels.submissionId') }}</dt>
                  <dd class="mt-1 text-slate-600">{{ defaults.submissionId }}</dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="font-semibold text-slate-700">{{ t('publicIssues.labels.issue') }}</dt>
                  <dd class="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded bg-white p-3 text-slate-600">
                    {{ defaults.issue || '-' }}
                  </dd>
                </div>
              </dl>
            </div>
          </template>

          <template #help-section>
            <div class="space-y-3 rounded-lg bg-blue-50 p-4 text-sm leading-6 text-blue-900">
              <p class="font-semibold">{{ t('publicIssues.request.help.title') }}</p>
              <p>{{ t('publicIssues.request.help.content') }}</p>
              <p>{{ t('publicIssues.request.help.examples') }}</p>
            </div>
          </template>
        </GeneralForm>
      </Card>
    </template>
  </GeneralTemplate>
</template>
