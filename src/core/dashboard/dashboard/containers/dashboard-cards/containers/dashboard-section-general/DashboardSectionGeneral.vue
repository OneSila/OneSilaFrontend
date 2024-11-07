<script setup lang="ts">

import { onMounted, ref } from "vue";
import { DashboardCard } from "../dashboard-card";
import { Toggle } from "../../../../../../../shared/components/atoms/toggle";
import { Card } from "../../../../../../../shared/components/atoms/card";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import { useI18n } from 'vue-i18n';
import { dashboardIncompleteShippingAddress, dashboardNotMatchingSalesPricesList } from "../../../../../../../shared/api/queries/dashboardCards.js"
import apolloClient from "../../../../../../../../apollo-client";

const { t } = useI18n();

const showCompletedGeneralCards = ref(false);
const hideGeneralSection = ref(true);

const generalCards = ref([
  {
    key: 'shippingAddresses',
    query: dashboardIncompleteShippingAddress,
    title: t('dashboard.cards.general.missingLeadTime.title'),
    description: t('dashboard.cards.general.missingLeadTime.description'),
    icon: 'clock',
    color: 'red',
    counter: 0,
    loading: true,
    url: { name: 'inventory.leadTimeSettings.list' },
  },
  {
    key: 'salesPriceLists',
    query: dashboardNotMatchingSalesPricesList,
    title: t('dashboard.cards.general.currencyMismatchPriceLists.title'),
    description: t('dashboard.cards.general.currencyMismatchPriceLists.description'),
    icon: 'exchange-alt',
    color: 'red',
    counter: 0,
    loading: true,
    url: { name: 'sales.priceLists.list', query: { currencyMatchWithCustomers: false } },
  },
]);


async function fetchGeneralCounts() {
  const fetchPromises = generalCards.value.map(async (card) => {
    try {
      const { data } = await apolloClient.query({
        query: card.query,
        fetchPolicy: 'network-only',
      });

      if (data[card.key]) {
        card.counter = data[card.key].totalCount;
      } else {
        card.counter = 0;
      }

      if (card.counter !== 0 && hideGeneralSection.value) {
        hideGeneralSection.value = false;
      }
    } catch (err) {
      console.error(`Error fetching data for ${card.key}:`, err);
      card.counter = 0;
    } finally {
      card.loading = false;
    }
  });

  await Promise.all(fetchPromises);

}


onMounted(() => {
  fetchGeneralCounts();

});

</script>

<template>
  <Card>
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

      <div class="cards grid grid-cols-1 2xl:grid-cols-2 gap-4">
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
    </Card>
</template>
