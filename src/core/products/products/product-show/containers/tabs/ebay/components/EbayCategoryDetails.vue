<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../../shared/modules/toast';
import type { EbayCategoryNode } from './ebayCategoryUtils';

const props = defineProps<{
  category: EbayCategoryNode | null;
}>();

const { t } = useI18n();

const configuratorProperties = computed(
  () => props.category?.configuratorProperties ?? [],
);

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
    <div class="text-sm font-medium">{{ category.fullName || category.name }}</div>
    <div class="text-xs text-gray-500 flex items-center gap-2">
      <span>{{ category.remoteId }}</span>
      <button
        class="p-1 rounded hover:bg-gray-100"
        type="button"
        @click="copyCategoryId(category.remoteId)"
      >
        <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>
    <div class="mt-3">
      <h6 class="font-semibold text-xs text-gray-700 mb-1">
        {{ t('products.products.ebay.configuratorPreview.title') }}
      </h6>
      <p class="text-xs text-gray-500 mb-2">
        {{ t('products.products.ebay.configuratorPreview.description') }}
      </p>
      <ul v-if="configuratorProperties.length" class="space-y-1">
        <li
          v-for="item in configuratorProperties"
          :key="item"
          class="flex items-center gap-2 text-xs text-gray-700"
        >
          <Icon name="circle-check" class="w-3 h-3 text-emerald-500" />
          <span>{{ item }}</span>
        </li>
      </ul>
      <div v-else class="text-xs text-gray-500">
        {{ t('products.products.ebay.configuratorPreview.empty') }}
      </div>
    </div>
  </div>
</template>
