<script setup lang="ts">
import { ref, computed } from 'vue';
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
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';


const props = defineProps<{ product: Product }>();
const { t } = useI18n();
const ids = ref([]);
const refetchNeeded = ref(false);
type Mode = 'list' | 'editContent' | 'editProperties' | 'editPrices' | 'editImages';
const mode = ref<Mode>('list');
const bulkEditRef = ref<InstanceType<typeof VariationsBulkEdit> | null>(null);
const contentEditRef = ref<InstanceType<typeof VariationsContentBulkEdit> | null>(null);
const priceEditRef = ref<InstanceType<typeof VariationsPricesBulkEdit> | null>(null);
const imageEditRef = ref<InstanceType<typeof VariationsImagesBulkEdit> | null>(null);

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
  return false;
};

const hasUnsavedChanges = computed(
  () =>
    (bulkEditRef.value?.hasUnsavedChanges ?? false) ||
    (contentEditRef.value?.hasUnsavedChanges ?? false) ||
    (priceEditRef.value?.hasUnsavedChanges ?? false) ||
    (imageEditRef.value?.hasUnsavedChanges ?? false)
);

const tabs = computed<{ key: Mode; label: string; icon: string }[]>(() => [
  { key: 'list', label: t('products.products.variations.tabs.list'), icon: 'list' },
  { key: 'editContent', label: t('products.products.variations.tabs.content'), icon: 'file-lines' },
  { key: 'editProperties', label: t('products.products.tabs.properties'), icon: 'screwdriver-wrench' },
  { key: 'editPrices', label: t('products.products.tabs.prices'), icon: 'coins' },
  { key: 'editImages', label: t('products.products.variations.tabs.images'), icon: 'images' },
]);

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
  mode.value = newMode;
};

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
          <template v-else>
            <VariationsImagesBulkEdit ref="imageEditRef" :product="product" />
          </template>
        </div>
      </div>
    </template>
  </TabContentTemplate>
</template>
