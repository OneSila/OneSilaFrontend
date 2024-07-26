<script setup lang="ts">
import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import { updateField} from "../../../../shared/components/organisms/general-show/showConfig";
import { showConfigConstructor } from "../configs";
import { Tabs} from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import ItemsList from "./containers/items-list/ItemsList.vue";
import {PropertyTypes} from "../../../../shared/utils/constants";
import ProductList from "./containers/products-list/ProductsList.vue"
import ValuesList from "./containers/values-list/ValuesList.vue"
import {Loader} from "../../../../shared/components/atoms/loader";
import RulesList from "./containers/rules-list/RulesList.vue";

const { t } = useI18n();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();
const showValues = ref(false);
const isProductType = ref(false);
const loading = ref(true);

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
    { name: 'products', label: t('products.title'), icon: 'box' },
    { name: 'configurators', label: t('properties.rule.title'), icon: 'cog' },
    { name: 'values', label: t('properties.values.title'), icon: 'sitemap' },
  ];

const showConfig = showConfigConstructor(t, id.value);

const onDataFetched = (data) => {

  showValues.value = data[showConfig.subscriptionKey].type === PropertyTypes.SELECT || data[showConfig.subscriptionKey].type === PropertyTypes.MULTISELECT;
  isProductType.value = data[showConfig.subscriptionKey].isProductType;

  if (!showValues.value) {
    const valuesTabIndex = tabItems.value.findIndex(tab => tab.name === 'values');
    if (valuesTabIndex !== -1) {
      tabItems.value.splice(valuesTabIndex, 1);
    }
  }

  if (isProductType.value) {
    const configuratorsTabIndex = tabItems.value.findIndex(tab => tab.name === 'configurators');
    if (configuratorsTabIndex !== -1) {
      tabItems.value.splice(configuratorsTabIndex, 1);
    }
  }

  loading.value = false;
};

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.properties.list' }, name: t('properties.title') },
                   { path: { name: 'properties.properties.show', params: { id: id } }, name: t('properties.properties.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Loader :loading="loading" />
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched" />
          </template>
          <template v-slot:products>
             <ProductList :id="id" />
          </template>
          <template v-slot:configurators>
            <RulesList v-if="!isProductType" :id="id" :is-product-type="isProductType" />
          </template>
          <template v-slot:values>
            <ValuesList v-if="showValues" :id="id" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>