<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { injectAuth } from '../../../../../../../shared/modules/auth';
import {
  miraklPropertiesQuery,
  miraklProductTypesQuery,
  miraklPropertySelectValuesQuery,
  miraklChannelsQuery,
} from '../../../../../../../shared/api/queries/salesChannels.js';
import apolloClient from '../../../../../../../../apollo-client';
import { DashboardCard } from '../dashboard-card';
import { Toggle } from '../../../../../../../shared/components/atoms/toggle';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { MIRAKL_REPRESENTATION_TYPE_UNIT } from '../../../../../../integrations/integrations/integrations-show/containers/properties/containers/mirakl-properties/representationTypes';

const { t } = useI18n();
const auth = injectAuth();

interface MiraklCardData {
  integrationId: string;
  hostname: string;
  salesChannelId: string;
  properties: number;
  propertiesUsedInProducts: number;
  productTypes: number;
  productTypesNotReadyToPush: number;
  selectValues: number;
  selectValuesUsedInProducts: number;
  predefinedSelectValues: number;
  unitConfigurators: number;
}

const showCompletedMiraklCards = ref<Record<string, boolean>>({});
const integrations = ref<MiraklCardData[]>([]);
const loading = ref(false);
const finishedFetch = ref(false);

const isShowingCompleted = (integrationId: string) =>
  showCompletedMiraklCards.value[integrationId] ?? false;

const updateShowCompleted = (integrationId: string, value: boolean) => {
  showCompletedMiraklCards.value = {
    ...showCompletedMiraklCards.value,
    [integrationId]: value,
  };
};

const fetchCounts = async (salesChannelId: string) => {
  const makeQuery = (options: any) =>
    apolloClient
      .query({ ...options, fetchPolicy: 'cache-first' })
      .then(({ data }) => data)
      .catch(() => null);

  const [
    propRes,
    propUsedRes,
    typeRes,
    notReadyRes,
    valueRes,
    valueUsedRes,
    predefinedValueRes,
    unitRes,
  ] = await Promise.all([
    makeQuery({
      query: miraklPropertiesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          mappedLocally: false,
          showProperty: true,
        },
      },
    }),
    makeQuery({
      query: miraklPropertiesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          mappedLocally: false,
          usedInProducts: true,
          showProperty: true,
        },
      },
    }),
    makeQuery({
      query: miraklProductTypesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          mappedLocally: false,
        },
      },
    }),
    makeQuery({
      query: miraklProductTypesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          readyToPush: false,
        },
      },
    }),
    makeQuery({
      query: miraklPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          mappedLocally: false,
          isPropertyValue: true,
        },
      },
    }),
    makeQuery({
      query: miraklPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          mappedLocally: false,
          usedInProducts: true,
          isPropertyValue: true,
        },
      },
    }),
    makeQuery({
      query: miraklPropertySelectValuesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          mappedLocally: false,
          isPropertyValue: true,
          remoteProperty: {
            allowsUnmappedValues: { exact: false },
          },
        },
      },
    }),
    makeQuery({
      query: miraklPropertiesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: salesChannelId } },
          representationType: { exact: MIRAKL_REPRESENTATION_TYPE_UNIT },
          defaultValue: { isNull: true },
        },
      },
    }),
  ]);

  return {
    properties: propRes?.miraklProperties?.totalCount || 0,
    propertiesUsedInProducts: propUsedRes?.miraklProperties?.totalCount || 0,
    productTypes: typeRes?.miraklProductTypes?.totalCount || 0,
    productTypesNotReadyToPush: notReadyRes?.miraklProductTypes?.totalCount || 0,
    selectValues: valueRes?.miraklPropertySelectValues?.totalCount || 0,
    selectValuesUsedInProducts: valueUsedRes?.miraklPropertySelectValues?.totalCount || 0,
    predefinedSelectValues: predefinedValueRes?.miraklPropertySelectValues?.totalCount || 0,
    unitConfigurators: unitRes?.miraklProperties?.totalCount || 0,
  };
};

const fetchMiraklIntegrations = async () => {
  if (!(auth.user?.company as any)?.hasMiraklIntegration) {
    finishedFetch.value = true;
    return;
  }

  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: miraklChannelsQuery,
      fetchPolicy: 'cache-first',
    });

    integrations.value = [];
    const edges = data?.miraklChannels?.edges || [];

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

onMounted(fetchMiraklIntegrations);
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
                  {{ t('dashboard.cards.mirakl.title') }} - {{ integration.hostname }}
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
                {{ t('dashboard.cards.mirakl.description') }}
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
          :title="t('dashboard.cards.mirakl.unmappedProductTypes.title')"
          :description="t('dashboard.cards.mirakl.unmappedProductTypes.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'productRules', mappedLocally: false, readyToPush: 'all' } }"
        />
        <DashboardCard
          :counter="integration.productTypesNotReadyToPush"
          :title="t('dashboard.cards.mirakl.productTypesNotReadyToPush.title')"
          :description="t('dashboard.cards.mirakl.productTypesNotReadyToPush.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'productRules', readyToPush: false, mappedLocally: 'all' } }"
        />
        <DashboardCard
          :counter="integration.propertiesUsedInProducts"
          :title="t('dashboard.cards.mirakl.unmappedPropertiesUsedInProducts.title')"
          :description="t('dashboard.cards.mirakl.unmappedPropertiesUsedInProducts.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'properties', mappedLocally: false, allowsUnmappedValues: 'all', usedInProducts: true } }"
        />
        <DashboardCard
          :counter="integration.selectValuesUsedInProducts"
          :title="t('dashboard.cards.mirakl.unmappedSelectValuesUsedInProducts.title')"
          :description="t('dashboard.cards.mirakl.unmappedSelectValuesUsedInProducts.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false, usedInProducts: true } }"
        />
        <DashboardCard
          :counter="integration.unitConfigurators"
          :title="t('dashboard.cards.mirakl.unmappedDefaultUnitConfigurators.title')"
          :description="t('dashboard.cards.mirakl.unmappedDefaultUnitConfigurators.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="red"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'defaultUnits' } }"
        />
        <DashboardCard
          :counter="integration.predefinedSelectValues"
          :title="t('dashboard.cards.mirakl.unmappedPredefinedSelectValues.title')"
          :description="t('dashboard.cards.mirakl.unmappedPredefinedSelectValues.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="orange"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false, remoteProperty__allowsUnmappedValues: false } }"
        />
        <DashboardCard
          :counter="integration.properties"
          :title="t('dashboard.cards.mirakl.unmappedProperties.title')"
          :description="t('dashboard.cards.mirakl.unmappedProperties.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="yellow"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'properties', mappedLocally: false, allowsUnmappedValues: 'all' } }"
        />
        <DashboardCard
          :counter="integration.selectValues"
          :title="t('dashboard.cards.mirakl.unmappedSelectValues.title')"
          :description="t('dashboard.cards.mirakl.unmappedSelectValues.description')"
          :hide-on-complete="!isShowingCompleted(integration.integrationId)"
          color="yellow"
          :url="{ name: 'integrations.integrations.show', params: { type: 'mirakl', id: integration.integrationId }, query: { tab: 'propertySelectValues', mappedLocally: false } }"
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
