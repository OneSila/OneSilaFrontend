<script setup lang="ts">
import { computed } from 'vue';
import AmazonDocumentTypeCategoriesList from './AmazonDocumentTypeCategoriesList.vue';
import EbayDocumentTypeCategoriesList from './EbayDocumentTypeCategoriesList.vue';
import MiraklDocumentTypeCategoriesList from './MiraklDocumentTypeCategoriesList.vue';
import SheinDocumentTypeCategoriesList from './SheinDocumentTypeCategoriesList.vue';

type CategoryId = string | number;

const props = defineProps<{
  type: string;
  modelValue: CategoryId[];
  categoryKind: 'required' | 'optional';
  salesChannelId?: string | null;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: CategoryId[]): void;
}>();

const currentComponent = computed(() => {
  switch (props.type) {
    case 'amazon':
      return AmazonDocumentTypeCategoriesList;
    case 'ebay':
      return EbayDocumentTypeCategoriesList;
    case 'mirakl':
      return MiraklDocumentTypeCategoriesList;
    case 'shein':
      return SheinDocumentTypeCategoriesList;
    default:
      return null;
  }
});

const updateValue = (value: CategoryId[]) => {
  emit('update:modelValue', value);
};

const componentProps = computed(() =>
  props.type === 'ebay' || props.type === 'amazon' || props.type === 'mirakl' || props.type === 'shein'
    ? {
      salesChannelId: props.salesChannelId ?? null,
      errorMessage: props.errorMessage ?? '',
    }
    : { errorMessage: props.errorMessage ?? '' },
);
</script>

<template>
  <component
    :is="currentComponent"
    v-if="currentComponent"
    :model-value="modelValue"
    :category-kind="categoryKind"
    v-bind="componentProps"
    @update:model-value="updateValue"
  />
</template>
