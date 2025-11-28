<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectAuth } from '../../../../../../../shared/modules/auth';
import {
  sheinPropertiesQuery,
  sheinProductTypesQuery,
  sheinPropertySelectValuesQuery,
  sheinInternalPropertiesQuery,
  sheinChannelsQuery,
} from '../../../../../../../shared/api/queries/salesChannels.js';
import apolloClient from '../../../../../../../../apollo-client';
import { DashboardCard } from '../dashboard-card';
import { Toggle } from '../../../../../../../shared/components/atoms/toggle';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';

const { t } = useI18n();
const auth = injectAuth();

interface SheinCardData {
  integrationId: string;
  hostname: string;
  salesChannelId: string;
  properties: number;
  productTypes: number;
  localProductTypes: number;
  selectValues: number;
  inventoryFields: number;
}

const showCompletedSheinCards = ref<Record<string, boolean>>({});
const integrations = ref<SheinCardData[]>([]);
const loading = ref(false);
const finishedFetch = ref(false);

const isShowingCompleted = (integrationId: string) =>
  showCompletedSheinCards.value[integrationId] ?? false;

const updateShowCompleted = (integrationId: string, value: boolean) => {
  showCompletedSheinCards.value = {
    ...showCompletedSheinCards.value,
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
      query: sheinPropertiesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
    makeQuery({
      query: sheinProductTypesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
    makeQuery({
      query: sheinProductTypesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedRemotely: false },
      },
    }),
    makeQuery({
      query: sheinPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
    makeQuery({
      query: sheinInternalPropertiesQuery,
      variables: {
        first: 1,
        filter: { salesChannel: { id: { exact: salesChannelId } }, mappedLocally: false },
      },
    }),
  ]);

  return {
    properties: propRes?.sheinProperties?.totalCount || 0,
    productTypes: typeRes?.sheinProductTypes?.totalCount || 0,
    localProductTypes: localTypeRes?.sheinProductTypes?.totalCount || 0,
    selectValues: valueRes?.sheinPropertySelectValues?.totalCount || 0,
    inventoryFields: inventoryRes?.sheinInternalProperties?.totalCount || 0,
  };
};

const fetchSheinIntegrations = async () => {
  if (!(auth.user?.company as any)?.hasSheinIntegration) {
    finishedFetch.value = true;
    return;
  }

  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: sheinChannelsQuery,
      fetchPolicy: 'cache-first',
    });

    integrations.value = [];
    const edges = data?.sheinChannels?.edges || [];

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

onMounted(fetchSheinIntegrations);
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
                  {{ t('dashboard.cards.shein.title') }} - {{ integration.hostname }}
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
                {{ t('dashboard.cards.shein.description') }}
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
          :title="t('dashboard.cards.shein.unmappedProductTypes.title')"
          :description="t('dashboard.cards.shein.unmappedProductTypes.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'shein', id: integration.integrationId }, query: { tab: 'productRules', mappedLocally: false, mappedRemotely: 'all' } }"
        />
        <DashboardCard
          :counter="integration.localProductTypes"
          :title="t('dashboard.cards.shein.unmappedLocalProductTypes.title')"
          :description="t('dashboard.cards.shein.unmappedLocalProductTypes.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'shein', id: integration.integrationId }, query: { tab: 'productRules', mappedRemotely: false, mappedLocally: 'all' } }"
        />
        <DashboardCard
          :counter="integration.properties"
          :title="t('dashboard.cards.shein.unmappedProperties.title')"
          :description="t('dashboard.cards.shein.unmappedProperties.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'shein', id: integration.integrationId }, query: { tab: 'properties', mappedLocally: false, mappedRemotely: 'all', allowsUnmappedValues: 'all' } }"
        />
        <DashboardCard
          :counter="integration.selectValues"
          :title="t('dashboard.cards.shein.unmappedSelectValues.title')"
          :description="t('dashboard.cards.shein.unmappedSelectValues.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'shein', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false } }"
        />
        <DashboardCard
          :counter="integration.inventoryFields"
          :title="t('dashboard.cards.shein.unmappedInventoryFields.title')"
          :description="t('dashboard.cards.shein.unmappedInventoryFields.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'shein', id: integration.integrationId }, query: { tab: 'inventoryFields', mappedLocally: false, mappedRemotely: 'all' } }"
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
