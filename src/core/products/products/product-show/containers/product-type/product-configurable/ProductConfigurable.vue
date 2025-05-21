<script setup lang="ts">

import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {Tabs} from "../../../../../../../shared/components/molecules/tabs";
import {Product} from "../../../../configs"
import ProductEditView from "../../tabs/general/ProductEditView.vue";
import ProductContentView from "../../tabs/content/ProductContentView.vue";
import VariationsView from "../../tabs/variations/VariationsView.vue";
import MediaView from "../../tabs/media/MediaView.vue";
import PropertiesView from "../../tabs/properties/PropertiesView.vue";
import WebsitesView from "../../tabs/websites/WebsitesView.vue";
import AliasProductsView from "../../tabs/alias-parents/AliasProductsView.vue";

const props = defineProps<{ product: Product }>();
const { t } = useI18n();

const tabItems = ref();

tabItems.value = [
  { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
  { name: 'productContent', label: t('products.products.tabs.content'), icon: 'rectangle-list' },
  { name: 'media', label: t('products.products.tabs.media'), icon: 'photo-film' },
  { name: 'properties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
];

if (props.product.aliasProducts?.length > 0) {
  tabItems.value.push({
    name: 'aliasProducts',
    label: t('products.products.tabs.aliasProducts'),
    icon: 'clone'
  });
}

tabItems.value.push(
  { name: 'variations', label: t('products.products.tabs.variations'), icon: 'sitemap' },
  { name: 'websites', label: t('products.products.tabs.websites'), icon: 'globe' },
);


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
      <template v-if="product.aliasProducts.length" v-slot:aliasProducts>
        <AliasProductsView :product="product" />
      </template>
      <template v-slot:variations>
        <VariationsView :product="product" />
      </template>
      <template v-slot:websites>
        <WebsitesView :product="product" />
      </template>
    </Tabs>
  </div>
</template>