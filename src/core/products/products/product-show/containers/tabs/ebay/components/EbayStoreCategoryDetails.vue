<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../../shared/modules/toast';
import type { EbayStoreCategoryNode } from './ebayStoreCategoryUtils';

defineProps<{
  category: EbayStoreCategoryNode | null;
}>();

const { t } = useI18n();

const copyCategoryId = async (remoteId?: string | null) => {
  if (!remoteId) return;
  try {
    await navigator.clipboard.writeText(remoteId);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};
</script>

<template>
  <div v-if="category">
    <div class="text-sm font-medium">{{ category.fullPath || category.name }}</div>
    <div class="text-xs text-gray-500 flex items-center gap-2 mt-1">
      <span>{{ category.remoteId }}</span>
      <button
        class="p-1 rounded hover:bg-gray-100"
        type="button"
        @click="copyCategoryId(category.remoteId)"
      >
        <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>
    <div class="text-xs text-gray-500 mt-1">
      {{ t('products.products.ebay.storeCategories.detailsMeta', { level: category.level, order: category.order }) }}
    </div>
  </div>
</template>
