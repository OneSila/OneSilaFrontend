<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TabContentTemplate from '../TabContentTemplate.vue';
import { Product } from '../../../../configs';
import { Accordion } from '../../../../../../../shared/components/atoms/accordion';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { amazonProductsQuery } from '../../../../../../../shared/api/queries/amazonProducts.js';
import apolloClient from '../../../../../../../../apollo-client';

const props = defineProps<{ product: Product }>();
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

const result = ref();
const loading = ref(false);

const fetchProducts = async () => {
  loading.value = true;
  const { data } = await apolloClient.query({
    query: amazonProductsQuery,
    variables: { localInstance: props.product.id },
    fetchPolicy: 'network-only',
  });

  result.value = data;
  loading.value = false;
};

onMounted(fetchProducts);

const viewNameMap = computed<Record<string, string>>(() => {
  console.log(props.product.saleschannelviewassignSet)
  const map: Record<string, string> = {};
  props.product.saleschannelviewassignSet.forEach((assign: any) => {
    map[assign.salesChannelView.remoteId] = assign.salesChannelView.name;
  });
  return map;
});

interface AccordionItem {
  name: string;
  label: string;
  issues: AmazonProductIssue[];
}

const accordionItems = computed<AccordionItem[]>(() => {
  const items: AccordionItem[] = [];
  const edges = result.value?.amazonProducts?.edges || [];

  edges.forEach((edge: { node: AmazonProduct }) => {
    const node = edge.node;
    const marketplaces = node.createdMarketplaces || [];

    marketplaces.forEach((viewId: string) => {
      const issues =
        node.issues?.filter((issue) => issue.view?.remoteId === viewId) || [];

      const label = viewNameMap.value[viewId] || viewId;
      items.push({ name: `${node.id}-${viewId}`, label, issues });
    });
  });

  return items;
});


</script>

<template>
  <TabContentTemplate>
    <template #content>
      <LocalLoader :loading="loading" />
      <div v-if="!loading && accordionItems.length">
        <Accordion :items="accordionItems">
          <template v-for="item in accordionItems" #[item.name]>
            <div class="mb-4 flex gap-2">
              <Button class="btn btn-sm btn-outline-primary">{{ t('shared.button.resync') }}</Button>
              <Button class="btn btn-sm btn-outline-primary">{{ t('shared.button.validate') }}</Button>
              <Button class="btn btn-sm btn-outline-primary">{{ t('shared.button.fetchIssues') }}</Button>
            </div>
            <div v-if="item.issues.length">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.code') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.message') }}</th>
                    <th class="px-3 py-2 text-left text-sm font-semibold text-gray-900">{{ t('shared.labels.severity') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  <tr v-for="issue in item.issues" :key="issue.id">
                    <td class="break-words">{{ issue.code }}</td>
                    <td class="break-words max-w-xs">{{ issue.message }}</td>
                    <td class="capitalize">{{ issue.severity }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-sm text-gray-500">{{ t('shared.labels.noIssues') }}</div>
          </template>
        </Accordion>
      </div>
      <div v-else-if="!loading" class="text-sm text-gray-500">{{ t('shared.labels.noIssues') }}</div>
    </template>
  </TabContentTemplate>
</template>
