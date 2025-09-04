<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Card } from "../../../../../../../../shared/components/atoms/card";
import { Tabs } from "../../../../../../../../shared/components/molecules/tabs";
import { DiscreteLoader } from "../../../../../../../../shared/components/atoms/discrete-loader";
import { Badge } from "../../../../../../../../shared/components/atoms/badge";
import { Breadcrumbs } from "../../../../../../../../shared/components/molecules/breadcrumbs";
import AmazonImportBrokenRecordsListing from "./components/AmazonImportBrokenRecordsListing.vue";
import { getSalesChannelImportQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { getStatusBadgeMap } from "../../configs";
import { IntegrationTypes } from "../../../../../integrations";
import apolloClient from "../../../../../../../../../apollo-client";

const route = useRoute();
const { t } = useI18n();
const id = ref(String(route.params.id));
const type = ref(String(route.params.type));
const integrationId = ref('');

const result = ref<any>(null);
const loading = ref(false);

const fetchImport = async () => {
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: getSalesChannelImportQuery,
      variables: { id: id.value },
      fetchPolicy: 'cache-first'
    });
    result.value = data;
    integrationId.value = data.salesChannelImport.salesChannel.id;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchImport);

const statusBadgeMap = getStatusBadgeMap(t);

const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
]);

if (type.value === IntegrationTypes.Amazon) {
  tabItems.value.push({ name: 'issues', label: t('shared.labels.issues'), icon: 'triangle-exclamation', alwaysRender: true });
}

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
          { path: { name: 'integrations.integrations.show', params: { id: integrationId, type: type }, query: { tab: 'imports' } }, name: t('integrations.show.title') },
          { name: t('integrations.imports.show.title') }
        ]"
      />
    </template>
    <template #content>
      <Card>
        <Tabs :tabs="tabItems">
          <template #general>
            <div v-if="!loading && result?.salesChannelImport" class="p-4">
              <div class="divide-y divide-gray-200">
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.createdAt') }}</span>
                  <span>{{ formatDate(result.salesChannelImport.createdAt) }}</span>
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.status') }}</span>
                  <Badge :color="statusBadgeMap[result.salesChannelImport.status]?.color" :text="statusBadgeMap[result.salesChannelImport.status]?.text" />
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('shared.labels.progress') }}</span>
                  <span>{{ result.salesChannelImport.percentage }}%</span>
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.createOnly') }}</span>
                  <span>{{ result.salesChannelImport.createOnly ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.updateOnly') }}</span>
                  <span>{{ result.salesChannelImport.updateOnly ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.skipBrokenRecords') }}</span>
                  <span>{{ result.salesChannelImport.skipBrokenRecords ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.totalRecords') }}</span>
                  <span>{{ result.salesChannelImport.totalRecords }}</span>
                </div>
                <div class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.processedRecords') }}</span>
                  <span>{{ result.salesChannelImport.processedRecords }}</span>
                </div>
                <div v-if="result.salesChannelImport.errorTraceback" class="flex items-center py-2">
                  <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.errorTraceback') }}</span>
                  <span class="whitespace-pre-wrap">{{ result.salesChannelImport.errorTraceback }}</span>
                </div>
              </div>
            </div>
            <DiscreteLoader v-else :loading="true" />
          </template>
          <template #issues v-if="type === IntegrationTypes.Amazon">
            <AmazonImportBrokenRecordsListing :import-id="id" />
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>
