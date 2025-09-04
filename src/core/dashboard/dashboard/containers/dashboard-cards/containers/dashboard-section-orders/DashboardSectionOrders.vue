<script setup lang="ts">

import { onMounted, ref } from "vue";
import {DashboardCard} from "../dashboard-card";
import {Toggle} from "../../../../../../../shared/components/atoms/toggle";
import {Card} from "../../../../../../../shared/components/atoms/card";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import { useI18n } from 'vue-i18n';
import { dashboardOngoingOrders, dashboardOngoingShipments } from "../../../../../../../shared/api/queries/dashboardCards.js"
import { LocalLoader } from "../../../../../../../shared/components/atoms/local-loader";
import apolloClient from "../../../../../../../../apollo-client";

const { t } = useI18n();

const showCompletedOrdersCards = ref(false);
const hideOrdersSection = ref(true);
const finshFetch = ref(false);

const orderCards = ref([
  {
    key: 'orders',
    query: dashboardOngoingOrders,
    title: t('dashboard.cards.orders.pendingOrders.title'),
    description: t('dashboard.cards.orders.pendingOrders.description'),
    icon: 'shopping-cart',
    color: 'red',
    counter: 0,
    loading: true,
    url: { name: 'sales.orders.list', query: { status: ['PENDING_PROCESSING', 'AWAIT_INVENTORY'] } },
  },
  {
    key: 'shipments',
    query: dashboardOngoingShipments,
    title: t('dashboard.cards.orders.ongoingShipments.title'),
    description: t('dashboard.cards.orders.ongoingShipments.description'),
    icon: 'truck',
    color: 'red',
    counter: 0,
    loading: true,
    url: { name: 'inventory.shipments.list', query: { status: 'TODO' } },
  },
  // {
  //   key: 'orderReturns',
  //   query: dashboardOngoingReturns,
  //   title: t('dashboard.cards.orders.pendingReturns.title'),
  //   description: t('dashboard.cards.orders.pendingReturns.description'),
  //   icon: 'undo',
  //   color: 'red',
  //   counter: 0,
  //   loading: true,
  //   url: { name: 'sales.returns.list', query: { status: 'PENDING_INSPECTION' } },
  // },
]);

async function fetchOrderCounts() {
  const fetchPromises = orderCards.value.map((card) => {
    return new Promise<void>((resolve) => {
      const queryRef = apolloClient.watchQuery({
        query: card.query,
        fetchPolicy: 'cache-and-network',
      });

      queryRef.subscribe({
        next: ({ data }) => {
          if (data[card.key]) {
            card.counter = data[card.key].totalCount;
          } else {
            card.counter = 0;
          }

          if (card.counter !== 0 && hideOrdersSection.value) {
            hideOrdersSection.value = false;
          }

          card.loading = false;
          resolve();
        },
        error: (err) => {
          console.error(`Error fetching data for ${card.key}:`, err);
          card.counter = 0;
          card.loading = false;
          resolve();
        },
      });
    });
  });

  await Promise.all(fetchPromises);
}

onMounted(async () =>  {
  await fetchOrderCounts();
  finshFetch.value = true;
});

</script>

<template>
  <Card v-if="!hideOrdersSection">
      <Flex vertical class="pb-6 gap-2">
        <FlexCell>
          <Flex between>
            <FlexCell center>
              <Flex>
                <h5 class="font-semibold text-lg dark:text-white-light">{{ t('dashboard.cards.orders.title') }}</h5>
              </Flex>
            </FlexCell>
            <FlexCell center>
              <Flex>
                <FlexCell center>
                  <span class="mr-2 font-semibold">{{ t('dashboard.cards.help.showCompletedItems') }}</span>
                </FlexCell>
                <FlexCell center>
                  <Toggle v-model="showCompletedOrdersCards" />
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
              <h6 class="text-md text-gray-600 dark:text-white-light">{{ t('dashboard.cards.orders.description') }}</h6>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <hr class="mt-2">
        </FlexCell>
      </Flex>

      <div class="cards grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        <DashboardCard
          v-for="card in orderCards"
          :key="card.key"
          :counter="card.counter"
          :description="card.description"
          :hide-on-complete="!showCompletedOrdersCards"
          :loading="card.loading"
          :title="card.title"
          :url="card.url"
          :color="card.color"
          :icon="card.icon"
        />
      </div>
    </Card>
    <template v-else>
      <Card v-if="!finshFetch">
        <div class="flex justify-center items-center h-64">
          <LocalLoader loading />
        </div>
     </Card>
    </template>

</template>
