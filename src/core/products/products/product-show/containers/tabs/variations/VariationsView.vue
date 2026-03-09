<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { Product } from "../../../../configs";
import TabContentTemplate from "../TabContentTemplate.vue";
import { SearchConfig } from "../../../../../../../shared/components/organisms/general-search/searchConfig";
import { bundleVariationsQuery, configurableVariationsQuery } from "../../../../../../../shared/api/queries/products.js";
import { ProductType } from "../../../../../../../shared/utils/constants";
import { Icon } from "../../../../../../../shared/components/atoms/icon";
import VariationsList from "./containers/variations-list/VariationsList.vue";
import VariationCreate from "./containers/variation-create/VariationCreate.vue";
import VariationsBulkEdit from "./containers/variations-bulk-edit/VariationsBulkEdit.vue";
import VariationsContentBulkEdit from "./containers/variations-content-bulk-edit/VariationsContentBulkEdit.vue";
import VariationsPricesBulkEdit from "./containers/variations-prices-bulk-edit/VariationsPricesBulkEdit.vue";
import VariationsImagesBulkEdit from "./containers/variations-images-bulk-edit/VariationsImagesBulkEdit.vue";
import VariationsDocumentsBulkEdit from "./containers/variations-documents-bulk-edit/VariationsDocumentsBulkEdit.vue";
import VariationsVideosBulkEdit from "./containers/variations-videos-bulk-edit/VariationsVideosBulkEdit.vue";
import VariationsGeneralBulkEdit from "./containers/variations-general-bulk-edit/VariationsGeneralBulkEdit.vue";
import VariationsAmazonBulkEdit from "./containers/variations-amazon-bulk-edit/VariationsAmazonBulkEdit.vue";
import VariationsSheinBulkEdit from "./containers/variations-shein-bulk-edit/VariationsSheinBulkEdit.vue";
import VariationsEbayBulkEdit from "./containers/variations-ebay-bulk-edit/VariationsEbayBulkEdit.vue";
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import { injectAuth } from "../../../../../../../shared/modules/auth";
import { useRoute, useRouter } from "vue-router";


const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const auth = injectAuth();
const route = useRoute();
const router = useRouter();
const ids = ref([]);
const refetchNeeded = ref(false);
type Mode = 'list' | 'editContent' | 'editProperties' | 'editPrices' | 'editImages' | 'editDocuments' | 'editVideos' | 'editAmazon' | 'editShein' | 'editEbay' | 'editGeneral';
const mode = ref<Mode>('list');
const modeQueryKey = 'variationView';
const bulkEditRef = ref<InstanceType<typeof VariationsBulkEdit> | null>(null);
const contentEditRef = ref<InstanceType<typeof VariationsContentBulkEdit> | null>(null);
const priceEditRef = ref<InstanceType<typeof VariationsPricesBulkEdit> | null>(null);
const imageEditRef = ref<InstanceType<typeof VariationsImagesBulkEdit> | null>(null);
const documentEditRef = ref<InstanceType<typeof VariationsDocumentsBulkEdit> | null>(null);
const videoEditRef = ref<InstanceType<typeof VariationsVideosBulkEdit> | null>(null);
const generalEditRef = ref<InstanceType<typeof VariationsGeneralBulkEdit> | null>(null);
const amazonEditRef = ref<InstanceType<typeof VariationsAmazonBulkEdit> | null>(null);
const sheinEditRef = ref<InstanceType<typeof VariationsSheinBulkEdit> | null>(null);
const ebayEditRef = ref<InstanceType<typeof VariationsEbayBulkEdit> | null>(null);

const getUnsavedChangesForMode = (currentMode: Mode) => {
  if (currentMode === 'editContent') {
    return contentEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editProperties') {
    return bulkEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editPrices') {
    return priceEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editImages') {
    return imageEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editDocuments') {
    return documentEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editVideos') {
    return videoEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editAmazon') {
    return amazonEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editShein') {
    return sheinEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editEbay') {
    return ebayEditRef.value?.hasUnsavedChanges ?? false;
  }
  if (currentMode === 'editGeneral') {
    return generalEditRef.value?.hasUnsavedChanges ?? false;
  }
  return false;
};

const hasUnsavedChanges = computed(
  () =>
    (bulkEditRef.value?.hasUnsavedChanges ?? false) ||
    (contentEditRef.value?.hasUnsavedChanges ?? false) ||
    (priceEditRef.value?.hasUnsavedChanges ?? false) ||
    (imageEditRef.value?.hasUnsavedChanges ?? false) ||
    (documentEditRef.value?.hasUnsavedChanges ?? false) ||
    (videoEditRef.value?.hasUnsavedChanges ?? false) ||
    (amazonEditRef.value?.hasUnsavedChanges ?? false) ||
    (sheinEditRef.value?.hasUnsavedChanges ?? false) ||
    (ebayEditRef.value?.hasUnsavedChanges ?? false) ||
    (generalEditRef.value?.hasUnsavedChanges ?? false)
);

const hasAmazonIntegration = computed(() => Boolean(auth.user.company?.hasAmazonIntegration));
const hasSheinIntegration = computed(() => Boolean(auth.user.company?.hasSheinIntegration));
const hasEbayIntegration = computed(() => Boolean(auth.user.company?.hasEbayIntegration));

const tabs = computed<{ key: Mode; label: string; icon: string }[]>(() => {
  const items: { key: Mode; label: string; icon: string }[] = [
    { key: 'list', label: t('products.products.variations.tabs.list'), icon: 'list' },
    { key: 'editGeneral', label: t('products.products.variations.tabs.general'), icon: 'sliders' },
    { key: 'editContent', label: t('products.products.variations.tabs.content'), icon: 'file-lines' },
    { key: 'editProperties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
    { key: 'editPrices', label: t('products.products.tabs.prices'), icon: 'coins' },
    { key: 'editImages', label: t('products.products.variations.tabs.images'), icon: 'images' },
    { key: 'editDocuments', label: t('products.products.variations.tabs.documents'), icon: 'file-text' },
    { key: 'editVideos', label: t('products.products.variations.tabs.videos'), icon: 'video' },
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
const availableModes = computed<Mode[]>(() => tabs.value.map(tab => tab.key));

const searchConfig: SearchConfig = {
  search: true,
  orderKey: "sort",
  filters: [],
  orders: []
};

const handleVariationAdded = (response) => {
  refetchNeeded.value = true;
};

const handleRefeched = () => {
  refetchNeeded.value = false;
};

const getIds = (newIds) => {
  ids.value = newIds;
};

const getQuery = () => {
  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

  switch(type) {
    case ProductType.Bundle:
      return bundleVariationsQuery;
    case ProductType.Configurable:
      return configurableVariationsQuery;
    default:
      return null;
  }
};

const getQueryKey = () => {
  let type = props.product.type;

  if (type == ProductType.Alias) {
    type = props.product.aliasParentProduct.type;
  }

  switch(type) {
    case ProductType.Bundle:
      return 'bundleVariations';
    case ProductType.Configurable:
      return 'configurableVariations';
    default:
      return null;
  }
};

const changeMode = async (newMode: Mode) => {
  if (mode.value !== newMode && getUnsavedChangesForMode(mode.value)) {
    const res = await Swal.fire({
      icon: 'warning',
      text: t('products.products.messages.unsavedChanges'),
      showCancelButton: true,
      confirmButtonText: t('shared.button.cancel'),
      cancelButtonText: t('shared.button.leaveTab'),
    });
    if (res.dismiss !== Swal.DismissReason.cancel) {
      return;
    }
  }

  const normalizedMode = availableModes.value.includes(newMode) ? newMode : 'list';
  if (normalizedMode === mode.value) {
    return;
  }

  mode.value = normalizedMode;
  await updateModeQuery(normalizedMode);
};

const getModeFromQuery = (queryMode: unknown): Mode => {
  const candidate = Array.isArray(queryMode) ? queryMode[0] : queryMode;
  if (typeof candidate !== 'string') {
    return 'list';
  }

  return availableModes.value.includes(candidate as Mode) ? candidate as Mode : 'list';
};

const updateModeQuery = async (newMode: Mode, replace: boolean = false) => {
  if (route.query[modeQueryKey] === newMode) {
    return;
  }

  const nextQuery = {
    ...route.query,
    [modeQueryKey]: newMode,
  };

  if (replace) {
    await router.replace({ query: nextQuery });
    return;
  }

  await router.push({ query: nextQuery });
};

onMounted(async () => {
  const initialMode = getModeFromQuery(route.query[modeQueryKey]);
  if (mode.value !== initialMode) {
    mode.value = initialMode;
  }

  if (route.query[modeQueryKey] !== initialMode) {
    await updateModeQuery(initialMode, true);
  }
});

watch(
  () => route.query[modeQueryKey],
  async (queryMode) => {
    const nextMode = getModeFromQuery(queryMode);
    if (nextMode === mode.value) {
      if (queryMode !== nextMode) {
        await updateModeQuery(nextMode, true);
      }
      return;
    }

    const currentMode = mode.value;
    await changeMode(nextMode);

    if (mode.value !== nextMode) {
      await updateModeQuery(currentMode, true);
    }
  }
);

watch(
  availableModes,
  async () => {
    if (availableModes.value.includes(mode.value)) {
      return;
    }

    mode.value = 'list';
    await updateModeQuery('list', true);
  }
);

defineExpose({ hasUnsavedChanges });

</script>

<template>
  <TabContentTemplate>
    <template v-slot:content>
      <div class="flex">
        <div class="w-36 border-r border-gray-200 pr-4 space-y-2">
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

        <div class="flex-1 min-w-0 pl-4">
          <template v-if="mode === 'list'">
            <VariationsList
              :product="product"
              :query-key="getQueryKey()"
              :list-query="getQuery()"
              :search-config="searchConfig"
              :refetch-needed="refetchNeeded"
              @refetched="handleRefeched"
              @update-ids="getIds"
            />
            <div v-if="product.type !== ProductType.Alias" class="mt-2">
              <VariationCreate :product="product" :variation-ids="ids" @variation-added="handleVariationAdded" />
            </div>
          </template>
          <template v-else-if="mode === 'editContent'">
            <VariationsContentBulkEdit ref="contentEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editProperties'">
            <VariationsBulkEdit ref="bulkEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editPrices'">
            <VariationsPricesBulkEdit ref="priceEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editImages'">
            <VariationsImagesBulkEdit ref="imageEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editDocuments'">
            <VariationsDocumentsBulkEdit ref="documentEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editVideos'">
            <VariationsVideosBulkEdit ref="videoEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editAmazon'">
            <VariationsAmazonBulkEdit ref="amazonEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editEbay'">
            <VariationsEbayBulkEdit ref="ebayEditRef" :product="product" />
          </template>
          <template v-else-if="mode === 'editShein'">
            <VariationsSheinBulkEdit ref="sheinEditRef" :product="product" />
          </template>
          <template v-else>
            <VariationsGeneralBulkEdit ref="generalEditRef" :product="product" />
          </template>
        </div>
      </div>
    </template>
  </TabContentTemplate>
</template>
