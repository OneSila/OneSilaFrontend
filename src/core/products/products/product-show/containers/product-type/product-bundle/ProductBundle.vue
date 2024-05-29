<script setup lang="ts">

import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {ref} from "vue";
import {Tabs} from "../../../../../../../shared/components/molecules/tabs";
import {Product} from "../../../../configs"
import ProductEditView from "../../tabs/general/ProductEditView.vue";
import ProductEanCodesList from "../../tabs/ean-codes/ProductEanCodesList.vue";
import ProductHsCodesList from "../../tabs/hs-codes/ProductHsCodesList.vue";
import ProductContentView from "../../tabs/content/ProductContentView.vue";
import SalesPricelistList from "../../tabs/sales-price-lists/SalesPricelistList.vue";
import VariationsView from "../../tabs/variations/VariationsView.vue";
import MediaView from "../../tabs/media/MediaView.vue";

const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const router = useRouter();

const tabItems = ref();

tabItems.value = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'productContent', label: t('products.products.tabs.content'), icon: 'rectangle-list' },
    { name: 'variations', label: t('products.products.tabs.bundleItems'), icon: 'sitemap' },
    { name: 'media', label: t('products.products.tabs.media'), icon: 'photo-film' },
    { name: 'priceLists', label: t('products.products.tabs.priceLists'), icon: 'money-bill' },
    { name: 'hsCodes', label: t('products.products.tabs.hsCodes'), icon: 'barcode' },
    { name: 'eanCodes', label: t('products.products.tabs.eanCodes'), icon: 'qrcode' },
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
      <template v-slot:variations>
        <VariationsView :product="product" />
      </template>
      <template v-slot:media>
        <MediaView :product="product" />
      </template>
      <template v-slot:priceLists>
        <SalesPricelistList :product="product" />
      </template>
      <template v-slot:hsCodes>
        <ProductHsCodesList :product="product" />
      </template>
      <template v-slot:eanCodes>
        <ProductEanCodesList :product="product" />
      </template>
    </Tabs>
  </div>
</template>