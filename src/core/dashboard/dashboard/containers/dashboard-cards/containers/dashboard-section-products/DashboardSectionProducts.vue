<script setup lang="ts">

import { onMounted, ref } from "vue";
import {DashboardCard} from "../dashboard-card";
import {Toggle} from "../../../../../../../shared/components/atoms/toggle";
import {Card} from "../../../../../../../shared/components/atoms/card";
import {Icon} from "../../../../../../../shared/components/atoms/icon";
import { useI18n } from 'vue-i18n';
import { productsDashboardCardsQuery } from "../../../../../../../shared/api/queries/dashboardCards.js"
import { LocalLoader } from "../../../../../../../shared/components/atoms/local-loader";
import apolloClient from "../../../../../../../../apollo-client";

const { t } = useI18n();

const showCompletedProductsCards = ref(false);
const allCardsCompleted = ref(true);
const finshFetch = ref(false);
const loading = ref(false);

const productErrors = ref([
  // High importance errors
  { errorCode: 101, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  { errorCode: 102, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  // { errorCode: 104, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  { errorCode: 105, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  // { errorCode: 106, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  { errorCode: 110, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  { errorCode: 111, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  { errorCode: 117, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },
  { errorCode: 124, importance: 'high', icon: 'exclamation-triangle', color: 'red', counter: 0, loading: true  },

  // Medium importance errors
  { errorCode: 109, importance: 'medium', icon: 'exclamation-circle', color: 'orange', counter: 0, loading: true  },
  { errorCode: 112, importance: 'medium', icon: 'exclamation-circle', color: 'orange', counter: 0, loading: true  },
  // { errorCode: 114, importance: 'medium', icon: 'exclamation-circle', color: 'orange', counter: 0, loading: true  },
  { errorCode: 116, importance: 'medium', icon: 'exclamation-circle', color: 'orange', counter: 0, loading: true  },
  // Low importance errors
  // { errorCode: 118, importance: 'low', icon: 'info-circle', color: 'yellow', counter: 0, loading: true  },

  { errorCode: 123, importance: 'low', icon: 'info-circle', color: 'yellow', counter: 0, loading: true  },
]);

async function fetchErrorCounts() {
  loading.value = true;
  const promises = productErrors.value.map(async (error) => {
    try {
      const { data } = await apolloClient.query({
        query: productsDashboardCardsQuery,
        variables: { errorCode: error.errorCode.toString() },
        fetchPolicy: 'cache-first',
      });

      error.counter = data?.products.totalCount || 0;

      if (error.counter !== 0 && allCardsCompleted.value) {
        allCardsCompleted.value = false;
      }

      error.loading = false;
    } catch (err) {
      console.error(`Error fetching data for error code ${error.errorCode}:`, err);
      error.counter = 0;
      error.loading = false;
    }
  });

  await Promise.all(promises);
  loading.value = false;
}

onMounted(async () =>  {
  await fetchErrorCounts();
  finshFetch.value = true;
});

</script>

<template>
  <Card v-if="!loading" class="py-8">
      <Flex vertical class="py-6 gap-2">
        <FlexCell>
          <Flex between>
            <FlexCell center>
              <Flex>
                <h5 class="font-semibold text-lg dark:text-white-light">{{ t('dashboard.cards.products.title') }}</h5>
              </Flex>
            </FlexCell>
            <FlexCell center>
              <Flex>
                <FlexCell center>
                  <span class="mr-2 font-semibold">{{ t('dashboard.cards.help.showCompletedItems') }}</span>
                </FlexCell>
                <FlexCell center>
                  <Toggle v-model="showCompletedProductsCards" />
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
              <h6 class="text-md text-gray-600 dark:text-white-light">{{ t('dashboard.cards.products.description') }}</h6>
            </FlexCell>
          </Flex>
        </FlexCell>
        <FlexCell>
          <hr class="mt-2">
        </FlexCell>
      </Flex>

      <div class="cards grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <DashboardCard
            v-for="err in productErrors"
            :key="err.errorCode"
            :counter="err.counter"
            :title="t(`dashboard.cards.products.inspector.${err.errorCode}.title`)"
            :description="t(`dashboard.cards.products.inspector.${err.errorCode}.description`)"
            :hide-on-complete="!showCompletedProductsCards"
            :loading="err.loading"
            :url="{ name: 'products.products.list', query: {inspectorNotSuccessfullyCodeError: err.errorCode , active: true} }"
            :color="err.color"
            :icon="err.icon"
          />
      </div>
      <p v-if="!showCompletedProductsCards && allCardsCompleted" class="text-lg text-green-600">
        {{ t('dashboard.cards.products.noIssuesMessage') }}
      </p>
  </Card>
    <template v-else>
      <Card v-if="!finshFetch">
        <div class="flex justify-center items-center h-64">
          <LocalLoader loading />
        </div>
     </Card>
    </template>

</template>
