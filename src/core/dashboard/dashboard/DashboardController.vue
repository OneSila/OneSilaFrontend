<script lang="ts" setup>

import { ref, onMounted, Ref } from 'vue';
import apexchart from 'vue3-apexcharts';
import apolloClient from '../../../../apollo-client';
import IconShoppingCart from '../../../shared/components/atoms/icons/icon-shopping-cart.vue';
import { ordersQuery } from "../../../shared/api/queries/salesOrders.js";
import { Icon } from '../../../shared/components/atoms/icon';
import { Title } from '../../../shared/components/atoms/title';
import { Link } from '../../../shared/components/atoms/link';
import { Card } from '../../../shared/components/atoms/card';
import { useI18n } from "vue-i18n";
import { Badge} from "../../../shared/components/atoms/badge";
import { getBadgeForSaleOrderStatus } from "../../sales/orders/configs";
import { OnboardingCards } from "./containers/onboarding-cards";
import { getOnboardingStatus, injectAuth } from "../../../shared/modules/auth";
import { OnboardingStatus } from "../../../shared/utils/constants";
import { DashboardCards } from "./containers/dashboard-cards";

interface Customer {
  id: string;
  name: string;
}

interface Order {
  id: string;
  reference: string;
  customer: Customer;
  priceInclVat: number;
  status: string;
  reasonForSale: string;
  createdAt: string;
  updatedAt: string;
  totalValue: string;
}

interface OrderEdge {
  node: Order;
}

interface OrdersQueryResult {
  orders: {
    edges: OrderEdge[];
  }
}

interface Series {
  name: string;
  data: number[];
}

const { t } = useI18n();

const isDark =  true ;

const recentOrders: Ref<Order[]> = ref([]);
const totalOrderCount = ref(0);
const totalOrdersSeries: Ref<Series[]> = ref([]);
const labels: Ref<string[]> = ref([]);
const totalOrders = ref ({});

onMounted(async () => {
  await fetchRecentOrders();
  await fetchAllOrdersCount();
});

async function fetchRecentOrders() {
  try {
    const { data } = await apolloClient.query<OrdersQueryResult>({
      query: ordersQuery,
      variables: { first: 5, order: { createdAt: 'DESC' } }
    });
    if (data && data.orders) {
      recentOrders.value = data.orders.edges.map(edge => edge.node);
    }
  } catch (error) {
    console.error("Error fetching recent orders:", error);
  }
}

function aggregateOrdersByWeek(orders) {
  const ordersByWeek: Record<string, number> = orders.reduce((acc, order) => {
    const week = getWeekOfYear(new Date(order.createdAt)).toString();
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});

  const currentWeek = getWeekOfYear(new Date());
  const seriesData: number[] = [];

  for (let i = 9; i >= 0; i--) {
    const week = currentWeek - i;
    seriesData.push(ordersByWeek[week] || 0);
    labels.value.push(`Week ${week}`);
  }

  totalOrdersSeries.value = [{ name: t('dashboard.labels.sales'), data: seriesData }];
  totalOrders.value = {
        chart: {
            height: 290,
            type: 'area',
            fontFamily: 'Nunito, sans-serif',
            sparkline: {
                enabled: true,
            },
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        colors: isDark ? ['#00ab55'] : ['#00ab55'],
        labels: labels.value,
        yaxis: {
            min: 0,
            show: true,
        },
        grid: {
            padding: {
                top: 80,
                right: 0,
                bottom: 0,
                left: 0,
            },
        },
        fill: {
            opacity: 1,
            type: 'gradient',
            gradient: {
                type: 'vertical',
                shadeIntensity: 1,
                inverseColors: !1,
                opacityFrom: 0.3,
                opacityTo: 0.05,
                stops: [100, 100],
            },
        },
        tooltip: {
            x: {
                show: true,
            },
        },
}
}

function getWeekOfYear(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}



async function fetchAllOrdersCount() {
  try {
    const { data } = await apolloClient.query({
      query: ordersQuery,
    });
    if (data && data.orders) {
      totalOrderCount.value = data.orders.totalCount;
      aggregateOrdersByWeek(data.orders.edges.map(edge => edge.node));
    }
  } catch (error) {
    console.error("Error fetching total orders count:", error);
  }
}

const auth = injectAuth();
const status = ref(getOnboardingStatus(auth));

const onUpdateStatus = () => {
  status.value = OnboardingStatus.DONE;
}

</script>

<template>
    <div>
<!--        <Card class="pt-5">-->
            <OnboardingCards v-if="status === OnboardingStatus.COMPLETE_DASHBOARD_CARDS || status === OnboardingStatus.DASHBOARD_CARDS_PRESENTATION"
                             :status="status" class="my-4" @update-status="onUpdateStatus" />

            <DashboardCards />
            <div class="grid sm:grid-cols-1 xl:grid-cols-2 gap-6 mb-6 mt-6">

                <div class="panel h-full w-full">
                    <div class="flex items-center justify-between mb-5">
                        <h5 class="font-semibold text-lg dark:text-white-light">{{ t('dashboard.labels.recentOrders') }}</h5>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th class="ltr:rounded-l-md rtl:rounded-r-md">{{ t('sales.customers.show.title') }}</th>
                                    <th>{{ t('shared.labels.price') }}</th>
                                    <th class="ltr:rounded-r-md rtl:rounded-l-md">{{ t('shared.labels.status') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="order in recentOrders" class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="min-w-[150px] text-black dark:text-white">
                                        <div class="flex items-center">
                                          <Link :path="{name: 'sales.customers.show', params: {id: order.customer.id}}">
                                            <span class="whitespace-nowrap">{{ order.customer.name }}</span>
                                          </Link>
                                        </div>
                                    </td>
                                    <td>{{ order.totalValue }}</td>
                                    <td>
                                      <Link :path="{name: 'sales.orders.show', params: {id: order.id}}">
                                        <Badge :color="getBadgeForSaleOrderStatus(t, order.status).color" :text="getBadgeForSaleOrderStatus(t, order.status).text" />
                                      </Link>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="panel h-full p-0">
                    <div class="flex items-center justify-between w-full p-5 absolute">
                        <div class="relative">
                            <div
                                class="text-success dark:text-success-light bg-success-light dark:bg-success w-11 h-11 rounded-lg flex items-center justify-center"
                            >
                                <icon-shopping-cart />
                            </div>
                        </div>
                        <h5 class="font-semibold text-2xl ltr:text-right rtl:text-left dark:text-white-light">
                            {{ totalOrderCount }}
                            <span class="block text-sm font-normal">{{ t('dashboard.labels.totalOrders') }}</span>
                        </h5>
                    </div>
                    <apexchart height="290" :options="totalOrders" :series="totalOrdersSeries" class="bg-white dark:bg-black rounded-lg overflow-hidden">
                        <div class="min-h-[290px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                            <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                        </div>
                    </apexchart>
                </div>
            </div>
<!--        </Card>-->
    </div>
</template>