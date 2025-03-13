<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Tabs } from "../../../../shared/components/molecules/tabs";
import { Card } from "../../../../shared/components/atoms/card";
import { useRoute } from "vue-router";
import { IntegrationTypes } from "../integrations";
import { getMagentoChannelQuery, getSalesChannelQuery } from "../../../../shared/api/queries/salesChannels.js";
import {MagentoGeneralInfoTab} from "./containers/magento-general-tab";
import apolloClient from "../../../../../apollo-client";
import { Loader } from "../../../../shared/components/atoms/loader";
import { Products } from "./containers/products";
import { Stores } from "./containers/stores";
import { Languages } from "./containers/languages";
import { Currencies } from "./containers/currencies";
import {Imports} from "./containers/imports";

const route = useRoute();

const { t } = useI18n();
const id = ref(String(route.params.id));
const type = ref(String(route.params.type));
const salesChannelId = ref(null);
const integrationId = ref(null);
const loading = ref(false);

const integrationData = ref<any>(null);


const tabItems = ref([
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
  { name: 'products', label: t('products.title'), icon: 'box' },
  { name: 'stores', label: t('shared.tabs.stores'), icon: 'store' },
  { name: 'languages', label: t('shared.tabs.languages'), icon: 'language' },
  { name: 'currencies', label: t('settings.currencies.title'), icon: 'money-bill' },
  // { name: 'imports', label: t('shared.tabs.imports'), icon: 'file-import' }
]);

const getIntegrationQuery = () => {

  if (type.value === IntegrationTypes.Magento) {
    return getMagentoChannelQuery;
  }

  return getSalesChannelQuery;
};

const getIntegrationQueryKey = () => {

  if (type.value === IntegrationTypes.Magento) {
    return "magentoChannel";
  }

  return "salesChannel";
};

const getGeneralComponent = () => {
  if (type.value === IntegrationTypes.Magento) {
    return null;
  }

  return null;
};

const fetchIntegrationData = async () => {
  try {
    loading.value = true;
    const { data } = await apolloClient.query({
      query: getIntegrationQuery(),
      variables: { id: id.value },
      fetchPolicy: 'network-only'
    });
    const { __typename, integrationPtr, saleschannelPtr,  ...cleanData } = data[getIntegrationQueryKey()];
    integrationData.value = cleanData;
    salesChannelId.value = saleschannelPtr.id
    integrationId.value = integrationPtr.id
  } catch (error) {
    console.error("Error fetching integration data:", error);
  } finally {
     loading.value = false;
  }
};

onMounted(async () => {
  fetchIntegrationData();
});

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
          <!-- General Edit Tab -->
          <template #general>
            <MagentoGeneralInfoTab v-if="!loading && integrationData" :data="integrationData" />
          </template>

          <!-- Products Tab -->
          <template #products>
            <Products v-if="salesChannelId" :sales-channel-id="salesChannelId" />
          </template>

          <!-- Views (Stores) Tab -->
          <template #stores>
            <Stores v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId" />
          </template>

          <!-- Languages Tab -->
          <template #languages>
            <Languages v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId"  />
          </template>

          <!-- Currencies Tab -->
          <template #currencies>
            <Currencies v-if="salesChannelId" :id="id" :sales-channel-id="salesChannelId"  />
          </template>

          <!-- Imports Tab -->
<!--          <template #imports>-->
<!--            <Imports v-if="salesChannelId" :sales-channel-id="salesChannelId"  />-->
<!--          </template>-->
        </Tabs>
      </Card>
    </template>
  </GeneralTemplate>
</template>
