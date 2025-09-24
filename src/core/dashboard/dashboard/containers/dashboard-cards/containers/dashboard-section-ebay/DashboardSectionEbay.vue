<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectAuth } from '../../../../../../../shared/modules/auth';
import {
  ebayPropertiesQuery,
  ebayProductTypesQuery,
  ebayPropertySelectValuesQuery,
  ebayInternalPropertiesQuery,
  ebayChannelsQuery,
} from '../../../../../../../shared/api/queries/salesChannels.js';
import apolloClient from '../../../../../../../../apollo-client';
import { DashboardCard } from '../dashboard-card';
import { Toggle } from '../../../../../../../shared/components/atoms/toggle';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';

const { t } = useI18n();
const auth = injectAuth();

interface EbayCardData {
  integrationId: string;
  hostname: string;
  salesChannelId: string;
  properties: number;
  productTypes: number;
  localProductTypes: number;
  selectValues: number;
  inventoryFields: number;
}

const showCompletedEbayCards = ref<Record<string, boolean>>({});
const integrations = ref<EbayCardData[]>([]);
const loading = ref(false);
const finishedFetch = ref(false);

const isShowingCompleted = (integrationId: string) =>
  showCompletedEbayCards.value[integrationId] ?? false;

const updateShowCompleted = (integrationId: string, value: boolean) => {
  showCompletedEbayCards.value = {
    ...showCompletedEbayCards.value,
    [integrationId]: value,
  };
};

const fetchCounts = async (salesChannelId: string) => {
  const makeQuery = (options: any) =>
    apolloClient
      .query({ ...options, fetchPolicy: 'cache-first' })
      .then(({ data }) => data)
      .catch(() => null);

  const [propRes, typeRes, localTypeRes, valueRes, inventoryRes] = await Promise.all([
    makeQuery({
      query: ebayPropertiesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
    makeQuery({
      query: ebayProductTypesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
    makeQuery({
      query: ebayProductTypesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedRemotely: false },
      },
    }),
    makeQuery({
      query: ebayPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
    makeQuery({
      query: ebayInternalPropertiesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
  ]);

  return {
    properties: propRes?.ebayProperties?.totalCount || 0,
    productTypes: typeRes?.ebayProductTypes?.totalCount || 0,
    localProductTypes: localTypeRes?.ebayProductTypes?.totalCount || 0,
    selectValues: valueRes?.ebayPropertySelectValues?.totalCount || 0,
    inventoryFields: inventoryRes?.ebayInternalProperties?.totalCount || 0,
  };
};

const fetchEbayIntegrations = async () => {
  if (!(auth.user?.company as any)?.hasEbayIntegration) {
    finishedFetch.value = true;
    return;
  }

  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: ebayChannelsQuery,
      fetchPolicy: 'cache-first',
    });

    integrations.value = [];
    const edges = data?.ebayChannels?.edges || [];

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
  } catch (err) {
    console.error(err);
    loading.value = false;
    finishedFetch.value = true;
  }
};

onMounted(fetchEbayIntegrations);
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
                  {{ t('dashboard.cards.ebay.title') }} - {{ integration.hostname }}
                </h5>
              </Flex>
            </FlexCell>
            <FlexCell center>
              <Flex>
                <FlexCell center>
                  <span class="mr-2 font-semibold">{{ t('dashboard.cards.help.showCompletedItems') }}</span>
                </FlexCell>
                <FlexCell center>
                  <Toggle
                    :model-value="isShowingCompleted(integration.integrationId)"
                    @update:model-value="(value) => updateShowCompleted(integration.integrationId, value)"
                  />
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
                {{ t('dashboard.cards.ebay.description') }}
              </h6>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <hr class="mt-2" />
        </FlexCell>
      </Flex>

      <div class="cards grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <DashboardCard
          :counter="integration.productTypes"
          :title="t('dashboard.cards.ebay.unmappedProductTypes.title')"
          :description="t('dashboard.cards.ebay.unmappedProductTypes.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'ebay', id: integration.integrationId }, query: { tab: 'productRules', mappedLocally: false, mappedRemotely: 'all' } }"
        />
        <DashboardCard
          :counter="integration.localProductTypes"
          :title="t('dashboard.cards.ebay.unmappedLocalProductTypes.title')"
          :description="t('dashboard.cards.ebay.unmappedLocalProductTypes.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'ebay', id: integration.integrationId }, query: { tab: 'productRules', mappedRemotely: false, mappedLocally: 'all' } }"
        />
        <DashboardCard
          :counter="integration.properties"
          :title="t('dashboard.cards.ebay.unmappedProperties.title')"
          :description="t('dashboard.cards.ebay.unmappedProperties.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'ebay', id: integration.integrationId }, query: { tab: 'properties', mappedLocally: false, mappedRemotely: 'all', allowsUnmappedValues: 'all' } }"
        />
        <DashboardCard
          :counter="integration.selectValues"
          :title="t('dashboard.cards.ebay.unmappedSelectValues.title')"
          :description="t('dashboard.cards.ebay.unmappedSelectValues.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'ebay', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false } }"
        />
        <DashboardCard
          :counter="integration.inventoryFields"
          :title="t('dashboard.cards.ebay.unmappedInventoryFields.title')"
          :description="t('dashboard.cards.ebay.unmappedInventoryFields.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'ebay', id: integration.integrationId }, query: { tab: 'inventoryFields', mappedLocally: false, mappedRemotely: 'all' } }"
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
