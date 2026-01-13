<script setup lang="ts">

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Breadcrumbs } from "../../../../shared/components/molecules/breadcrumbs";
import { Icon } from "../../../../shared/components/atoms/icon";
import GeneralTemplate from "../../../../shared/templates/GeneralTemplate.vue";
import VariationsGeneralBulkEdit from "../product-show/containers/tabs/variations/containers/variations-general-bulk-edit/VariationsGeneralBulkEdit.vue";
import VariationsContentBulkEdit from "../product-show/containers/tabs/variations/containers/variations-content-bulk-edit/VariationsContentBulkEdit.vue";
import VariationsBulkEdit from "../product-show/containers/tabs/variations/containers/variations-bulk-edit/VariationsBulkEdit.vue";
import VariationsPricesBulkEdit from "../product-show/containers/tabs/variations/containers/variations-prices-bulk-edit/VariationsPricesBulkEdit.vue";
import VariationsImagesBulkEdit from "../product-show/containers/tabs/variations/containers/variations-images-bulk-edit/VariationsImagesBulkEdit.vue";
import VariationsAmazonBulkEdit from "../product-show/containers/tabs/variations/containers/variations-amazon-bulk-edit/VariationsAmazonBulkEdit.vue";
import VariationsSheinBulkEdit from "../product-show/containers/tabs/variations/containers/variations-shein-bulk-edit/VariationsSheinBulkEdit.vue";
import VariationsEbayBulkEdit from "../product-show/containers/tabs/variations/containers/variations-ebay-bulk-edit/VariationsEbayBulkEdit.vue";
import { injectAuth } from "../../../../shared/modules/auth";

type Mode = 'editGeneral' | 'editContent' | 'editProperties' | 'editPrices' | 'editImages' | 'editAmazon' | 'editShein' | 'editEbay';

const { t } = useI18n();
const auth = injectAuth();
const route = useRoute();
const router = useRouter();
const mode = ref<Mode>('editGeneral');

const hasAmazonIntegration = computed(() => Boolean(auth.user.company?.hasAmazonIntegration));
const hasSheinIntegration = computed(() => Boolean(auth.user.company?.hasSheinIntegration));
const hasEbayIntegration = computed(() => Boolean(auth.user.company?.hasEbayIntegration));

const tabs = computed<{ key: Mode; label: string; icon: string }[]>(() => {
  const items: { key: Mode; label: string; icon: string }[] = [
    { key: 'editGeneral', label: t('products.products.variations.tabs.general'), icon: 'sliders' },
    { key: 'editContent', label: t('products.products.variations.tabs.content'), icon: 'file-lines' },
    { key: 'editProperties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
    { key: 'editPrices', label: t('products.products.tabs.prices'), icon: 'coins' },
    { key: 'editImages', label: t('products.products.variations.tabs.images'), icon: 'images' },
  ];

  if (hasAmazonIntegration.value) {
    items.push({ key: 'editAmazon', label: t('products.products.variations.tabs.amazon'), icon: 'store' });
  }

  if (hasEbayIntegration.value) {
    items.push({ key: 'editEbay', label: t('products.products.variations.tabs.ebay'), icon: 'store' });
  }

  if (hasSheinIntegration.value) {
    items.push({ key: 'editShein', label: t('products.products.variations.tabs.shein'), icon: 'store' });
  }

  return items;
});

const normalizeMode = (value: unknown): Mode | null => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string') {
    return null;
  }
  if (tabs.value.some((tab) => tab.key === raw)) {
    return raw as Mode;
  }
  return null;
};

const changeMode = (newMode: Mode) => {
  if (mode.value === newMode) {
    return;
  }
  mode.value = newMode;
  router.replace({ query: { ...route.query, tab: newMode } });
};

watch(
  () => route.query.tab,
  (value) => {
    const nextMode = normalizeMode(value);
    if (nextMode && nextMode !== mode.value) {
      mode.value = nextMode;
    }
  },
  { immediate: true }
);

const productIds = computed(() => {
  const raw = Array.isArray(route.query.ids) ? route.query.ids[0] : route.query.ids;
  if (typeof raw !== 'string') {
    return [];
  }
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
});

</script>

<template>
  <GeneralTemplate>
    <template v-slot:breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'products.products.list' }, name: t('products.title') },
          { path: { name: 'products.products.edit' }, name: t('products.products.edit.title') }
        ]"
      />
    </template>

    <template v-slot:content>
      <div class="panel p-4">
        <div class="flex flex-col gap-4 md:flex-row md:gap-0">
          <div class="md:w-36 md:border-r md:border-gray-200 md:pr-4 space-y-2">
            <div
              v-for="tab in tabs"
              :key="tab.key"
              class="cursor-pointer flex items-center gap-2 p-2 rounded-md"
              :class="{ 'bg-primary text-white': mode === tab.key }"
              @click="changeMode(tab.key)"
            >
              <Icon :name="tab.icon" class="w-4 h-4" />
              <span>{{ tab.label }}</span>
            </div>
          </div>

          <div class="flex-1 min-w-0 md:pl-4">
            <template v-if="mode === 'editGeneral'">
              <VariationsGeneralBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editContent'">
              <VariationsContentBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editProperties'">
              <VariationsBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editPrices'">
              <VariationsPricesBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editImages'">
              <VariationsImagesBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editAmazon'">
              <VariationsAmazonBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editEbay'">
              <VariationsEbayBulkEdit :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editShein'">
              <VariationsSheinBulkEdit :product-ids="productIds" />
            </template>
            <template v-else>
              <div class="py-6">
                <p class="text-sm text-gray-500">{{ t('shared.labels.comingSoon') }}</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
