<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectAuth } from '../../../../../../../shared/modules/auth';
import { integrationsQuery } from '../../../../../../../shared/api/queries/integrations.js';
import { getAmazonChannelQuery, amazonPropertiesQuery, amazonProductTypesQuery, amazonPropertySelectValuesQuery } from '../../../../../../../shared/api/queries/salesChannels.js';
import apolloClient from '../../../../../../../../apollo-client';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
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
  selectValues: number;
}

const showCompletedAmazonCards = ref(false);
const integrations = ref<AmazonCardData[]>([]);
const loading = ref(false);
const finishedFetch = ref(false);

const fetchCounts = async (salesChannelId: string) => {
  const [propRes, typeRes, valueRes] = await Promise.all([
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
      query: amazonPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
      fetchPolicy: 'network-only',
    }),
  ]);

  return {
    properties: propRes.data?.amazonProperties?.totalCount || 0,
    productTypes: typeRes.data?.amazonProductTypes?.totalCount || 0,
    selectValues: valueRes.data?.amazonPropertySelectValues?.totalCount || 0,
  };
};

const fetchAmazonIntegrations = async () => {
  if (!(auth.user?.company as any)?.hasAmazonIntegration) {
    finishedFetch.value = true;
    return;
  }

  loading.value = true;
  const { data } = await apolloClient.query({
    query: integrationsQuery,
    variables: {
      filter: { type: { exact: IntegrationTypes.Amazon } },
    },
    fetchPolicy: 'network-only',
  });

  const edges = data?.integrations?.edges || [];
  for (const edge of edges) {
    const node = edge.node;
    const { data: channelData } = await apolloClient.query({
      query: getAmazonChannelQuery,
      variables: { id: node.id },
      fetchPolicy: 'network-only',
    });
    const channel = channelData?.amazonChannel;
    if (channel?.saleschannelPtr?.id) {
      const counts = await fetchCounts(channel.saleschannelPtr.id);
      integrations.value.push({
        integrationId: node.id,
        hostname: node.hostname,
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
    <Card v-for="integration in integrations" :key="integration.integrationId" class="py-8 mb-4">
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

      <div class="cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard
          :counter="integration.properties"
          :title="t('dashboard.cards.amazon.unmappedProperties.title')"
          :description="t('dashboard.cards.amazon.unmappedProperties.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'properties', mappedLocally: false, mappedRemotely: 'all', allowsUnmappedValues: 'all' } }"
        />
        <DashboardCard
          :counter="integration.productTypes"
          :title="t('dashboard.cards.amazon.unmappedProductTypes.title')"
          :description="t('dashboard.cards.amazon.unmappedProductTypes.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'productRules', mappedLocally: false, mappedRemotely: 'all' } }"
        />
        <DashboardCard
          :counter="integration.selectValues"
          :title="t('dashboard.cards.amazon.unmappedSelectValues.title')"
          :description="t('dashboard.cards.amazon.unmappedSelectValues.description')"
          :hide-on-complete="!showCompletedAmazonCards"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'amazon', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false, mappedRemotely: 'all' } }"
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
