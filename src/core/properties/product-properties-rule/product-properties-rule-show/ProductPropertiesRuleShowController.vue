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
const loading = ref(true);
const productTypeId = ref(null)

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info', alwaysRender: true },
    { name: 'products', label: t('products.title'), icon: 'box' },
  ];

const showConfig = showConfigConstructor(t, id.value);

const onDataFetched = (data) => {
  productTypeId.value = data[showConfig.subscriptionKey].productType.id;
  if (productTypeId.value) {
    updateField(
        showConfig,
        'productType',
        {
          clickable: true,
          clickUrl: { name: 'properties.values.show', params: { id: productTypeId.value } },
    });
  }
  loading.value = false;
};

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'properties.rule.list' }, name: t('properties.rule.title') },
                   { path: { name: 'properties.rule.show', params: { id: id } }, name: t('properties.rule.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card>
        <Loader :loading="loading" />
        <Tabs :tabs="tabItems">
          <template v-slot:general>
            <GeneralShow :config="showConfig" @data-fetched="onDataFetched" />
          </template>
          <template v-slot:products>
             <ProductList v-if="productTypeId" :id="productTypeId" />
          </template>
        </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>