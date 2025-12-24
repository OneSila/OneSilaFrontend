<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Selector } from '../../atoms/selector';
import { injectAuth } from '../../../modules/auth';

const props = withDefaults(
  defineProps<{
    tabKey?: string;
    beforeChange?: (newTab: string, oldTab: string | null) => Promise<boolean> | boolean;
  }>(),
  {
    tabKey: 'tab',
  },
);

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = injectAuth();

interface MarketplaceOption {
  name: string;
  label: string;
  icon: string;
}

const items = computed<MarketplaceOption[]>(() => {
  const options: MarketplaceOption[] = [];

  if (auth.user.company?.hasAmazonIntegration) {
    options.push({ name: 'amazon', label: t('products.products.tabs.amazon'), icon: 'store' });
  }

  if (auth.user.company?.hasEbayIntegration) {
    options.push({ name: 'ebay', label: t('products.products.tabs.ebay'), icon: 'store' });
  }

  if (auth.user.company?.hasSheinIntegration) {
    options.push({ name: 'shein', label: t('products.products.tabs.shein'), icon: 'store' });
  }

  return options;
});

const getQueryValue = () => {
  const value = route.query[props.tabKey];
  return Array.isArray(value) ? value[0] : value;
};

const selectedMarketplace = computed<string | null>(() => {
  const queryValue = getQueryValue();
  if (queryValue && items.value.some((item) => item.name === queryValue)) {
    return queryValue.toString();
  }
  return items.value[0]?.name || null;
});

const handleMarketplaceChange = async (value: string | null) => {
  const current = selectedMarketplace.value;
  if (!value || value === current) return;

  if (props.beforeChange) {
    const proceed = await props.beforeChange(value, current);
    if (!proceed) return;
  }

  router.push({ query: { ...route.query, [props.tabKey]: value } });
};
</script>

<template>
  <div v-if="items.length" class="rounded-md border border-gray-200 bg-gray-50 p-4">
    <div class="text-sm font-semibold text-gray-700">
      {{ t('products.products.marketplaceSelector.label') }}
    </div>
    <div class="mt-2">
      <Selector
        :model-value="selectedMarketplace"
        :options="items"
        label-by="label"
        value-by="name"
        :placeholder="t('products.products.tabs.marketplace')"
        :removable="false"
        @update:modelValue="handleMarketplaceChange"
      />
    </div>
  </div>
</template>
