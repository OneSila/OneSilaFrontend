<script lang="ts" setup>
    import { ref, computed } from 'vue';
    import apexchart from 'vue3-apexcharts';

    import IconHorizontalDots from '../../../shared/components/atoms/icons/icon-horizontal-dots.vue';
    import IconDollarSign from '../../../shared/components/atoms/icons/icon-dollar-sign.vue';
    import IconInbox from '../../../shared/components/atoms/icons/icon-inbox.vue';
    import IconTag from '../../../shared/components/atoms/icons/icon-tag.vue';
    import IconCreditCard from '../../../shared/components/atoms/icons/icon-credit-card.vue';
    import IconShoppingCart from '../../../shared/components/atoms/icons/icon-shopping-cart.vue';
    import IconArrowLeft from '../../../shared/components/atoms/icons/icon-arrow-left.vue';
    import IconCashBanknotes from '../../../shared/components/atoms/icons/icon-cash-banknotes.vue';
    import IconUser from '../../../shared/components/atoms/icons/icon-user.vue';
    import IconNetflix from '../../../shared/components/atoms/icons/icon-netflix.vue';
    import IconBolt from '../../../shared/components/atoms/icons/icon-bolt.vue';
    import IconPlus from '../../../shared/components/atoms/icons/icon-plus.vue';
    import IconCaretDown from '../../../shared/components/atoms/icons/icon-caret-down.vue';
    import IconMultipleForwardRight from '../../../shared/components/atoms/icons/icon-multiple-forward-right.vue';
    

    const isDark =  true ; // take this from theme in the future
    const isRtl = true; // take this from language

    const revenueChart = computed(() => {


        return {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['#2196f3', '#e7515a'] : ['#1b55e2', '#e7515a'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1b55e2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#e7515a',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value / 1000 + 'K';
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        };
    });

    const revenueSeries = ref([
        {
            name: 'Income',
            data: [16800, 16800, 15500, 17800, 15500, 17000, 19000, 16000, 15000, 17000, 14000, 17000],
        },
        {
            name: 'Expenses',
            data: [16500, 17500, 16200, 17300, 16000, 19500, 16000, 17000, 16000, 19000, 18000, 19000],
        },
    ]);

    // sales by category
    const salesByCategory = computed(() => {
        return {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#182434' : '#fff',
            },
            colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Apparel', 'Sports', 'Others'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        };
    });

    const salesByCategorySeries = ref([985, 737, 270]);

    // daily sales
    const dailySales = computed(() => {
        return {
            chart: {
                height: 160,
                type: 'bar',
                fontFamily: 'Nunito, sans-serif',
                toolbar: {
                    show: false,
                },
                stacked: true,
                stackType: '100%',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 1,
            },
            colors: ['#e2a03f', '#e0e6ed'],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0,
                        },
                    },
                },
            ],
            xaxis: {
                labels: {
                    show: false,
                },
                categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
            },
            yaxis: {
                show: false,
            },
            fill: {
                opacity: 1,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '25%',
                },
            },
            legend: {
                show: false,
            },
            grid: {
                show: false,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                padding: {
                    top: 10,
                    right: -20,
                    bottom: -20,
                    left: -20,
                },
            },
        };
    });

    const dailySalesSeries = ref([
        {
            name: 'Sales',
            data: [44, 55, 41, 67, 22, 43, 21],
        },
        {
            name: 'Last Week',
            data: [13, 23, 20, 8, 13, 27, 33],
        },
    ]);

    // total orders
    const totalOrders = computed(() => {
        return {
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
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            yaxis: {
                min: 0,
                show: false,
            },
            grid: {
                padding: {
                    top: 125,
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
                    show: false,
                },
            },
        };
    });

    const totalOrdersSeries = ref([
        {
            name: 'Sales',
            data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40],
        },
    ]);
</script>

<template>
    <div>
        <ul class="flex space-x-2 rtl:space-x-reverse">
            <li>
                <a href="javascript:;" class="text-primary hover:underline">Dashboard</a>
            </li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                <span>Sales</span>
            </li>
        </ul>

        <div class="pt-5">
            <div class="grid xl:grid-cols-3 gap-6 mb-6">
                <div class="panel h-full xl:col-span-2">
                    <div class="flex items-center justify-between dark:text-white-light mb-5">
                        <h5 class="font-semibold text-lg">Revenue</h5>
                        <div class="dropdown ltr:ml-auto rtl:mr-auto">
                            <Popper :placement="isRtl ? 'bottom-start' : 'bottom-end'" offsetDistance="0" class="align-middle">
                                <a href="javascript:;">
                                    <icon-horizontal-dots class="text-black/70 dark:text-white/70 hover:!text-primary" />
                                </a>
                                <template #content="{ close }">
                                    <ul @click="close()">
                                        <li>
                                            <a href="javascript:;">Weekly</a>
                                        </li>
                                        <li>
                                            <a href="javascript:;">Monthly</a>
                                        </li>
                                        <li>
                                            <a href="javascript:;">Yearly</a>
                                        </li>
                                    </ul>
                                </template>
                            </Popper>
                        </div>
                    </div>
                    <p class="text-lg dark:text-white-light/90">Total Profit <span class="text-primary ml-2">$10,840</span></p>
                    <div class="relative">
                        <apexchart height="325" :options="revenueChart" :series="revenueSeries" class="bg-white dark:bg-black rounded-lg overflow-hidden">
                            <!-- loader -->
                            <div class="min-h-[325px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                                <span
                                    class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"
                                ></span>
                            </div>
                        </apexchart>
                    </div>
                </div>

                <div class="panel h-full">
                    <div class="flex items-center mb-5">
                        <h5 class="font-semibold text-lg dark:text-white-light">Sales By Category</h5>
                    </div>
                    <div>
                        <apexchart
                            height="460"
                            :options="salesByCategory"
                            :series="salesByCategorySeries"
                            class="bg-white dark:bg-black rounded-lg overflow-hidden"
                        >
                            <!-- loader -->
                            <div class="min-h-[460px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                                <span
                                    class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"
                                ></span>
                            </div>
                        </apexchart>
                    </div>
                </div>
            </div>

            <div class="grid sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
                <div class="panel h-full sm:col-span-2 xl:col-span-1">
                    <div class="flex items-center mb-5">
                        <h5 class="font-semibold text-lg dark:text-white-light">
                            Daily Sales <span class="block text-white-dark text-sm font-normal">Go to columns for details.</span>
                        </h5>
                        <div class="ltr:ml-auto rtl:mr-auto relative">
                            <div class="w-11 h-11 text-warning bg-[#ffeccb] dark:bg-warning dark:text-[#ffeccb] grid place-content-center rounded-full">
                                <icon-dollar-sign />
                            </div>
                        </div>
                    </div>
                    <div>
                        <apexchart height="160" :options="dailySales" :series="dailySalesSeries" class="bg-white dark:bg-black rounded-lg overflow-hidden">
                            <!-- loader -->
                            <div class="min-h-[175px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                                <span
                                    class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"
                                ></span>
                            </div>
                        </apexchart>
                    </div>
                </div>

                <div class="panel h-full">
                    <div class="flex items-center dark:text-white-light mb-5">
                        <h5 class="font-semibold text-lg">Summary</h5>
                        <div class="dropdown ltr:ml-auto rtl:mr-auto">
                            <Popper :placement="isRtl ? 'bottom-start' : 'bottom-end'" offsetDistance="0" class="align-middle">
                                <a href="javascript:;">
                                    <icon-horizontal-dots class="w-5 h-5 text-black/70 dark:text-white/70 hover:!text-primary" />
                                </a>
                                <template #content="{ close }">
                                    <ul @click="close()">
                                        <li>
                                            <a href="javascript:;">View Report</a>
                                        </li>
                                        <li>
                                            <a href="javascript:;">Edit Report</a>
                                        </li>
                                        <li>
                                            <a href="javascript:;">Mark as Done</a>
                                        </li>
                                    </ul>
                                </template>
                            </Popper>
                        </div>
                    </div>
                    <div class="space-y-9">
                        <div class="flex items-center">
                            <div class="w-9 h-9 ltr:mr-3 rtl:ml-3">
                                <div
                                    class="bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light rounded-full w-9 h-9 grid place-content-center"
                                >
                                    <icon-inbox />
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex font-semibold text-white-dark mb-2">
                                    <h6>Income</h6>
                                    <p class="ltr:ml-auto rtl:mr-auto">$92,600</p>
                                </div>
                                <div class="rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                                    <div class="bg-gradient-to-r from-[#7579ff] to-[#b224ef] w-11/12 h-full rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="w-9 h-9 ltr:mr-3 rtl:ml-3">
                                <div
                                    class="bg-success-light dark:bg-success text-success dark:text-success-light rounded-full w-9 h-9 grid place-content-center"
                                >
                                    <icon-tag />
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex font-semibold text-white-dark mb-2">
                                    <h6>Profit</h6>
                                    <p class="ltr:ml-auto rtl:mr-auto">$37,515</p>
                                </div>
                                <div class="w-full rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                                    <div class="bg-gradient-to-r from-[#3cba92] to-[#0ba360] w-full h-full rounded-full" style="width: 65%"></div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center">
                            <div class="w-9 h-9 ltr:mr-3 rtl:ml-3">
                                <div
                                    class="bg-warning-light dark:bg-warning text-warning dark:text-warning-light rounded-full w-9 h-9 grid place-content-center"
                                >
                                    <icon-credit-card />
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="flex font-semibold text-white-dark mb-2">
                                    <h6>Expenses</h6>
                                    <p class="ltr:ml-auto rtl:mr-auto">$55,085</p>
                                </div>
                                <div class="w-full rounded-full h-2 bg-dark-light dark:bg-[#1b2e4b] shadow">
                                    <div class="bg-gradient-to-r from-[#f09819] to-[#ff5858] w-full h-full rounded-full" style="width: 80%"></div>
                                </div>
                            </div>
                        </div>
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
                            3,192
                            <span class="block text-sm font-normal">Total Orders</span>
                        </h5>
                    </div>
                    <apexchart height="290" :options="totalOrders" :series="totalOrdersSeries" class="bg-white dark:bg-black rounded-lg overflow-hidden">
                        <!-- loader -->
                        <div class="min-h-[290px] grid place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08]">
                            <span class="animate-spin border-2 border-black dark:border-white !border-l-transparent rounded-full w-5 h-5 inline-flex"></span>
                        </div>
                    </apexchart>
                </div>
            </div>

            <div class="grid sm:grid-cols-1 xl:grid-cols-1 gap-6 mb-6">

                <div class="panel h-full">
                    <div class="flex items-center justify-between dark:text-white-light mb-5">
                        <h5 class="font-semibold text-lg">Transactions</h5>
                        <div class="dropdown ltr:ml-auto rtl:mr-auto">
                            <Popper :placement="isRtl ? 'bottom-start' : 'bottom-end'" offsetDistance="0" class="align-middle">
                                <a href="javascript:;">
                                    <icon-horizontal-dots class="text-black/70 dark:text-white/70 hover:!text-primary" />
                                </a>
                                <template #content="{ close }">
                                    <ul @click="close()">
                                        <li>
                                            <a href="javascript:;">View Report</a>
                                        </li>
                                        <li>
                                            <a href="javascript:;">Edit Report</a>
                                        </li>
                                        <li>
                                            <a href="javascript:;">Mark as Done</a>
                                        </li>
                                    </ul>
                                </template>
                            </Popper>
                        </div>
                    </div>
                    <div>
                        <div class="space-y-6">
                            <div class="flex">
                                <span
                                    class="shrink-0 grid place-content-center text-base w-9 h-9 rounded-md bg-success-light dark:bg-success text-success dark:text-success-light"
                                    >SP</span
                                >
                                <div class="px-3 flex-1">
                                    <div>Shaun Park</div>
                                    <div class="text-xs text-white-dark dark:text-gray-500">10 Jan 1:00PM</div>
                                </div>
                                <span class="text-success text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">+$36.11</span>
                            </div>
                            <div class="flex">
                                <span
                                    class="shrink-0 grid place-content-center w-9 h-9 rounded-md bg-warning-light dark:bg-warning text-warning dark:text-warning-light"
                                >
                                    <icon-cash-banknotes />
                                </span>
                                <div class="px-3 flex-1">
                                    <div>Cash withdrawal</div>
                                    <div class="text-xs text-white-dark dark:text-gray-500">04 Jan 1:00PM</div>
                                </div>
                                <span class="text-danger text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">-$16.44</span>
                            </div>
                            <div class="flex">
                                <span
                                    class="shrink-0 grid place-content-center w-9 h-9 rounded-md bg-danger-light dark:bg-danger text-danger dark:text-danger-light"
                                >
                                    <icon-user class="w-6 h-6" />
                                </span>
                                <div class="px-3 flex-1">
                                    <div>Amy Diaz</div>
                                    <div class="text-xs text-white-dark dark:text-gray-500">10 Jan 1:00PM</div>
                                </div>
                                <span class="text-success text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">+$66.44</span>
                            </div>
                            <div class="flex">
                                <span
                                    class="shrink-0 grid place-content-center w-9 h-9 rounded-md bg-secondary-light dark:bg-secondary text-secondary dark:text-secondary-light"
                                >
                                    <icon-netflix />
                                </span>
                                <div class="px-3 flex-1">
                                    <div>Netflix</div>
                                    <div class="text-xs text-white-dark dark:text-gray-500">04 Jan 1:00PM</div>
                                </div>
                                <span class="text-danger text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">-$32.00</span>
                            </div>
                            <div class="flex">
                                <span
                                    class="shrink-0 grid place-content-center text-base w-9 h-9 rounded-md bg-info-light dark:bg-info text-info dark:text-info-light"
                                    >DA</span
                                >
                                <div class="px-3 flex-1">
                                    <div>Daisy Anderson</div>
                                    <div class="text-xs text-white-dark dark:text-gray-500">10 Jan 1:00PM</div>
                                </div>
                                <span class="text-success text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">+$10.08</span>
                            </div>
                            <div class="flex">
                                <span
                                    class="shrink-0 grid place-content-center w-9 h-9 rounded-md bg-primary-light dark:bg-primary text-primary dark:text-primary-light"
                                >
                                    <icon-bolt />
                                </span>
                                <div class="px-3 flex-1">
                                    <div>Electricity Bill</div>
                                    <div class="text-xs text-white-dark dark:text-gray-500">04 Jan 1:00PM</div>
                                </div>
                                <span class="text-danger text-base px-1 ltr:ml-auto rtl:mr-auto whitespace-pre">-$22.00</span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="panel h-full w-full">
                    <div class="flex items-center justify-between mb-5">
                        <h5 class="font-semibold text-lg dark:text-white-light">Recent Orders</h5>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th class="ltr:rounded-l-md rtl:rounded-r-md">Customer</th>
                                    <th>Product</th>
                                    <th>Invoice</th>
                                    <th>Price</th>
                                    <th class="ltr:rounded-r-md rtl:rounded-l-md">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="min-w-[150px] text-black dark:text-white">
                                        <div class="flex items-center">
                                            <img class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="" alt="avatar" />
                                            <span class="whitespace-nowrap">Luke Ivory</span>
                                        </div>
                                    </td>
                                    <td class="text-primary">Headphone</td>
                                    <td><router-link to="/apps/invoice/preview">#46894</router-link></td>
                                    <td>$56.07</td>
                                    <td><span class="badge bg-success shadow-md dark:group-hover:bg-transparent">Paid</span></td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex items-center">
                                            <img class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="" alt="avatar" />
                                            <span class="whitespace-nowrap">Andy King</span>
                                        </div>
                                    </td>
                                    <td class="text-info">Nike Sport</td>
                                    <td><router-link to="/apps/invoice/preview">#76894</router-link></td>
                                    <td>$126.04</td>
                                    <td><span class="badge bg-secondary shadow-md dark:group-hover:bg-transparent">Shipped</span></td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex items-center">
                                            <img class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="" alt="avatar" />
                                            <span class="whitespace-nowrap">Laurie Fox</span>
                                        </div>
                                    </td>
                                    <td class="text-warning">Sunglasses</td>
                                    <td><router-link to="/apps/invoice/preview">#66894</router-link></td>
                                    <td>$56.07</td>
                                    <td><span class="badge bg-success shadow-md dark:group-hover:bg-transparent">Paid</span></td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex items-center">
                                            <img class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="" alt="avatar" />
                                            <span class="whitespace-nowrap">Ryan Collins</span>
                                        </div>
                                    </td>
                                    <td class="text-danger">Sport</td>
                                    <td><router-link to="/apps/invoice/preview">#75844</router-link></td>
                                    <td>$110.00</td>
                                    <td><span class="badge bg-secondary shadow-md dark:group-hover:bg-transparent">Shipped</span></td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex items-center">
                                            <img class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover" src="" alt="avatar" />
                                            <span class="whitespace-nowrap">Irene Collins</span>
                                        </div>
                                    </td>
                                    <td class="text-secondary">Speakers</td>
                                    <td><router-link to="/apps/invoice/preview">#46894</router-link></td>
                                    <td>$56.07</td>
                                    <td><span class="badge bg-success shadow-md dark:group-hover:bg-transparent">Paid</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="panel h-full w-full">
                    <div class="flex items-center justify-between mb-5">
                        <h5 class="font-semibold text-lg dark:text-white-light">Top Selling Product</h5>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr class="border-b-0">
                                    <th class="ltr:rounded-l-md rtl:rounded-r-md">Product</th>
                                    <th>Price</th>
                                    <th>Discount</th>
                                    <th>Sold</th>
                                    <th class="ltr:rounded-r-md rtl:rounded-l-md">Source</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="min-w-[150px] text-black dark:text-white">
                                        <div class="flex">
                                            <img
                                                class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover"
                                                src=""
                                                alt="avatar"
                                            />
                                            <p class="whitespace-nowrap">Headphone <span class="text-primary block text-xs">Digital</span></p>
                                        </div>
                                    </td>
                                    <td>$168.09</td>
                                    <td>$60.09</td>
                                    <td>170</td>
                                    <td>
                                        <a class="text-danger flex items-center" href="javascript:;">
                                            <icon-multiple-forward-right class="rtl:rotate-180 ltr:mr-1 rtl:ml-1" />

                                            Direct
                                        </a>
                                    </td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex">
                                            <img
                                                class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover"
                                                src=""
                                                alt="avatar"
                                            />
                                            <p class="whitespace-nowrap">Shoes <span class="text-warning block text-xs">Faishon</span></p>
                                        </div>
                                    </td>
                                    <td>$126.04</td>
                                    <td>$47.09</td>
                                    <td>130</td>
                                    <td>
                                        <a class="text-success flex items-center" href="javascript:;">
                                            <icon-multiple-forward-right class="rtl:rotate-180 ltr:mr-1 rtl:ml-1" />

                                            Google
                                        </a>
                                    </td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex">
                                            <img
                                                class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover"
                                                src=""
                                                alt="avatar"
                                            />
                                            <p class="whitespace-nowrap">Watch <span class="text-danger block text-xs">Accessories</span></p>
                                        </div>
                                    </td>
                                    <td>$56.07</td>
                                    <td>$20.00</td>
                                    <td>66</td>
                                    <td>
                                        <a class="text-warning flex items-center" href="javascript:;">
                                            <icon-multiple-forward-right class="rtl:rotate-180 ltr:mr-1 rtl:ml-1" />

                                            Ads
                                        </a>
                                    </td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex">
                                            <img
                                                class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover"
                                                src=""
                                                alt="avatar"
                                            />
                                            <p class="whitespace-nowrap">Laptop <span class="text-primary block text-xs">Digital</span></p>
                                        </div>
                                    </td>
                                    <td>$110.00</td>
                                    <td>$33.00</td>
                                    <td>35</td>
                                    <td>
                                        <a class="text-secondary flex items-center" href="javascript:;">
                                            <icon-multiple-forward-right class="rtl:rotate-180 ltr:mr-1 rtl:ml-1" />
                                            Email
                                        </a>
                                    </td>
                                </tr>
                                <tr class="text-white-dark hover:text-black dark:hover:text-white-light/90 group">
                                    <td class="text-black dark:text-white">
                                        <div class="flex">
                                            <img
                                                class="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover"
                                                src=""
                                                alt="avatar"
                                            />
                                            <p class="whitespace-nowrap">Camera <span class="text-primary block text-xs">Digital</span></p>
                                        </div>
                                    </td>
                                    <td>$56.07</td>
                                    <td>$26.04</td>
                                    <td>30</td>
                                    <td>
                                        <a class="text-primary flex items-center" href="javascript:;">
                                            <icon-multiple-forward-right class="rtl:rotate-180 ltr:mr-1 rtl:ml-1" />
                                            Referral
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>