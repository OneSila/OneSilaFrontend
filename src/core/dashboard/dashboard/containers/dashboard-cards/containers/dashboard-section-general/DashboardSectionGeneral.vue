<script setup lang="ts">

import { onMounted, ref } from "vue";
import { DashboardCard } from "../dashboard-card";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { useI18n } from 'vue-i18n';
import {
  dashboardPropertiesMissingMainTranslations,
  dashboardPropertiesMissingTranslations,
  dashboardPropertySelectValuesMissingMainTranslations,
  dashboardPropertySelectValuesMissingTranslations,
  dashboardPropertiesUsedInProductsMissingMainTranslations,
  dashboardPropertiesUsedInProductsMissingTranslations,
  dashboardPropertySelectValuesUsedInProductsMissingMainTranslations,
  dashboardPropertySelectValuesUsedInProductsMissingTranslations,
} from "../../../../../../../shared/api/queries/dashboardCards.js"
import { LocalLoader } from "../../../../../../../shared/components/atoms/local-loader";
import apolloClient from "../../../../../../../../apollo-client";

const { t } = useI18n();

const showCompletedGeneralCards = ref(false);
const hideGeneralSection = ref(true);
const finshFetch = ref(false);
const loading = ref(false);

const generalCards = ref([
  // {
  //   key: 'properties',
  //   query: dashboardPropertiesUsedInProductsMissingMainTranslations,
  //   title: t('dashboard.cards.general.propertiesUsedInProductsMissingMainTranslation.title'),
  //   description: t('dashboard.cards.general.propertiesUsedInProductsMissingMainTranslation.description'),
  //   icon: 'language',
  //   color: 'red',
  //   counter: 0,
  //   loading: true,
  //   url: { name: 'properties.properties.list', query: { missingMainTranslation: true, usedInProducts: true } },
  // },
  // {
  //   key: 'properties',
  //   query: dashboardPropertiesUsedInProductsMissingTranslations,
  //   title: t('dashboard.cards.general.propertiesUsedInProductsMissingTranslations.title'),
  //   description: t('dashboard.cards.general.propertiesUsedInProductsMissingTranslations.description'),
  //   icon: 'language',
  //   color: 'red',
  //   counter: 0,
  //   loading: true,
  //   url: { name: 'properties.properties.list', query: { missingTranslations: true, usedInProducts: true } },
  // },
  // {
  //   key: 'propertySelectValues',
  //   query: dashboardPropertySelectValuesUsedInProductsMissingMainTranslations,
  //   title: t('dashboard.cards.general.propertySelectValuesUsedInProductsMissingMainTranslation.title'),
  //   description: t('dashboard.cards.general.propertySelectValuesUsedInProductsMissingMainTranslation.description'),
  //   icon: 'language',
  //   color: 'red',
  //   counter: 0,
  //   loading: true,
  //   url: { name: 'properties.values.list', query: { missingMainTranslation: true, usedInProducts: true } },
  // },
  // {
  //   key: 'propertySelectValues',
  //   query: dashboardPropertySelectValuesUsedInProductsMissingTranslations,
  //   title: t('dashboard.cards.general.propertySelectValuesUsedInProductsMissingTranslations.title'),
  //   description: t('dashboard.cards.general.propertySelectValuesUsedInProductsMissingTranslations.description'),
  //   icon: 'language',
  //   color: 'red',
  //   counter: 0,
  //   loading: true,
  //   url: { name: 'properties.values.list', query: { missingTranslations: true, usedInProducts: true } },
  // },
  {
    key: 'properties',
    query: dashboardPropertiesMissingMainTranslations,
    title: t('dashboard.cards.general.propertiesMissingMainTranslation.title'),
    description: t('dashboard.cards.general.propertiesMissingMainTranslation.description'),
    icon: 'language',
    color: 'yellow',
    counter: 0,
    loading: true,
    url: { name: 'properties.properties.list', query: { missingMainTranslation: true } },
  },
  {
    key: 'properties',
    query: dashboardPropertiesMissingTranslations,
    title: t('dashboard.cards.general.propertiesMissingTranslations.title'),
    description: t('dashboard.cards.general.propertiesMissingTranslations.description'),
    icon: 'language',
    color: 'yellow',
    counter: 0,
    loading: true,
    url: { name: 'properties.properties.list', query: { missingTranslations: true } },
  },
  {
    key: 'propertySelectValues',
    query: dashboardPropertySelectValuesMissingMainTranslations,
    title: t('dashboard.cards.general.propertySelectValuesMissingMainTranslation.title'),
    description: t('dashboard.cards.general.propertySelectValuesMissingMainTranslation.description'),
    icon: 'language',
    color: 'yellow',
    counter: 0,
    loading: true,
    url: { name: 'properties.values.list', query: { missingMainTranslation: true } },
  },
  {
    key: 'propertySelectValues',
    query: dashboardPropertySelectValuesMissingTranslations,
    title: t('dashboard.cards.general.propertySelectValuesMissingTranslations.title'),
    description: t('dashboard.cards.general.propertySelectValuesMissingTranslations.description'),
    icon: 'language',
    color: 'yellow',
    counter: 0,
    loading: true,
    url: { name: 'properties.values.list', query: { missingTranslations: true } },
  },
]);


async function fetchGeneralCounts() {
  loading.value = true

  const fetchPromises = generalCards.value.map(async (card) => {
    try {
      const { data } = await apolloClient.query({
        query: card.query,
        fetchPolicy: 'cache-first',
      });

      if (data[card.key]) {
        card.counter = data[card.key].totalCount;
      } else {
        card.counter = 0;
      }

      if (card.counter !== 0 && hideGeneralSection.value) {
        hideGeneralSection.value = false;
      }

      card.loading = false;
    } catch (err) {
      console.error(`Error fetching data for ${card.key}:`, err);
      card.counter = 0;
      card.loading = false;
    }
  });

  await Promise.all(fetchPromises);
  loading.value = false;
}


onMounted(async () =>  {
  await fetchGeneralCounts();
  finshFetch.value = true;
});

</script>

<template>
  <div class="py-8 mb-4 mt-4">
  <Card v-if="!loading">
     <Flex vertical class="pb-6 gap-2">
      <FlexCell>
        <Flex between>
          <FlexCell center>
            <Flex>
              <h5 class="font-semibold text-lg dark:text-white-light">{{ t('dashboard.cards.general.title') }}</h5>
            </Flex>
          </FlexCell>
          <FlexCell center>
            <Flex>
              <FlexCell center>
                <span class="mr-2 font-semibold">{{ t('dashboard.cards.help.showCompletedItems') }}</span>
              </FlexCell>
              <FlexCell center>
                <Toggle v-model="showCompletedGeneralCards" />
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
            <h6 class="text-md text-gray-600 dark:text-white-light">{{ t('dashboard.cards.general.description') }}</h6>
          </FlexCell>
        </Flex>
      </FlexCell>
      <FlexCell>
        <hr class="mt-2">
      </FlexCell>
    </Flex>

      <div class="cards grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <DashboardCard
          v-for="card in generalCards"
          :key="card.key"
          :counter="card.counter"
          :description="card.description"
          :hide-on-complete="!showCompletedGeneralCards"
          :loading="card.loading"
          :title="card.title"
          :url="card.url"
          :color="card.color"
          :icon="card.icon"
        />
      </div>
      <p v-if="showCompletedGeneralCards" class="text-lg text-green-600">
        {{ t('dashboard.cards.general.noIssuesMessage') }}
      </p>
    </Card>
    <template v-else>
      <Card v-if="!finshFetch">
        <div class="flex justify-center items-center h-64">
          <LocalLoader loading />
        </div>
     </Card>
    </template>
  </div>

</template>
