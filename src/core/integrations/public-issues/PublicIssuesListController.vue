<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Breadcrumbs } from "../../../shared/components/molecules/breadcrumbs";
import { Button } from "../../../shared/components/atoms/button";
import { Icon } from "../../../shared/components/atoms/icon";
import { Link } from "../../../shared/components/atoms/link";
import { Tabs } from "../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../shared/templates/GeneralTemplate.vue";
import { GeneralListing } from "../../../shared/components/organisms/general-listing";
import {
  getPublicIssueIntegrationKey,
  getIntegrationTypeOptions,
  publicIssuesListingConfigConstructor,
  publicIssuesListingQuery,
  publicIssuesListingQueryKey,
  publicIssuesSearchConfigConstructor,
} from "./configs";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const searchConfig = publicIssuesSearchConfigConstructor(t);
const listingConfig = computed(() => publicIssuesListingConfigConstructor(t, route.query));
const integrationTabs = computed(() => [
  { name: 'all', label: t('publicIssues.tabs.all'), icon: 'list' },
  ...getIntegrationTypeOptions(t).map((option) => ({
    name: option.value,
    label: option.label,
    icon: 'store',
  })),
]);

const activeIntegrationType = computed(() => String(route.query.integrationType || ''));
const fixedFilterVariables = computed(() => {
  if (!activeIntegrationType.value) {
    return null;
  }

  return {
    integrationType: {
      key: {
        exact: activeIntegrationType.value,
      },
    },
    OR: {
      integrationType: {
        id: {
          isNull: true,
        },
      },
    },
  };
});
const issueText = computed(() => String(route.query.issue || route.query.search || ''));
const hasProductIssueContext = computed(() => Boolean(route.query.productId));
const canSendIssue = computed(() => hasProductIssueContext.value && issueText.value.trim().length > 0);

const buildContextQuery = () => ({
  ...route.query,
  issue: issueText.value,
});

const normalizeIntegrationTabQuery = (type?: string) => {
  const nextQuery = { ...route.query };
  delete nextQuery.before;
  delete nextQuery.after;
  delete nextQuery.first;
  delete nextQuery.last;

  if (!type || type === 'all') {
    delete nextQuery.integrationType;
  } else {
    nextQuery.integrationType = type;
  }

  router.replace({ query: nextQuery });
};

const handleIntegrationTabChanged = (tabName: string) => {
  normalizeIntegrationTabQuery(tabName);
};

watch(
  () => route.query.integrationType,
  (value) => {
    if (value === 'all') {
      normalizeIntegrationTabQuery('all');
    }
  },
);

onMounted(() => {
  if (route.query.integrationType === 'all') {
    normalizeIntegrationTabQuery('all');
  }
});

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
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.publicIssues.list' }, name: t('publicIssues.title') },
        ]"
      />
    </template>

    <template #buttons>
      <div class="flex flex-wrap items-center gap-2">
        <Link v-if="backToProductRoute" :path="backToProductRoute">
          <Button type="button" class="btn btn-outline-dark">
            {{ t('publicIssues.actions.backToProduct') }}
          </Button>
        </Link>
        <Link
          v-if="hasProductIssueContext"
          :path="{ name: 'integrations.publicIssues.request.create', query: buildContextQuery() }"
          :disabled="!canSendIssue"
        >
          <Button type="button" class="btn btn-primary" :disabled="!canSendIssue">
            {{ t('publicIssues.actions.sendIssue') }}
          </Button>
        </Link>
      </div>
    </template>

    <template #content>
      <Tabs
        :tabs="integrationTabs"
        tab-key="integrationType"
        transparent
        @tab-changed="handleIntegrationTabChanged"
      />

      <GeneralListing
        :search-config="searchConfig"
        :config="listingConfig"
        :query="publicIssuesListingQuery"
        :query-key="publicIssuesListingQueryKey"
        :fixed-filter-variables="fixedFilterVariables"
      >
        <template #additionalButtons="{ item }">
          <Link
            :path="{
              name: 'integrations.publicIssues.show',
              params: { id: item.node.id },
              query: {
                ...buildContextQuery(),
                issue: issueText || item.node.issue,
                integrationType: activeIntegrationType || getPublicIssueIntegrationKey(item.node.integrationType),
                publicIntegrationTypeId: item.node.integrationType?.id,
              },
            }"
          >
            <Icon name="eye" size="lg" class="text-blue-600" />
          </Link>
        </template>
      </GeneralListing>
    </template>
  </GeneralTemplate>
</template>
