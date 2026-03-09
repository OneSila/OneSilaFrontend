<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { displayApolloError, processGraphQLErrors } from '../../../../../../../../shared/utils';
import {
  createEbayProductStoreCategoryMutation,
  deleteEbayProductStoreCategoryMutation,
  updateEbayProductStoreCategoryMutation,
} from '../../../../../../../../shared/api/mutations/ebayProducts.js';
import { ebayStoreCategoriesQuery } from '../../../../../../../../shared/api/queries/ebayStoreCategories.js';
import EbayCategoryDualSelectionPreview from './EbayCategoryDualSelectionPreview.vue';
import EbayStoreCategoryBrowser from './EbayStoreCategoryBrowser.vue';
import EbayStoreCategoryDetails from './EbayStoreCategoryDetails.vue';
import {
  mapStoreCategoriesConnection,
  type EbayStoreCategoryNode,
} from './ebayStoreCategoryUtils';
import {
  resolveDefaultCategoryTarget,
  type EbayCategoryTarget,
} from './ebayCategoryUtils';

const props = defineProps<{
  productId: string | null;
  salesChannelId: string | null;
  category: {
    id: string | null;
    primaryRemoteId: string | null;
    secondaryRemoteId?: string | null;
  } | null;
}>();

const emit = defineEmits<{
  (e: 'saved', payload: { id: string; salesChannelId: string | null; primaryRemoteId: string; secondaryRemoteId: string | null }): void;
  (e: 'deleted'): void;
}>();

const { t } = useI18n();

const mainNode = ref<EbayStoreCategoryNode | null>(null);
const secondaryNode = ref<EbayStoreCategoryNode | null>(null);
const savedMainNode = ref<EbayStoreCategoryNode | null>(null);
const savedSecondaryNode = ref<EbayStoreCategoryNode | null>(null);
const savedPrimaryRemoteId = ref<string | null>(null);
const savedSecondaryRemoteId = ref<string | null>(null);
const productStoreCategoryId = ref<string | null>(null);
const selectedTarget = ref<EbayCategoryTarget>('main');
const loadingSelected = ref(false);
const saving = ref(false);
const manualCategoryInput = ref('');
const manualSelectionLoading = ref(false);
const manualSelectionError = ref<string | null>(null);
const slotErrors = ref<{ main: string | null; secondary: string | null }>({
  main: null,
  secondary: null,
});

const manualCategoryId = computed(() => manualCategoryInput.value.trim());
const mainRemoteId = computed(() => mainNode.value?.remoteId || null);
const secondaryRemoteId = computed(() => secondaryNode.value?.remoteId || null);
const secondaryDisabled = computed(() => !mainRemoteId.value);
const duplicateCategoryErrorText = computed(
  () => t('products.products.ebay.selectionSlots.sameCategoryError'),
);
const hasDuplicateCategorySelection = computed(
  () => Boolean(mainRemoteId.value && secondaryRemoteId.value && mainRemoteId.value === secondaryRemoteId.value),
);
const mainValidationError = computed(
  () => slotErrors.value.main || (hasDuplicateCategorySelection.value ? duplicateCategoryErrorText.value : null),
);
const secondaryValidationError = computed(
  () => slotErrors.value.secondary || (hasDuplicateCategorySelection.value ? duplicateCategoryErrorText.value : null),
);

const hasUnsavedChanges = computed(
  () =>
    mainRemoteId.value !== savedPrimaryRemoteId.value ||
    secondaryRemoteId.value !== savedSecondaryRemoteId.value,
);

const pendingActiveCategoryNode = computed(() =>
  selectedTarget.value === 'secondary' ? secondaryNode.value : mainNode.value,
);

const currentActiveCategoryNode = computed(() =>
  selectedTarget.value === 'secondary' ? savedSecondaryNode.value : savedMainNode.value,
);

const clearSlotErrors = () => {
  slotErrors.value = { main: null, secondary: null };
};

const fetchStoreCategoryDetails = async (remoteId: string): Promise<EbayStoreCategoryNode | null> => {
  if (!props.salesChannelId) {
    return null;
  }
  try {
    const { data } = await apolloClient.query({
      query: ebayStoreCategoriesQuery,
      variables: {
        first: 1,
        filter: {
          salesChannel: { id: { exact: props.salesChannelId } },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: 'network-only',
    });
    const nodes = mapStoreCategoriesConnection(data?.ebayStoreCategories);
    return nodes[0] || null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const fetchSelected = async () => {
  savedPrimaryRemoteId.value = props.category?.primaryRemoteId || null;
  savedSecondaryRemoteId.value = props.category?.secondaryRemoteId || null;
  productStoreCategoryId.value = props.category?.id || null;

  if (!savedPrimaryRemoteId.value && !savedSecondaryRemoteId.value) {
    mainNode.value = null;
    secondaryNode.value = null;
    savedMainNode.value = null;
    savedSecondaryNode.value = null;
    selectedTarget.value = resolveDefaultCategoryTarget(null, null);
    clearSlotErrors();
    return;
  }

  loadingSelected.value = true;
  try {
    const [main, secondary] = await Promise.all([
      savedPrimaryRemoteId.value ? fetchStoreCategoryDetails(savedPrimaryRemoteId.value) : null,
      savedSecondaryRemoteId.value ? fetchStoreCategoryDetails(savedSecondaryRemoteId.value) : null,
    ]);
    mainNode.value = main;
    secondaryNode.value = secondary;
    savedMainNode.value = main;
    savedSecondaryNode.value = secondary;
    selectedTarget.value = resolveDefaultCategoryTarget(savedPrimaryRemoteId.value, savedSecondaryRemoteId.value);
    clearSlotErrors();
  } finally {
    loadingSelected.value = false;
  }
};

watch(
  () => props.category,
  () => {
    void fetchSelected();
  },
  { immediate: true },
);

watch(
  () => props.salesChannelId,
  () => {
    manualCategoryInput.value = '';
    manualSelectionError.value = null;
    void fetchSelected();
  },
);

watch(
  manualCategoryInput,
  () => {
    manualSelectionError.value = null;
  },
);

watch(
  [mainRemoteId, secondaryRemoteId],
  ([mainValue]) => {
    clearSlotErrors();
    if (!mainValue && selectedTarget.value === 'secondary') {
      selectedTarget.value = 'main';
    }
  },
);

watch(
  mainRemoteId,
  (mainValue) => {
    if (!mainValue && secondaryNode.value) {
      secondaryNode.value = null;
    }
  },
);

const setSelectedTarget = (target: EbayCategoryTarget) => {
  clearSlotErrors();
  if (target === 'secondary' && secondaryDisabled.value) {
    return;
  }
  selectedTarget.value = target;
};

const applySelectedNode = (node: EbayStoreCategoryNode) => {
  clearSlotErrors();
  if (selectedTarget.value === 'secondary') {
    if (secondaryDisabled.value) {
      mainNode.value = node;
      selectedTarget.value = 'secondary';
      return;
    }
    secondaryNode.value = node;
    return;
  }
  const hadMainSelection = Boolean(mainNode.value?.remoteId);
  const hadSecondarySelection = Boolean(secondaryNode.value?.remoteId);
  mainNode.value = node;
  if (!hadMainSelection && !hadSecondarySelection) {
    selectedTarget.value = 'secondary';
  }
};

const clearSecondarySelection = () => {
  clearSlotErrors();
  secondaryNode.value = null;
};

const cancelSelection = () => {
  void fetchSelected();
};

const saveSelection = async () => {
  if (!props.productId || !props.salesChannelId || !mainNode.value?.id) {
    return;
  }
  if (hasDuplicateCategorySelection.value) {
    slotErrors.value = {
      main: duplicateCategoryErrorText.value,
      secondary: duplicateCategoryErrorText.value,
    };
    return;
  }

  saving.value = true;
  clearSlotErrors();
  try {
    const primaryStoreCategoryId = mainNode.value.id;
    const secondaryStoreCategoryId = secondaryNode.value?.id || null;

    if (productStoreCategoryId.value) {
      await apolloClient.mutate({
        mutation: updateEbayProductStoreCategoryMutation,
        variables: {
          data: {
            id: productStoreCategoryId.value,
            primaryStoreCategory: { id: primaryStoreCategoryId },
            secondaryStoreCategory: secondaryStoreCategoryId ? { id: secondaryStoreCategoryId } : null,
          },
        },
      });
    } else {
      const { data } = await apolloClient.mutate({
        mutation: createEbayProductStoreCategoryMutation,
        variables: {
          data: {
            product: { id: props.productId },
            salesChannel: { id: props.salesChannelId },
            primaryStoreCategory: { id: primaryStoreCategoryId },
            secondaryStoreCategory: secondaryStoreCategoryId ? { id: secondaryStoreCategoryId } : null,
          },
        },
      });
      productStoreCategoryId.value = data?.createEbayProductStoreCategory?.id || null;
    }

    savedPrimaryRemoteId.value = mainNode.value.remoteId;
    savedSecondaryRemoteId.value = secondaryNode.value?.remoteId || null;
    savedMainNode.value = mainNode.value;
    savedSecondaryNode.value = secondaryNode.value;
    selectedTarget.value = resolveDefaultCategoryTarget(savedPrimaryRemoteId.value, savedSecondaryRemoteId.value);

    if (productStoreCategoryId.value) {
      emit('saved', {
        id: productStoreCategoryId.value,
        salesChannelId: props.salesChannelId || null,
        primaryRemoteId: savedPrimaryRemoteId.value || '',
        secondaryRemoteId: savedSecondaryRemoteId.value,
      });
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t) as Record<string, any>;
    const mainError = validationErrors.primaryStoreCategory || validationErrors.primaryStoreCategoryId || null;
    const secondaryError = validationErrors.secondaryStoreCategory || validationErrors.secondaryStoreCategoryId || null;
    const allMessage = validationErrors.__all__ ? String(validationErrors.__all__) : '';
    const sameCategoryInAll = allMessage.toLowerCase().includes('primary and secondary store categories cannot be the same');
    if (mainError || secondaryError || sameCategoryInAll) {
      slotErrors.value = {
        main: mainError || (sameCategoryInAll ? duplicateCategoryErrorText.value : null),
        secondary: secondaryError || (sameCategoryInAll ? duplicateCategoryErrorText.value : null),
      };
      return;
    }
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const removeSelection = async () => {
  if (!productStoreCategoryId.value) {
    return;
  }
  saving.value = true;
  try {
    await apolloClient.mutate({
      mutation: deleteEbayProductStoreCategoryMutation,
      variables: { data: { id: productStoreCategoryId.value } },
    });
    productStoreCategoryId.value = null;
    savedPrimaryRemoteId.value = null;
    savedSecondaryRemoteId.value = null;
    mainNode.value = null;
    secondaryNode.value = null;
    savedMainNode.value = null;
    savedSecondaryNode.value = null;
    clearSlotErrors();
    selectedTarget.value = 'main';
    emit('deleted');
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const setManualCategory = async () => {
  if (!manualCategoryId.value || manualSelectionLoading.value) return;
  manualSelectionLoading.value = true;
  manualSelectionError.value = null;
  try {
    const node = await fetchStoreCategoryDetails(manualCategoryId.value);
    if (!node) {
      manualSelectionError.value = t('products.products.ebay.storeCategories.manualEntry.invalid');
      return;
    }
    applySelectedNode(node);
  } finally {
    manualSelectionLoading.value = false;
  }
};

const hasSalesChannel = computed(() => Boolean(props.salesChannelId));

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div>
    <h4 class="font-semibold mb-2">{{ t('products.products.ebay.storeCategories.title') }}</h4>
    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.ebay.storeCategories.description') }}
    </p>

    <div class="bg-blue-50 border rounded mt-4 p-6">
      <div v-if="!hasSalesChannel" class="text-sm text-gray-600">
        {{ t('products.products.ebay.storeCategories.selectSalesChannelPrompt') }}
      </div>
      <div v-else class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-1/2">
          <EbayStoreCategoryBrowser
            :sales-channel-id="salesChannelId"
            @selected="({ node }) => applySelectedNode(node)"
          >
            <template #after-search>
              <div class="border rounded bg-white p-4">
                <h6 class="font-semibold text-sm mb-1">
                  {{ t('products.products.ebay.manualEntry.title') }}
                </h6>
                <p class="text-xs text-gray-500 mb-3">
                  {{ t('products.products.ebay.storeCategories.manualEntry.description') }}
                </p>
                <div class="flex flex-col sm:flex-row gap-2">
                  <input
                    v-model="manualCategoryInput"
                    type="text"
                    class="form-input flex-1"
                    :placeholder="t('products.products.ebay.manualEntry.placeholder')"
                    @keyup.enter="setManualCategory"
                  />
                  <Button
                    class="btn btn-sm btn-outline-primary"
                    :disabled="manualSelectionLoading || !manualCategoryId"
                    :loading="manualSelectionLoading"
                    @click="setManualCategory"
                  >
                    {{ t('products.products.ebay.manualEntry.button') }}
                  </Button>
                </div>
                <p v-if="manualSelectionError" class="text-xs text-red-600 mt-2">
                  {{ manualSelectionError }}
                </p>
              </div>
            </template>
          </EbayStoreCategoryBrowser>
        </div>

        <div class="lg:w-1/2 space-y-4">
          <div class="min-h-[56px] border rounded p-3 bg-white">
            <div v-if="loadingSelected">
              <LocalLoader :loading="true" />
            </div>
            <EbayCategoryDualSelectionPreview
              v-else
              :main-category="mainNode"
              :secondary-category="secondaryNode"
              :previous-main-category="savedMainNode"
              :previous-secondary-category="savedSecondaryNode"
              :main-error="mainValidationError"
              :secondary-error="secondaryValidationError"
              :selected-target="selectedTarget"
              :secondary-disabled="secondaryDisabled"
              @target-change="setSelectedTarget"
              @clear-secondary="clearSecondarySelection"
            />
          </div>

          <div class="border rounded p-3 bg-white">
            <h6 class="font-semibold text-sm mb-2">
              {{ t('products.products.ebay.currentSelection') }}
            </h6>
            <EbayStoreCategoryDetails v-if="currentActiveCategoryNode" :category="currentActiveCategoryNode" />
            <div v-else class="text-sm text-gray-500">
              {{ t('products.products.ebay.noSelection') }}
            </div>
          </div>

          <div class="border rounded p-3 bg-white">
            <h6 class="font-semibold text-sm mb-2">
              {{ t('products.products.ebay.pendingSelection') }}
            </h6>
            <EbayStoreCategoryDetails
              v-if="hasUnsavedChanges && pendingActiveCategoryNode"
              :category="pendingActiveCategoryNode"
            />
            <div v-else class="text-sm text-gray-500">
              {{ t('products.products.ebay.noSelection') }}
            </div>
          </div>

          <div class="mt-3 flex gap-2">
            <Button
              class="btn btn-sm btn-primary"
              :disabled="saving || !hasUnsavedChanges || !mainNode?.id"
              @click="saveSelection"
            >
              {{ t('shared.button.save') }}
            </Button>
            <Button
              class="btn btn-sm btn-outline-dark"
              :disabled="saving || !hasUnsavedChanges"
              @click="cancelSelection"
            >
              {{ t('shared.button.cancel') }}
            </Button>
          </div>

          <div v-if="productStoreCategoryId" class="flex gap-2">
            <Button
              class="btn btn-sm btn-outline-danger"
              :disabled="saving"
              @click="removeSelection"
            >
              {{ t('products.products.ebay.storeCategories.remove') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
