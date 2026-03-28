<script setup lang="ts">
import { computed, ref, unref, watch } from 'vue';
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
import VariationsDocumentsBulkEdit from "../product-show/containers/tabs/variations/containers/variations-documents-bulk-edit/VariationsDocumentsBulkEdit.vue";
import VariationsVideosBulkEdit from "../product-show/containers/tabs/variations/containers/variations-videos-bulk-edit/VariationsVideosBulkEdit.vue";
import VariationsEanCodesBulkEdit from "../product-show/containers/tabs/variations/containers/variations-ean-codes-bulk-edit/VariationsEanCodesBulkEdit.vue";
import VariationsAmazonBulkEdit from "../product-show/containers/tabs/variations/containers/variations-amazon-bulk-edit/VariationsAmazonBulkEdit.vue";
import VariationsSheinBulkEdit from "../product-show/containers/tabs/variations/containers/variations-shein-bulk-edit/VariationsSheinBulkEdit.vue";
import VariationsEbayBulkEdit from "../product-show/containers/tabs/variations/containers/variations-ebay-bulk-edit/VariationsEbayBulkEdit.vue";
import VariationsMiraklBulkEdit from "../product-show/containers/tabs/variations/containers/variations-mirakl-bulk-edit/VariationsMiraklBulkEdit.vue";
import { injectAuth } from "../../../../shared/modules/auth";
import Swal from 'sweetalert2';

type Mode = 'editGeneral' | 'editContent' | 'editProperties' | 'editPrices' | 'editEanCodes' | 'editImages' | 'editDocuments' | 'editVideos' | 'editAmazon' | 'editShein' | 'editEbay' | 'editMirakl';

const { t } = useI18n();
const auth = injectAuth();
const route = useRoute();
const router = useRouter();
const mode = ref<Mode>('editGeneral');
const generalEditRef = ref<InstanceType<typeof VariationsGeneralBulkEdit> | null>(null);
const contentEditRef = ref<InstanceType<typeof VariationsContentBulkEdit> | null>(null);
const bulkEditRef = ref<InstanceType<typeof VariationsBulkEdit> | null>(null);
const priceEditRef = ref<InstanceType<typeof VariationsPricesBulkEdit> | null>(null);
const eanCodesEditRef = ref<InstanceType<typeof VariationsEanCodesBulkEdit> | null>(null);
const imageEditRef = ref<InstanceType<typeof VariationsImagesBulkEdit> | null>(null);
const documentEditRef = ref<InstanceType<typeof VariationsDocumentsBulkEdit> | null>(null);
const videoEditRef = ref<InstanceType<typeof VariationsVideosBulkEdit> | null>(null);
const amazonEditRef = ref<InstanceType<typeof VariationsAmazonBulkEdit> | null>(null);
const sheinEditRef = ref<InstanceType<typeof VariationsSheinBulkEdit> | null>(null);
const ebayEditRef = ref<InstanceType<typeof VariationsEbayBulkEdit> | null>(null);
const miraklEditRef = ref<InstanceType<typeof VariationsMiraklBulkEdit> | null>(null);

const hasAmazonIntegration = computed(() => Boolean(auth.user.company?.hasAmazonIntegration));
const hasSheinIntegration = computed(() => Boolean(auth.user.company?.hasSheinIntegration));
const hasEbayIntegration = computed(() => Boolean(auth.user.company?.hasEbayIntegration));
const hasMiraklIntegration = computed(() => Boolean(auth.user.company?.hasMiraklIntegration));

const tabs = computed<{ key: Mode; label: string; icon: string }[]>(() => {
  const items: { key: Mode; label: string; icon: string }[] = [
    { key: 'editGeneral', label: t('products.products.variations.tabs.general'), icon: 'sliders' },
    { key: 'editContent', label: t('products.products.variations.tabs.content'), icon: 'file-lines' },
    { key: 'editProperties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
    { key: 'editPrices', label: t('products.products.tabs.prices'), icon: 'coins' },
    { key: 'editEanCodes', label: t('products.products.tabs.eanCodes'), icon: 'qrcode' },
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

  if (hasMiraklIntegration.value) {
    items.push({ key: 'editMirakl', label: t('products.products.variations.tabs.mirakl'), icon: 'store' });
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

const getUnsavedChangesForMode = (currentMode: Mode) => {
  if (currentMode === 'editGeneral') {
    return unref(generalEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editContent') {
    return unref(contentEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editProperties') {
    return unref(bulkEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editPrices') {
    return unref(priceEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editEanCodes') {
    return unref(eanCodesEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editImages') {
    return unref(imageEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editDocuments') {
    return unref(documentEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editVideos') {
    return unref(videoEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editAmazon') {
    return unref(amazonEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editShein') {
    return unref(sheinEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editEbay') {
    return unref(ebayEditRef.value?.hasUnsavedChanges) ?? false;
  }
  if (currentMode === 'editMirakl') {
    return unref(miraklEditRef.value?.hasUnsavedChanges) ?? false;
  }
  return false;
};

const changeMode = async (newMode: Mode) => {
  if (mode.value === newMode) {
    return;
  }

  if (getUnsavedChangesForMode(mode.value)) {
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

  mode.value = newMode;
  await router.replace({ query: { ...route.query, tab: newMode } });
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
              <VariationsGeneralBulkEdit ref="generalEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editContent'">
              <VariationsContentBulkEdit ref="contentEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editProperties'">
              <VariationsBulkEdit ref="bulkEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editPrices'">
              <VariationsPricesBulkEdit ref="priceEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editEanCodes'">
              <VariationsEanCodesBulkEdit ref="eanCodesEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editImages'">
              <VariationsImagesBulkEdit ref="imageEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editDocuments'">
              <VariationsDocumentsBulkEdit ref="documentEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editVideos'">
              <VariationsVideosBulkEdit ref="videoEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editAmazon'">
              <VariationsAmazonBulkEdit ref="amazonEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editEbay'">
              <VariationsEbayBulkEdit ref="ebayEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editShein'">
              <VariationsSheinBulkEdit ref="sheinEditRef" :product-ids="productIds" />
            </template>
            <template v-else-if="mode === 'editMirakl'">
              <VariationsMiraklBulkEdit ref="miraklEditRef" :product-ids="productIds" />
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
