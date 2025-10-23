<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import { Card } from "../../../../shared/components/atoms/card";
import {useRoute, useRouter} from "vue-router";
import { IntegrationTypes } from "../integrations";
import {
  getMagentoChannelQuery,
  getSalesChannelQuery,
  getShopifyChannelQuery,
  getWoocommerceChannelQuery,
  getAmazonChannelQuery,
  getEbayChannelQuery,
  getSheinChannelQuery
} from "../../../../shared/api/queries/salesChannels.js";
import { getWebhookIntegrationQuery } from "../../../../shared/api/queries/webhookIntegrations.js";
import { AmazonGeneralInfoTab } from "./containers/general/amazon-general-tab";
import { MagentoGeneralInfoTab } from "./containers/general/magento-general-tab";
import { ShopifyGeneralInfoTab } from "./containers/general/shopify-general-tab";
import { WoocommerceGeneralInfoTab } from "./containers/general/woocommerce-general-tab";
import { WebhookGeneralInfoTab } from "./containers/general/webhook-general-tab";
import { EbayGeneralInfoTab } from "./containers/general/ebay-general-tab";
import { SheinGeneralInfoTab } from "./containers/general/shein-general-tab";
import apolloClient from "../../../../../apollo-client";
import { Loader } from "../../../../shared/components/atoms/loader";
import { Products } from "./containers/products";
import { Stores } from "./containers/stores";
import { Languages } from "./containers/languages";
import { Currencies } from "./containers/currencies";
import { PriceLists } from "./containers/price-lists";
import { Rules } from "./containers/rules";
import { Properties } from "./containers/properties";
import { InventoryFields } from "./containers/inventory-fields";
import { PropertySelectValues } from "./containers/property-select-values";
import { DefaultUnitConfigurators } from "./containers/default-unit-configurators";
import { Imports } from "./containers/imports";
import { Templates } from "./containers/templates";
import { refreshSalesChannelWebsitesMutation } from "../../../../shared/api/mutations/salesChannels";
import {Toast} from "../../../../shared/modules/toast";

const WebhookMonitor = defineAsyncComponent(() => import('./containers/monitor/WebhookMonitor.vue'));
const WebhookReports = defineAsyncComponent(() => import('./containers/reports/WebhookReports.vue'));

const router = useRouter();
const route = useRoute();

const { t } = useI18n();
const id = ref(String(route.params.id));
const type = ref(String(route.params.type));
const salesChannelId = ref(null);
const integrationId = ref(null);
const firstImportCompleteRef = ref(true);
const loading = ref(false);

const integrationData = ref<any>(null);


const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' }
]);

if (type.value !== IntegrationTypes.Webhook) {
  tabItems.value.push(
    { name: 'products', label: t('products.title'), icon: 'box' },
    { name: 'stores', label: t('shared.tabs.stores'), icon: 'store' },
    { name: 'languages', label: t('shared.tabs.languages'), icon: 'language' },
    { name: 'currencies', label: t('settings.currencies.title'), icon: 'money-bill' },
    { name: 'priceLists', label: t('sales.priceLists.title'), icon: 'money-bill' },
    { name: 'template', label: t('integrations.show.template.tabLabel'), icon: 'code' },
  );

  if (type.value === IntegrationTypes.Amazon) {
    tabItems.value.push(
      { name: 'productRules', label: t('properties.rule.title'), icon: 'cog' },
      { name: 'properties', label: t('properties.title'), icon: 'screwdriver-wrench' },
      { name: 'propertySelectValues', label: t('properties.values.title'), icon: 'sitemap' },
      { name: 'defaultUnits', label: t('integrations.show.sections.defaultUnits'), icon: 'weight-hanging' }
    );
  } else if (type.value === IntegrationTypes.Ebay) {
    tabItems.value.push(
      { name: 'inventoryFields', label: t('integrations.show.ebay.internalProperties.title'), icon: 'boxes-stacked' },
      { name: 'productRules', label: t('properties.rule.title'), icon: 'cog' },
      { name: 'properties', label: t('properties.title'), icon: 'screwdriver-wrench' },
      { name: 'propertySelectValues', label: t('properties.values.title'), icon: 'sitemap' }
    );
  }

  tabItems.value.push({ name: 'imports', label: t('shared.tabs.imports'), icon: 'file-import' });
} else {
  tabItems.value.push(
    { name: 'monitor', label: t('webhooks.monitor.title'), icon: 'wave-square' },
    { name: 'reports', label: t('integrations.show.tabs.reports'), icon: 'chart-simple' },
  );
}


const getIntegrationQuery = () => {
  switch (type.value) {
    case IntegrationTypes.Magento:
      return getMagentoChannelQuery;
    case IntegrationTypes.Shopify:
      return getShopifyChannelQuery;
    case IntegrationTypes.Woocommerce:
      return getWoocommerceChannelQuery;
    case IntegrationTypes.Amazon:
      return getAmazonChannelQuery;
    case IntegrationTypes.Ebay:
      return getEbayChannelQuery;
    case IntegrationTypes.Shein:
      return getSheinChannelQuery;
    case IntegrationTypes.Webhook:
      return getWebhookIntegrationQuery;
    default:
      return getSalesChannelQuery;
  }
};

const getIntegrationQueryKey = () => {
  switch (type.value) {
    case IntegrationTypes.Magento:
      return "magentoChannel";
    case IntegrationTypes.Shopify:
      return "shopifyChannel";
    case IntegrationTypes.Woocommerce:
      return "woocommerceChannel";
    case IntegrationTypes.Amazon:
      return "amazonChannel";
    case IntegrationTypes.Webhook:
      return "webhookIntegration";
    case IntegrationTypes.Ebay:
      return "ebayChannel";
    case IntegrationTypes.Shein:
      return "sheinChannel";
    default:
      return "salesChannel";
  }
};

const getGeneralComponent = () => {
  switch (type.value) {
    case IntegrationTypes.Magento:
      return MagentoGeneralInfoTab;
    case IntegrationTypes.Shopify:
      return ShopifyGeneralInfoTab;
    case IntegrationTypes.Woocommerce:
      return WoocommerceGeneralInfoTab;
    case IntegrationTypes.Amazon:
      return AmazonGeneralInfoTab;
    case IntegrationTypes.Webhook:
      return WebhookGeneralInfoTab;
    case IntegrationTypes.Ebay:
      return EbayGeneralInfoTab;
    case IntegrationTypes.Shein:
      return SheinGeneralInfoTab;
    default:
      return null;
  }
};

const fetchIntegrationData = async () => {
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: getIntegrationQuery(),
      variables: { id: id.value },
      fetchPolicy: 'cache-first'
    });
    const rawData = data[getIntegrationQueryKey()];

    if (type.value === IntegrationTypes.Webhook) {
      integrationData.value = { ...rawData };
      integrationId.value = rawData.id;
      salesChannelId.value = null;
      firstImportCompleteRef.value = true;
    } else {
      const { __typename, integrationPtr, saleschannelPtr, firstImportComplete,  ...cleanData } = rawData;

      if (type.value == IntegrationTypes.Shopify) {
        if (cleanData.vendorProperty && typeof cleanData.vendorProperty === 'object') {
          const { __typename: _ignored, ...vendorWithoutTypename } = cleanData.vendorProperty;
          cleanData.vendorProperty = vendorWithoutTypename;
        } else {
          cleanData.vendorProperty = { id: null };
        }
      }

      integrationData.value = cleanData;
      salesChannelId.value = saleschannelPtr.id
      integrationId.value = integrationPtr.id
      firstImportCompleteRef.value = firstImportComplete
    }
  } catch (error) {
    console.error("Error fetching integration data:", error);
  } finally {
     loading.value = false;
  }
};

onMounted(async () => {
  await fetchIntegrationData();
    if (!firstImportCompleteRef.value && type.value != IntegrationTypes.Amazon) {
    router.replace({
      query: {
        ...route.query,
        tab: 'imports',
      },
    });
  }
});

const pullData = async () => {
  try {
    loading.value = true;
    await apolloClient.mutate({
      mutation: refreshSalesChannelWebsitesMutation,
      variables: {
        data: {
          id: salesChannelId.value,
        },
      },
    });
    Toast.success(t("integrations.show.pullData.success"));

    const currentUrl = window.location.pathname + window.location.search;
    window.location.href = currentUrl;

  } catch (error) {
    Toast.error(t("integrations.show.pullData.error"));
    console.error("Pull data failed:", error);
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
          { path: { name: 'integrations.integrations.show' }, name: t('integrations.show.title') }
        ]"
      />
    </template>

    <template v-slot:content>
      <Card>
        <Loader :loading="loading" />
        <Tabs :tabs="tabItems">

          <template v-if="!firstImportCompleteRef" #banner>
              <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                <span class="font-medium flex items-center gap-1">
                  ⚠️ {{ t('integrations.show.noImportBanner.title') }}
                </span>
                {{ t('integrations.show.noImportBanner.content') }}
              </div>
            </template>

          <!-- General Edit Tab -->
          <template #general>
            <component
              v-if="!loading && integrationData"
              :is="getGeneralComponent()"
              :data="integrationData"
            />
          </template>

          <!-- Monitor Tab -->
          <template #monitor>
            <WebhookMonitor v-if="integrationId" :integration-id="integrationId" />
          </template>

          <!-- Reports Tab -->
          <template #reports>
            <WebhookReports v-if="integrationId" :integration-id="integrationId" />
          </template>

          <!-- Products Tab -->
          <template #products>
            <Products v-if="salesChannelId" :sales-channel-id="salesChannelId" />
          </template>

          <!-- Views (Stores) Tab -->
          <template #stores>
            <Stores v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" @pull-data="pullData()" />
          </template>

          <!-- Languages Tab -->
          <template #languages>
            <Languages v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" @pull-data="pullData()" />
          </template>

          <!-- Currencies Tab -->
          <template #currencies>
            <Currencies v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" @pull-data="pullData()" />
          </template>

          <!-- Price Lists Tab -->
          <template #priceLists>
            <PriceLists v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" />
          </template>

          <!-- Imports Tab -->
          <template #imports>
            <Imports v-if="salesChannelId && integrationId" :id="id" :sales-channel-id="salesChannelId" />
          </template>

          <!-- Template Tab -->
          <template #template>
            <Templates v-if="salesChannelId" :sales-channel-id="salesChannelId" />
          </template>

          <!-- Rules Tab -->
          <template #productRules>
            <Rules v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" :type="type" @pull-data="pullData()" />
          </template>

          <!-- Properties Tab -->
          <template #properties>
            <Properties v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" :type="type" @pull-data="pullData()" />
          </template>

          <!-- Inventory Fields Tab -->
          <template #inventoryFields>
            <InventoryFields
              v-if="salesChannelId"
              :id="id"
              :sales-channel-id="salesChannelId"
              :type="type"
              @pull-data="pullData()"
            />
          </template>

          <!-- Property Select Values Tab -->
          <template #propertySelectValues>
            <PropertySelectValues v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" :type="type" @pull-data="pullData()" />
          </template>

          <!-- Default Units Tab -->
          <template #defaultUnits>
            <DefaultUnitConfigurators v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" :type="type" @pull-data="pullData()" />
          </template>
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>
