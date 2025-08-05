<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import { Accordion } from '../../../../../../../shared/components/atoms/accordion';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { amazonChannelViewsQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import apolloClient from '../../../../../../../../apollo-client';

const props = defineProps<{ product: Product; amazonProducts: AmazonProduct[] }>();
const { t } = useI18n();

interface AmazonProductIssue {
  id: string;
  code?: string | null;
  message?: string | null;
  severity?: string | null;
  isValidationIssue?: boolean | null;
  view?: { remoteId: string; name?: string } | null;
}

interface AmazonProduct {
  id: string;
  createdMarketplaces: string[];
  issues: AmazonProductIssue[];
}

const views = ref<any[]>([]);
const loading = ref(false);

const fetchViews = async () => {
  loading.value = true;
  const { data } = await apolloClient.query({
    query: amazonChannelViewsQuery,
    fetchPolicy: 'network-only',
  });
  views.value = data.amazonChannelViews?.edges?.map((edge: any) => edge.node) || [];
  loading.value = false;
};

onMounted(fetchViews);

interface AccordionItem {
  name: string;
  label: string;
  validationIssues: AmazonProductIssue[];
  otherIssues: AmazonProductIssue[];
}

const accordionItems = computed<AccordionItem[]>(() => {
  return views.value
    .filter((view: any) =>
      props.amazonProducts.some((product: AmazonProduct) =>
        product.createdMarketplaces.includes(view.remoteId),
      ),
    )
    .map((view: any) => {
      const allIssues: AmazonProductIssue[] = [];
      props.amazonProducts.forEach((product: AmazonProduct) => {
        const issuesForView =
          product.issues?.filter((issue) => issue.view?.remoteId === view.remoteId) || [];
        allIssues.push(...issuesForView);
      });

      return {
        name: view.remoteId,
        label: view.name || view.remoteId,
        validationIssues: allIssues.filter((i) => i.isValidationIssue),
        otherIssues: allIssues.filter((i) => !i.isValidationIssue),
      };
    });
});


</script>

<template>
  <TabContentTemplate>
    <template #content>
      <LocalLoader :loading="loading" />
      <div v-if="!loading && accordionItems.length">
        <Accordion :items="accordionItems">
          <template v-for="item in accordionItems" #[item.name+'-actions'] :key="item.name+'-actions'">
            <div class="flex gap-2">
              <Button class="btn btn-sm btn-outline-primary" @click.stop>{{ t('shared.button.resync') }}</Button>
              <Button class="btn btn-sm btn-outline-primary" @click.stop>{{ t('shared.button.validate') }}</Button>
              <Button class="btn btn-sm btn-outline-primary" @click.stop>{{ t('shared.button.fetchIssues') }}</Button>
            </div>
          </template>
          <template v-for="item in accordionItems" #[item.name] :key="item.name">
            <div v-if="item.validationIssues.length" class="mb-4">
              <h4 class="font-semibold mb-2">{{ t('products.products.amazon.validationIssues') }}</h4>
              <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.validationIssuesDescription') }}</p>
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="issue in item.validationIssues" :key="issue.id">
                    <td class="break-words max-w-xs">{{ issue.message }}</td>
                    <td class="capitalize" :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }">{{ issue.severity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="item.otherIssues.length" class="mb-4">
              <h4 class="font-semibold mb-2">{{ t('products.products.amazon.otherIssues') }}</h4>
              <p class="text-xs text-gray-500 mb-2">{{ t('products.products.amazon.otherIssuesDescription') }}</p>
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="issue in item.otherIssues" :key="issue.id">
                    <td class="break-words max-w-xs">{{ issue.message }}</td>
                    <td class="capitalize" :class="{ 'text-red-600': issue.severity === 'ERROR', 'text-yellow-600': issue.severity === 'WARNING' }">{{ issue.severity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="!item.validationIssues.length && !item.otherIssues.length" class="text-sm text-gray-500">{{ t('shared.labels.noIssues') }}</div>
          </template>
        </Accordion>
      </div>
      <div v-else-if="!loading" class="text-sm text-gray-500">{{ t('shared.labels.noIssues') }}</div>
    </template>
  </TabContentTemplate>
</template>
