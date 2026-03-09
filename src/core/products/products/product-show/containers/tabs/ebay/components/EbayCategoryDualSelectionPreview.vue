<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import type { EbayCategoryTarget } from './ebayCategoryUtils';

interface EbayPreviewCategoryNode {
  remoteId: string;
  name: string;
  fullName?: string | null;
  fullPath?: string | null;
}

const props = withDefaults(defineProps<{
  mainCategory: EbayPreviewCategoryNode | null;
  secondaryCategory: EbayPreviewCategoryNode | null;
  previousMainCategory?: EbayPreviewCategoryNode | null;
  previousSecondaryCategory?: EbayPreviewCategoryNode | null;
  selectedTarget: EbayCategoryTarget;
  secondaryDisabled: boolean;
  mainError?: string | null;
  secondaryError?: string | null;
  defaultCategory?: { remoteId: string | null; name: string | null } | null;
  readOnly?: boolean;
}>(), {
  previousMainCategory: null,
  previousSecondaryCategory: null,
  mainError: null,
  secondaryError: null,
  defaultCategory: null,
  readOnly: false,
});

const emit = defineEmits<{
  (e: 'target-change', target: EbayCategoryTarget): void;
  (e: 'clear-secondary'): void;
}>();

const { t } = useI18n();

const mainDisplay = computed(() => {
  if (props.mainCategory) {
    return {
      title: props.mainCategory.fullName || props.mainCategory.fullPath || props.mainCategory.name || props.mainCategory.remoteId,
      remoteId: props.mainCategory.remoteId,
      isDefault: false,
    };
  }
  if (props.defaultCategory?.remoteId) {
    return {
      title: props.defaultCategory.name || props.defaultCategory.remoteId,
      remoteId: props.defaultCategory.remoteId,
      isDefault: true,
    };
  }
  return null;
});

const selectTarget = (target: EbayCategoryTarget) => {
  if (props.readOnly) return;
  if (target === 'secondary' && props.secondaryDisabled) return;
  emit('target-change', target);
};

const clearSecondary = () => {
  if (props.readOnly || !props.secondaryCategory) return;
  emit('clear-secondary');
};

const getCategoryLabel = (category: EbayPreviewCategoryNode | null | undefined) => {
  if (!category?.remoteId) {
    return t('products.products.ebay.noSelection');
  }
  return category.fullName || category.fullPath || category.name || category.remoteId;
};

const hasMainChanged = computed(
  () => (props.previousMainCategory?.remoteId || null) !== (props.mainCategory?.remoteId || null),
);

const hasSecondaryChanged = computed(
  () => (props.previousSecondaryCategory?.remoteId || null) !== (props.secondaryCategory?.remoteId || null),
);

const hasChanges = computed(
  () => hasMainChanged.value || hasSecondaryChanged.value,
);

const getChangeText = (target: EbayCategoryTarget) => {
  const previous = target === 'main' ? props.previousMainCategory : props.previousSecondaryCategory;
  const current = target === 'main' ? props.mainCategory : props.secondaryCategory;
  return t('products.products.ebay.selectionSlots.changePattern', {
    from: getCategoryLabel(previous),
    to: getCategoryLabel(current),
  });
};

const getCardClass = (target: EbayCategoryTarget) => {
  const isSelected = props.selectedTarget === target;
  const isDisabled = target === 'secondary' && props.secondaryDisabled;
  const hasError = target === 'main' ? Boolean(props.mainError) : Boolean(props.secondaryError);
  return [
    'rounded-lg border border-dashed p-3 transition-colors',
    hasError ? 'border-danger bg-danger-light/20' : (isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'),
    !props.readOnly && !isDisabled ? 'cursor-pointer hover:border-blue-400' : '',
    isDisabled ? 'opacity-60 cursor-not-allowed' : '',
    hasError ? 'blink-animation' : '',
  ];
};
</script>

<template>
  <div class="space-y-3">
    <p v-if="!readOnly" class="text-xs text-gray-500">
      {{ t('products.products.ebay.selectionSlots.targetHint') }}
    </p>

    <div
      :class="getCardClass('main')"
      role="button"
      tabindex="0"
      @click="selectTarget('main')"
      @keyup.enter="selectTarget('main')"
      @keyup.space.prevent="selectTarget('main')"
    >
      <div class="flex items-center justify-between gap-2">
        <h6 class="font-semibold text-sm text-gray-800">
          {{ t('products.products.ebay.selectionSlots.mainTitle') }}
        </h6>
        <Icon
          v-if="selectedTarget === 'main'"
          name="check-circle"
          class="w-4 h-4 text-blue-500"
        />
      </div>

      <div v-if="mainDisplay" class="mt-2">
        <div class="text-sm text-gray-900">
          {{ mainDisplay.title }}
        </div>
        <div class="text-xs text-gray-500">
          {{ t('products.products.ebay.defaultCategoryInfo', { id: mainDisplay.remoteId }) }}
        </div>
        <div v-if="mainDisplay.isDefault" class="text-xs text-amber-700 mt-1">
          {{ t('products.products.ebay.defaultCategoryTitle') }}
        </div>
      </div>
      <div v-else class="mt-2 text-sm text-gray-500">
        {{ t('products.products.ebay.noSelection') }}
      </div>
      <div v-if="mainError" class="mt-2 text-danger text-small blink-animation">
        {{ mainError }}
      </div>
    </div>

    <div
      :class="getCardClass('secondary')"
      role="button"
      tabindex="0"
      @click="selectTarget('secondary')"
      @keyup.enter="selectTarget('secondary')"
      @keyup.space.prevent="selectTarget('secondary')"
    >
      <div class="flex items-center justify-between gap-2">
        <h6 class="font-semibold text-sm text-gray-800">
          {{ t('products.products.ebay.selectionSlots.secondaryTitle') }}
        </h6>
        <div class="flex items-center gap-2">
          <Icon
            v-if="selectedTarget === 'secondary'"
            name="check-circle"
            class="w-4 h-4 text-blue-500"
          />
          <button
            v-if="!readOnly && secondaryCategory"
            type="button"
            class="h-4 w-4 rounded-full bg-red-500 text-white text-[10px] leading-none flex items-center justify-center hover:bg-red-600"
            :title="t('shared.button.remove')"
            :aria-label="t('shared.button.remove')"
            @click.stop="clearSecondary"
          >
            x
          </button>
        </div>
      </div>

      <div v-if="secondaryCategory" class="mt-2">
        <div class="text-sm text-gray-900">
          {{ secondaryCategory.fullName || secondaryCategory.fullPath || secondaryCategory.name || secondaryCategory.remoteId }}
        </div>
        <div class="text-xs text-gray-500">
          {{ t('products.products.ebay.defaultCategoryInfo', { id: secondaryCategory.remoteId }) }}
        </div>
      </div>
      <div v-else class="mt-2 text-sm text-gray-500">
        {{ t('products.products.ebay.noSelection') }}
      </div>

      <div v-if="secondaryDisabled" class="mt-2 text-xs text-gray-500">
        {{ t('products.products.ebay.selectionSlots.secondaryDisabled') }}
      </div>
      <div v-if="secondaryError" class="mt-2 text-danger text-small blink-animation">
        {{ secondaryError }}
      </div>
    </div>

    <div v-if="!readOnly && hasChanges" class="rounded border border-gray-200 bg-white p-3">
      <div class="text-xs font-semibold text-gray-700 mb-2">
        {{ t('products.products.ebay.selectionSlots.changeTitle') }}
      </div>
      <div v-if="hasMainChanged" class="text-xs text-gray-700">
        <span class="font-semibold">{{ t('products.products.ebay.selectionSlots.mainTitle') }}:</span>
        <span class="ml-1">{{ getChangeText('main') }}</span>
      </div>
      <div v-if="hasSecondaryChanged" class="text-xs text-gray-700 mt-1">
        <span class="font-semibold">{{ t('products.products.ebay.selectionSlots.secondaryTitle') }}:</span>
        <span class="ml-1">{{ getChangeText('secondary') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blink-animation {
  animation: blink-border 0.9s step-start infinite;
}

@keyframes blink-border {
  50% {
    opacity: 0.45;
  }
}
</style>
