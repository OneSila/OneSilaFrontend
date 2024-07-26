<script setup lang="ts">

import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {computed, ref} from "vue";
import {Tabs} from "../../../../../../../shared/components/molecules/tabs";
import {Product} from "../../../../configs"
import ProductEditView from "../../tabs/general/ProductEditView.vue";
import ProductEanCodesList from "../../tabs/ean-codes/ProductEanCodesList.vue";
import ProductHsCodesList from "../../tabs/hs-codes/ProductHsCodesList.vue";
import InventoryList from "../../tabs/inventory/InventoryList.vue";
import SupplierProductsList from "../../tabs/supplier-products/SupplierProductsList.vue";
import SalesOrderList from "../../tabs/sales-orders/SalesOrderList.vue";
import SalesPricelistList from "../../tabs/sales-price-lists/SalesPricelistList.vue";
import ProductSalePriceView from "../../tabs/sales-price/ProductSalePriceView.vue";
import ProductContentView from "../../tabs/content/ProductContentView.vue";
import MediaView from "../../tabs/media/MediaView.vue";
import PropertiesView from "../../tabs/properties/PropertiesView.vue";

const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const router = useRouter();

const tabItems = computed(() => {
  const items = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'productContent', label: t('products.products.tabs.content'), icon: 'rectangle-list' },
    { name: 'media', label: t('products.products.tabs.media'), icon: 'photo-film' },
    { name: 'properties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
  ];

  if (props.product.forSale) {
    items.push(
    { name: 'price', label: t('products.products.tabs.price'), icon: 'tag' },
    { name: 'priceLists', label: t('products.products.tabs.priceLists'), icon: 'money-bill' },
    { name: 'saleOrders', label: t('products.products.tabs.saleOrders'), icon: 'cart-shopping' },
    );
  }

  items.push(
    { name: 'inventory', label: t('products.products.tabs.inventory'), icon: 'warehouse' },
    { name: 'supplierProducts', label: t('products.products.tabs.supplierProducts'), icon: 'truck-ramp-box' },
    // { name: 'hsCodes', label: t('products.products.tabs.hsCodes'), icon: 'barcode' },
    { name: 'eanCodes', label: t('products.products.tabs.eanCodes'), icon: 'qrcode' },
  );

  return items;
});

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
      <template v-slot:media>
        <MediaView :product="product" />
      </template>
      <template v-slot:properties>
        <PropertiesView :product="product" />
      </template>
      <template v-slot:price>
        <ProductSalePriceView v-if="product.forSale" :product="product" />
      </template>
      <template v-slot:priceLists>
        <SalesPricelistList v-if="product.forSale" :product="product" />
      </template>
      <template v-slot:inventory>
        <InventoryList :product="product" />
      </template>
      <template v-slot:supplierProducts>
        <SupplierProductsList :product="product" />
      </template>
      <template v-slot:saleOrders>
        <SalesOrderList :product="product" />
      </template>
<!--      <template v-slot:hsCodes>-->
<!--        <ProductHsCodesList :product="product" />-->
<!--      </template>-->
      <template v-slot:eanCodes>
        <ProductEanCodesList :product="product" />
      </template>
    </Tabs>
  </div>
</template>