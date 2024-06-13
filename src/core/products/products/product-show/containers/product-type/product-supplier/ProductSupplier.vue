<script setup lang="ts">

import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {ref} from "vue";
import {Tabs} from "../../../../../../../shared/components/molecules/tabs";
import {Product} from "../../../../configs"
import ProductEditView from "../../tabs/general/ProductEditView.vue";
import InventoryList from "../../tabs/inventory/InventoryList.vue";
import ProductContentView from "../../tabs/content/ProductContentView.vue";
import MediaView from "../../tabs/media/MediaView.vue";
import SupplierProductPurchasePriceView from "../../tabs/supplier-prices/SupplierProductPurchasePriceView.vue";
import PurchasingOrderList from "../../tabs/purchasing-orders/PurchasingOrderList.vue";
import ProductsList from "../../tabs/products/ProductsList.vue";

const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const router = useRouter();

const tabItems = ref();


tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'productContent', label: t('products.products.tabs.content'), icon: 'rectangle-list' },
    { name: 'products', label: t('products.title'), icon: 'box' },
    { name: 'price', label: t('products.products.tabs.prices'), icon: 'tag' },
    { name: 'media', label: t('products.products.tabs.media'), icon: 'photo-film' },
    { name: 'properties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
    { name: 'inventory', label: t('products.products.tabs.inventory'), icon: 'warehouse' },
    { name: 'purchasingOrders', label: t('products.products.tabs.purchasingOrders'), icon: 'cart-shopping' },
  ];

</script>

<template>
  <div>
    <Tabs :tabs="tabItems">
      <template v-slot:general>
        <ProductEditView :product="product" />
      </template>
      <template v-slot:productContent>
        <ProductContentView :product="product" />
      </template>
      <template v-slot:products>
        <ProductsList :product="product" />
      </template>
      <template v-slot:media>
        <MediaView :product="product" />
      </template>
      <template v-slot:properties>
        properties
      </template>
      <template v-slot:price>
        <SupplierProductPurchasePriceView :product="product" />
      </template>
      <template v-slot:inventory>
        <InventoryList :product="product" />
      </template>
      <template v-slot:purchasingOrders>
        <PurchasingOrderList :product="product" />
      </template>
    </Tabs>
  </div>
</template>