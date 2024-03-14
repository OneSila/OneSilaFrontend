<script setup lang="ts">

import { useI18n} from 'vue-i18n';
import { useRoute, useRouter} from "vue-router";
import { ref} from "vue";
import {GeneralShow} from "../../../../shared/components/organisms/general-show";
import {Breadcrumbs} from "../../../../shared/components/molecules/breadcrumbs";
import {Card} from "../../../../shared/components/atoms/card";
import { showConfigConstructor } from "../configs";
import { Tabs} from "../../../../shared/components/molecules/tabs";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import ProductsList from "./containers/products-list/ProductsList.vue";
import OrdersList from "./containers/orders-list/OrdersList.vue";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const id = ref(String(route.params.id));
const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'products', label: t('products.title'), icon: 'box' },
    { name: 'orders', label: t('purchasing.orders.title'), icon: 'shopping-cart' },
  ];

const showConfig = showConfigConstructor(t, id.value);

</script>

<template>
    <GeneralTemplate>

    <template v-slot:breadcrumbs>
      <Breadcrumbs
          :links="[{ path: { name: 'purchasing.suppliers.list' }, name: t('purchasing.suppliers.title') },
                   { path: { name: 'purchasing.suppliers.show' }, name: t('purchasing.suppliers.show.title') }]" />
    </template>

   <template v-slot:content>
      <Card class="p-2">
          <Tabs :tabs="tabItems">
            <template v-slot:general>
              <GeneralShow :config="showConfig" />
            </template>
            <template v-slot:products>
              <ProductsList :id="id" />
            </template>
             <template v-slot:orders>
              <OrdersList :id="id" />
            </template>
          </Tabs>
      </Card>
   </template>
  </GeneralTemplate>
</template>