<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../../../../../shared/templates/GeneralTemplate.vue";
import { Card } from "../../../../../../../../shared/components/atoms/card";
import { Tabs } from "../../../../../../../../shared/components/molecules/tabs";
import { DiscreteLoader } from "../../../../../../../../shared/components/atoms/discrete-loader";
import { Badge } from "../../../../../../../../shared/components/atoms/badge";
import { getSalesChannelImportQuery } from "../../../../../../../../shared/api/queries/salesChannels.js";
import { getStatusBadgeMap } from "../../configs";
import { IntegrationTypes } from "../../../../../integrations";
import apolloClient from "../../../../../../../../../apollo-client";

const route = useRoute();
const { t } = useI18n();
const id = ref(String(route.params.id));
const type = ref(String(route.params.type));

const result = ref(null);
const loading = ref(false);

const fetchImport = async () => {
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: getSalesChannelImportQuery,
      variables: { id: id.value },
      fetchPolicy: 'network-only'
    });
    result.value = data;
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
    <template #content>
      <Card>
        <Tabs :tabs="tabItems">
          <template #general>
            <div v-if="!loading && result?.salesChannelImport" class="p-4 space-y-2">
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('shared.labels.createdAt') }}</span>
                <span>{{ formatDate(result.salesChannelImport.createdAt) }}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('shared.labels.status') }}</span>
                <Badge :color="statusBadgeMap[result.salesChannelImport.status]?.color" :text="statusBadgeMap[result.salesChannelImport.status]?.text" />
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('shared.labels.progress') }}</span>
                <span>{{ result.salesChannelImport.percentage }}%</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.createOnly') }}</span>
                <span>{{ result.salesChannelImport.createOnly ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.updateOnly') }}</span>
                <span>{{ result.salesChannelImport.updateOnly ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.skipBrokenRecords') }}</span>
                <span>{{ result.salesChannelImport.skipBrokenRecords ? t('shared.labels.yes') : t('shared.labels.no') }}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.totalRecords') }}</span>
                <span>{{ result.salesChannelImport.totalRecords }}</span>
              </div>
              <div class="flex">
                <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.processedRecords') }}</span>
                <span>{{ result.salesChannelImport.processedRecords }}</span>
              </div>
              <div v-if="result.salesChannelImport.errorTraceback" class="flex">
                <span class="w-1/3 font-medium">{{ t('integrations.imports.labels.errorTraceback') }}</span>
                <span class="whitespace-pre-wrap">{{ result.salesChannelImport.errorTraceback }}</span>
              </div>
            </div>
            <DiscreteLoader v-else :loading="true" />
          </template>
          <template #issues v-if="type === IntegrationTypes.Amazon">
            <div class="p-4">{{ t('shared.labels.comingSoon') }}</div>
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>
