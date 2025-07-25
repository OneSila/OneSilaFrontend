<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectAuth } from '../../../../../../../shared/modules/auth';
import {
  amazonPropertiesQuery,
  amazonProductTypesQuery,
  amazonPropertySelectValuesQuery,
  amazonDefaultUnitConfiguratorsQuery,
  amazonChannelsQuery
} from '../../../../../../../shared/api/queries/salesChannels.js';
import { dashboardAmazonProductsWithIssues } from '../../../../../../../shared/api/queries/dashboardCards.js';
import apolloClient from '../../../../../../../../apollo-client';
import { DashboardCard } from '../dashboard-card';
import { Toggle } from '../../../../../../../shared/components/atoms/toggle';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';

const { t } = useI18n();
const auth = injectAuth();

interface AmazonCardData {
  integrationId: string;
  hostname: string;
  salesChannelId: string;
  properties: number;
  productTypes: number;
  localProductTypes: number;
  selectValues: number;
  unitConfigurators: number;
  productsWithIssues: number;
}

const showCompletedAmazonCards = ref(false);
const integrations = ref<AmazonCardData[]>([]);
const loading = ref(false);
const finishedFetch = ref(false);

const fetchCounts = async (salesChannelId: string) => {
  const [propRes, typeRes, localTypeRes, valueRes, unitRes, issuesRes] = await Promise.all([
    apolloClient.query({
      query: amazonPropertiesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
      fetchPolicy: 'network-only',
    }),
    apolloClient.query({
      query: amazonProductTypesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
      fetchPolicy: 'network-only',
    }),
    apolloClient.query({
      query: amazonProductTypesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedRemotely: false },
      },
      fetchPolicy: 'network-only',
    }),
    apolloClient.query({
      query: amazonPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
      fetchPolicy: 'network-only',
    }),
    apolloClient.query({
      query: amazonDefaultUnitConfiguratorsQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false  },
      },
      fetchPolicy: 'network-only',
    }),
    apolloClient.query({
      query: dashboardAmazonProductsWithIssues,
      variables: {
        salesChannelId,
      },
      fetchPolicy: 'network-only',
    }),
  ]);

  return {
    properties: propRes.data?.amazonProperties?.totalCount || 0,
    productTypes: typeRes.data?.amazonProductTypes?.totalCount || 0,
    localProductTypes: localTypeRes.data?.amazonProductTypes?.totalCount || 0,
    selectValues: valueRes.data?.amazonPropertySelectValues?.totalCount || 0,
    unitConfigurators: unitRes.data?.amazonDefaultUnitConfigurators?.totalCount || 0,
    productsWithIssues: issuesRes.data?.products?.totalCount || 0,
  };
};

const fetchAmazonIntegrations = async () => {
  if (!(auth.user?.company as any)?.hasAmazonIntegration) {
    finishedFetch.value = true;
    return;
  }

  loading.value = true;

  const { data } = await apolloClient.query({
    query: amazonChannelsQuery,
    fetchPolicy: 'network-only'
  });

  const edges = data?.amazonChannels?.edges || [];

  for (const edge of edges) {
    const channel = edge.node;

    if (channel?.saleschannelPtr?.id) {
      const counts = await fetchCounts(channel.saleschannelPtr.id);
      integrations.value.push({
        integrationId: channel.id,
        hostname: channel.hostname,
        salesChannelId: channel.saleschannelPtr.id,
        ...counts,
      });
    }
  }

  loading.value = false;
  finishedFetch.value = true;
};


onMounted(fetchAmazonIntegrations);
</script>

<template>
  <template v-if="integrations.length">
    <Card v-for="integration in integrations" :key="integration.integrationId" class="py-8 mb-4 mt-4">
      <Flex vertical class="pb-6 gap-2">
        <FlexCell>
          <Flex between>
            <FlexCell center>
              <Flex>
                <h5 class="font-semibold text-lg dark:text-white-light">
                  {{ t('dashboard.cards.amazon.title') }} - {{ integration.hostname }}
                </h5>
              </Flex>
            </FlexCell>
            <FlexCell center>
              <Flex>
                <FlexCell center>
                  <span class="mr-2 font-semibold">{{ t('dashboard.cards.help.showCompletedItems') }}</span>
                </FlexCell>
                <FlexCell center>
                  <Toggle v-model="showCompletedAmazonCards" />
                </FlexCell>
              </Flex>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <Flex>
            <FlexCell>
              <Icon class="text-gray-600 mr-2" name="exclamation-circle" />
            </FlexCell>
            <FlexCell>
              <h6 class="text-md text-gray-600 dark:text-white-light">
                {{ t('dashboard.cards.amazon.description') }}
              </h6>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <hr class="mt-2">
        </FlexCell>
      </Flex>

      <div class="cards grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <DashboardCard
          :counter="integration.productTypes"
          :title="t('dashboard.cards.amazon.unmappedProductTypes.title')"
          :description="t('dashboard.cards.amazon.unmappedProductTypes.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'productRules', mappedLocally: false, mappedRemotely: 'all' } }"
        />
        <DashboardCard
          :counter="integration.localProductTypes"
          :title="t('dashboard.cards.amazon.unmappedLocalProductTypes.title')"
          :description="t('dashboard.cards.amazon.unmappedLocalProductTypes.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'productRules', mappedRemotely: false, mappedLocally: 'all' } }"
        />
        <DashboardCard
          :counter="integration.properties"
          :title="t('dashboard.cards.amazon.unmappedProperties.title')"
          :description="t('dashboard.cards.amazon.unmappedProperties.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'properties', mappedLocally: false, mappedRemotely: 'all', allowsUnmappedValues: 'all' } }"
        />
        <DashboardCard
          :counter="integration.selectValues"
          :title="t('dashboard.cards.amazon.unmappedSelectValues.title')"
          :description="t('dashboard.cards.amazon.unmappedSelectValues.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false, mappedRemotely: 'all' } }"
        />
        <DashboardCard
          :counter="integration.unitConfigurators"
          :title="t('dashboard.cards.amazon.unmappedDefaultUnitConfigurators.title')"
          :description="t('dashboard.cards.amazon.unmappedDefaultUnitConfigurators.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'defaultUnits', mappedLocally: false } }"
        />
        <DashboardCard
          :counter="integration.productsWithIssues"
          :title="t('dashboard.cards.amazon.productsWithIssues.title')"
          :description="t('dashboard.cards.amazon.productsWithIssues.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'products.products.list', query: { amazonProductsWithIssuesForSalesChannel: integration.salesChannelId } }"
        />
      </div>
    </Card>
  </template>
  <template v-else-if="!finishedFetch">
    <Card>
      <div class="flex justify-center items-center h-64">
        <LocalLoader loading />
      </div>
    </Card>
  </template>
</template>
