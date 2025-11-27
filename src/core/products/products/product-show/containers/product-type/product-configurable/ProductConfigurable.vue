<script setup lang="ts">

import {useI18n} from "vue-i18n";
import {ref, computed} from "vue";
import {Tabs} from "../../../../../../../shared/components/molecules/tabs";
import {Product} from "../../../../configs"
import ProductEditView from "../../tabs/general/ProductEditView.vue";
import ProductContentView from "../../tabs/content/ProductContentView.vue";
import VariationsView from "../../tabs/variations/VariationsView.vue";
import MediaView from "../../tabs/media/MediaView.vue";
import PropertiesView from "../../tabs/properties/PropertiesView.vue";
import WebsitesView from "../../tabs/websites/WebsitesView.vue";
import AliasProductsView from "../../tabs/alias-parents/AliasProductsView.vue";
import AmazonView from "../../tabs/amazon/AmazonView.vue";
import EbayView from "../../tabs/ebay/EbayView.vue";
import { injectAuth } from "../../../../../../../shared/modules/auth";
import Swal from 'sweetalert2';

const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const auth = injectAuth();


const generalRef = ref<InstanceType<typeof ProductEditView> | null>(null);
const contentRef = ref<InstanceType<typeof ProductContentView> | null>(null);
const propertiesRef = ref<InstanceType<typeof PropertiesView> | null>(null);
const variationsRef = ref<InstanceType<typeof VariationsView> | null>(null);
const amazonRef = ref<InstanceType<typeof AmazonView> | null>(null);
const ebayRef = ref<InstanceType<typeof EbayView> | null>(null);

const handleWebsiteAssignChange = () => {
  amazonRef.value?.fetchAmazonProducts('network-only');
  ebayRef.value?.fetchEbayProductCategories('network-only');
};

const tabRefs: Record<string, any> = {
  general: generalRef,
  productContent: contentRef,
  properties: propertiesRef,
  variations: variationsRef,
  amazon: amazonRef,
  ebay: ebayRef,
};

const beforeTabChange = async (newTab: string, oldTab: string) => {
  const current = tabRefs[oldTab];
  if (current?.value?.hasUnsavedChanges) {
    const res = await Swal.fire({
      icon: 'warning',
      text: t('products.products.messages.unsavedChanges'),
      showCancelButton: true,
      confirmButtonText: t('shared.button.cancel'),
      cancelButtonText: t('shared.button.leaveTab'),
    });
    return res.dismiss === Swal.DismissReason.cancel;
  }
  return true;
};

const tabItems = computed(() => {
  const items = [
    { name: 'general', label: t('shared.tabs.general'), icon: 'circle-info' },
    { name: 'productContent', label: t('products.products.tabs.content'), icon: 'rectangle-list' },
    { name: 'media', label: t('products.products.tabs.media'), icon: 'photo-film' },
    { name: 'properties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
  ];

  if (props.product.aliasProducts?.length > 0) {
    items.push({
      name: 'aliasProducts',
      label: t('products.products.tabs.aliasProducts'),
      icon: 'clone'
    });
  }

  items.push(
    { name: 'variations', label: t('products.products.tabs.variations'), icon: 'sitemap' },
    { name: 'websites', label: t('products.products.tabs.websites'), icon: 'globe' }
  );

  if (auth.user.company?.hasAmazonIntegration) {
    items.push({ name: 'amazon', label: t('products.products.tabs.amazon'), icon: 'store' });
  }

  if (auth.user.company?.hasEbayIntegration) {
    items.push({ name: 'ebay', label: t('products.products.tabs.ebay'), icon: 'store' });
  }

  return items;
});


</script>

<template>
  <div>
    <Tabs :tabs="tabItems" :before-change="beforeTabChange">
      <template v-slot:general>
        <ProductEditView ref="generalRef" :product="product" />
      </template>
      <template v-slot:productContent>
        <ProductContentView ref="contentRef" :product="product" />
      </template>
      <template v-slot:media>
        <MediaView :product="product" />
      </template>
      <template v-slot:properties>
        <PropertiesView ref="propertiesRef" :product="product" />
      </template>
      <template v-if="product.aliasProducts.length" v-slot:aliasProducts>
        <AliasProductsView :product="product" />
      </template>
      <template v-slot:variations>
        <VariationsView ref="variationsRef" :product="product" />
      </template>
      <template v-slot:websites>
        <WebsitesView
          :product="product"
          @assign-added="handleWebsiteAssignChange"
          @assign-deleted="handleWebsiteAssignChange"
        />
      </template>
      <template v-if="auth.user.company?.hasAmazonIntegration" v-slot:amazon>
        <AmazonView
          ref="amazonRef"
          :product="product"
        />
      </template>
      <template v-if="auth.user.company?.hasEbayIntegration" v-slot:ebay>
        <EbayView
          ref="ebayRef"
          :product="product"
        />
      </template>
    </Tabs>
  </div>
</template>