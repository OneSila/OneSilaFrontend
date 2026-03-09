<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError, processGraphQLErrors } from '../../../../../../../../shared/utils';
import { ebayCategoriesQuery } from '../../../../../../../../shared/api/queries/ebayCategories.js';
import {
  createEbayProductCategoryMutation,
  updateEbayProductCategoryMutation,
  deleteEbayProductCategoryMutation,
} from '../../../../../../../../shared/api/mutations/ebayProducts.js';
import EbayCategoryDetails from './EbayCategoryDetails.vue';
import EbayCategoryDualSelectionPreview from './EbayCategoryDualSelectionPreview.vue';
import EbayCategorySuggestion from './EbayCategorySuggestion.vue';
import {
  mapCategoriesConnection,
  resolveDefaultCategoryTarget,
  type EbayCategoryNode,
  type EbayCategoryTarget,
} from './ebayCategoryUtils';

const props = defineProps<{
  productId: string | null;
  salesChannelId: string | null;
  productName?: string | null;
  view: any | null;
  category: {
    id: string | null;
    remoteId: string | null;
    secondaryCategoryId?: string | null;
    salesChannelId?: string | null;
  } | null;
  defaultCategory: { remoteId: string | null; name: string | null } | null;
}>();

const emit = defineEmits<{
  (e: 'saved', payload: { id: string; remoteId: string; secondaryCategoryId: string | null; salesChannelId: string | null }): void;
  (e: 'deleted'): void;
}>();

const { t } = useI18n();

const nodes = ref<EbayCategoryNode[]>([]);
const loadingNodes = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<EbayCategoryNode[]>([]);
const mainNode = ref<EbayCategoryNode | null>(null);
const secondaryNode = ref<EbayCategoryNode | null>(null);
const savedMainNode = ref<EbayCategoryNode | null>(null);
const savedSecondaryNode = ref<EbayCategoryNode | null>(null);
const savedRemoteId = ref<string | null>(null);
const savedSecondaryCategoryId = ref<string | null>(null);
const productCategoryId = ref<string | null>(null);
const selectedTarget = ref<EbayCategoryTarget>('main');
const search = ref('');
const loadingSelected = ref(false);
const saving = ref(false);
const manualCategoryInput = ref('');
const manualSelectionLoading = ref(false);
const manualSelectionError = ref<string | null>(null);
const slotErrors = ref<{ main: string | null; secondary: string | null }>({
  main: null,
  secondary: null,
});

const defaultTreeId = computed(() => props.view?.defaultCategoryTreeId || null);
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

const filteredNodes = computed(() =>
  nodes.value.filter((node) =>
    node.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const hasUnsavedChanges = computed(
  () => mainRemoteId.value !== savedRemoteId.value || secondaryRemoteId.value !== savedSecondaryCategoryId.value,
);

const pendingActiveCategoryNode = computed(() =>
  selectedTarget.value === 'secondary' ? secondaryNode.value : mainNode.value,
);

const currentActiveCategoryNode = computed(() =>
  selectedTarget.value === 'secondary' ? savedSecondaryNode.value : savedMainNode.value,
);

const resetNavigation = () => {
  pathStack.value = [];
  currentParentId.value = null;
  search.value = '';
};

const clearSlotErrors = () => {
  slotErrors.value = { main: null, secondary: null };
};

const createFallbackNode = (remoteId: string): EbayCategoryNode => ({
  remoteId,
  name: remoteId,
  fullName: remoteId,
  hasChildren: false,
  parentNode: null,
  configuratorProperties: [],
});

const fetchNodes = async () => {
  if (!defaultTreeId.value) {
    nodes.value = [];
    return;
  }
  loadingNodes.value = true;
  try {
    const filter: Record<string, any> = {
      marketplaceDefaultTreeId: { exact: defaultTreeId.value },
    };
    if (!currentParentId.value) {
      filter.isRoot = { exact: true };
    } else {
      filter.parentNode = { remoteId: { exact: currentParentId.value } };
    }

    const { data } = await apolloClient.query({
      query: ebayCategoriesQuery,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });
    nodes.value = mapCategoriesConnection(data?.ebayCategories);
  } catch (error) {
    nodes.value = [];
    displayApolloError(error);
  } finally {
    loadingNodes.value = false;
  }
};

const fetchCategoryDetails = async (remoteId: string) => {
  if (!defaultTreeId.value) return null;
  try {
    const { data } = await apolloClient.query({
      query: ebayCategoriesQuery,
      variables: {
        filter: {
          marketplaceDefaultTreeId: { exact: defaultTreeId.value },
          remoteId: { exact: remoteId },
        },
      },
      fetchPolicy: 'cache-first',
    });
    const categories = mapCategoriesConnection(data?.ebayCategories);
    return categories[0] || null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const resolveNodeByRemoteId = async (remoteId: string) => {
  if (!remoteId) return null;
  const category = await fetchCategoryDetails(remoteId);
  return category || createFallbackNode(remoteId);
};

const fetchSelected = async () => {
  savedRemoteId.value = props.category?.remoteId || null;
  savedSecondaryCategoryId.value = props.category?.secondaryCategoryId || null;
  productCategoryId.value = props.category?.id || null;

  if (!savedRemoteId.value && !savedSecondaryCategoryId.value) {
    mainNode.value = null;
    secondaryNode.value = null;
    savedMainNode.value = null;
    savedSecondaryNode.value = null;
    clearSlotErrors();
    selectedTarget.value = resolveDefaultCategoryTarget(null, null);
    return;
  }

  loadingSelected.value = true;
  try {
    const [main, secondary] = await Promise.all([
      savedRemoteId.value ? resolveNodeByRemoteId(savedRemoteId.value) : null,
      savedSecondaryCategoryId.value ? resolveNodeByRemoteId(savedSecondaryCategoryId.value) : null,
    ]);
    mainNode.value = main;
    secondaryNode.value = secondary;
    savedMainNode.value = main;
    savedSecondaryNode.value = secondary;
    clearSlotErrors();
    selectedTarget.value = resolveDefaultCategoryTarget(savedRemoteId.value, savedSecondaryCategoryId.value);
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
  () => props.view?.id,
  () => {
    resetNavigation();
    void fetchSelected();
    manualCategoryInput.value = '';
    manualSelectionError.value = null;
  },
);

watch(
  () => defaultTreeId.value,
  () => {
    resetNavigation();
    void fetchSelected();
  },
);

watch(
  () => [defaultTreeId.value, currentParentId.value],
  () => {
    void fetchNodes();
  },
  { immediate: true },
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

const goToChild = (node: EbayCategoryNode) => {
  pathStack.value.push(node);
  currentParentId.value = node.remoteId;
  search.value = '';
};

const goToLevel = (index: number | null) => {
  if (index === null) {
    pathStack.value = [];
    currentParentId.value = null;
    search.value = '';
    return;
  }
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentParentId.value = pathStack.value[index].remoteId;
  search.value = '';
};

const goBack = () => {
  if (!pathStack.value.length) {
    goToLevel(null);
    return;
  }
  const target = pathStack.value.length - 2;
  goToLevel(target >= 0 ? target : null);
};

const setSelectedTarget = (target: EbayCategoryTarget) => {
  clearSlotErrors();
  if (target === 'secondary' && secondaryDisabled.value) {
    Toast.info(t('products.products.ebay.selectionSlots.secondaryDisabled'));
    return;
  }
  selectedTarget.value = target;
};

const applySelectedNode = (node: EbayCategoryNode) => {
  clearSlotErrors();
  if (selectedTarget.value === 'secondary') {
    if (secondaryDisabled.value) {
      Toast.info(t('products.products.ebay.selectionSlots.secondaryDisabled'));
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

const selectNode = (node: EbayCategoryNode) => {
  if (node.hasChildren) {
    Toast.info(t('products.products.ebay.leafRestriction'));
    return;
  }
  applySelectedNode(node);
};

const cancelSelection = () => {
  void fetchSelected();
};

const saveSelection = async () => {
  if (!mainRemoteId.value || !props.productId || !props.salesChannelId || !props.view?.id) {
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
    const remoteId = mainRemoteId.value;
    const secondaryCategoryId = secondaryRemoteId.value;

    if (productCategoryId.value) {
      await apolloClient.mutate({
        mutation: updateEbayProductCategoryMutation,
        variables: {
          data: {
            id: productCategoryId.value,
            remoteId,
            secondaryCategoryId,
          },
        },
      });
    } else {
      const { data } = await apolloClient.mutate({
        mutation: createEbayProductCategoryMutation,
        variables: {
          data: {
            product: { id: props.productId },
            salesChannel: { id: props.salesChannelId },
            view: { id: props.view.id },
            remoteId,
            secondaryCategoryId,
          },
        },
      });
      productCategoryId.value = data?.createEbayProductCategory?.id || null;
    }

    savedRemoteId.value = remoteId;
    savedSecondaryCategoryId.value = secondaryCategoryId;
    savedMainNode.value = mainNode.value;
    savedSecondaryNode.value = secondaryNode.value;
    selectedTarget.value = resolveDefaultCategoryTarget(savedRemoteId.value, savedSecondaryCategoryId.value);
    Toast.success(t('products.products.ebay.categorySaved'));
    if (productCategoryId.value) {
      emit('saved', {
        id: productCategoryId.value,
        remoteId,
        secondaryCategoryId,
        salesChannelId: props.salesChannelId || null,
      });
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t) as Record<string, any>;
    const mappedMainError = validationErrors.remoteId || null;
    const mappedSecondaryError = validationErrors.secondaryCategoryId || null;
    const allMessage = validationErrors.__all__ ? String(validationErrors.__all__) : '';
    const sameCategoryInAll = allMessage.toLowerCase().includes('primary and secondary ebay categories cannot be the same');

    if (mappedMainError || mappedSecondaryError || sameCategoryInAll) {
      slotErrors.value = {
        main: mappedMainError || (sameCategoryInAll ? duplicateCategoryErrorText.value : null),
        secondary: mappedSecondaryError || (sameCategoryInAll ? duplicateCategoryErrorText.value : null),
      };
      return;
    }
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const removeSelection = async () => {
  if (!productCategoryId.value) {
    return;
  }

  saving.value = true;
  try {
    await apolloClient.mutate({
      mutation: deleteEbayProductCategoryMutation,
      variables: { data: { id: productCategoryId.value } },
    });
    productCategoryId.value = null;
    savedRemoteId.value = null;
    savedSecondaryCategoryId.value = null;
    savedMainNode.value = null;
    savedSecondaryNode.value = null;
    mainNode.value = null;
    secondaryNode.value = null;
    clearSlotErrors();
    selectedTarget.value = 'main';
    Toast.success(t('products.products.ebay.categoryRemoved'));
    emit('deleted');
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const setManualCategory = async () => {
  if (!manualCategoryId.value || manualSelectionLoading.value) {
    return;
  }
  manualSelectionLoading.value = true;
  manualSelectionError.value = null;
  try {
    const node = await fetchCategoryDetails(manualCategoryId.value);
    if (!node) {
      manualSelectionError.value = t('products.products.ebay.manualEntry.invalid');
      return;
    }
    applySelectedNode(node);
  } finally {
    manualSelectionLoading.value = false;
  }
};

const handleSuggestedCategory = async (categoryId: string) => {
  if (!categoryId) {
    return;
  }

  const node = await fetchCategoryDetails(categoryId);
  if (!node) {
    Toast.error(t('products.products.ebay.manualEntry.invalid'));
    return;
  }

  applySelectedNode(node);
};

const hasView = computed(() => Boolean(props.view));

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div>
    <Flex gap="2">
      <FlexCell>
        <h4 class="font-semibold mb-2">{{ t('products.products.ebay.categoryTitle') }}</h4>
      </FlexCell>
    </Flex>
    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.ebay.categoryDescription') }}
    </p>

    <div class="bg-blue-50 border rounded mt-4 p-6">
      <div v-if="!hasView" class="text-sm text-gray-600">
        {{ t('products.products.ebay.selectMarketplacePrompt') }}
      </div>
      <div v-else-if="!defaultTreeId" class="text-sm text-gray-600">
        {{ t('products.products.ebay.noDefaultTree') }}
      </div>
      <div v-else class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-1/2">
          <div class="flex items-center gap-2 text-sm mb-2">
            <span
              class="cursor-pointer hover:underline"
              @click="goToLevel(null)"
            >
              {{ t('products.products.ebay.rootLabel') }}
            </span>
            <template v-for="(crumb, index) in pathStack" :key="crumb.remoteId">
              <span>&gt;</span>
              <span
                class="cursor-pointer hover:underline"
                @click="goToLevel(index)"
              >
                {{ crumb.name }}
              </span>
            </template>
            <div v-if="pathStack.length" class="flex gap-1 ml-auto">
              <Button class="btn btn-sm btn-outline-primary" @click="goBack">
                {{ t('shared.button.back') }}
              </Button>
            </div>
          </div>

          <input
            v-model="search"
            type="text"
            class="form-input w-full mb-2"
            :placeholder="t('shared.button.search') + '...'"
          />

          <div class="max-h-[420px] overflow-y-auto pr-1">
            <div v-if="loadingNodes">
              <LocalLoader :loading="true" />
            </div>
            <ul v-else class="space-y-1">
              <li
                v-for="node in filteredNodes"
                :key="node.remoteId"
                class="flex justify-between items-center py-2 px-2 border rounded hover:bg-gray-100"
              >
                <div
                  class="flex items-center gap-2 flex-1 cursor-pointer"
                  @click="node.hasChildren ? goToChild(node) : selectNode(node)"
                >
                  <Icon :name="node.hasChildren ? 'angle-right' : 'circle'" class="w-3" />
                  <span>{{ node.name }}</span>
                </div>
                <div class="flex gap-2">
                  <Button
                    class="btn btn-sm btn-outline-primary"
                    :disabled="node.hasChildren"
                    :title="node.hasChildren ? t('products.products.ebay.leafRestriction') : undefined"
                    @click.stop="selectNode(node)"
                  >
                    {{ t('shared.button.select') }}
                  </Button>
                </div>
              </li>
            </ul>
          </div>
          <div class="mt-6 border rounded bg-white p-4">
            <h6 class="font-semibold text-sm mb-1">
              {{ t('products.products.ebay.manualEntry.title') }}
            </h6>
            <p class="text-xs text-gray-500 mb-3">
              {{ t('products.products.ebay.manualEntry.description') }}
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

          <EbayCategorySuggestion
            :marketplace-id="view?.id || null"
            :name="productName || null"
            @select="handleSuggestedCategory"
          />
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
              :default-category="defaultCategory"
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
            <EbayCategoryDetails v-if="currentActiveCategoryNode" :category="currentActiveCategoryNode" />
            <div v-else class="text-sm text-gray-500">
              {{ t('products.products.ebay.noSelection') }}
            </div>
          </div>

          <div class="border rounded p-3 bg-white">
            <h6 class="font-semibold text-sm mb-2">
              {{ t('products.products.ebay.pendingSelection') }}
            </h6>
            <EbayCategoryDetails
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
              :disabled="saving || !hasUnsavedChanges || !mainRemoteId"
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

          <div v-if="productCategoryId" class="flex gap-2">
            <Button
              class="btn btn-sm btn-outline-danger"
              :disabled="saving"
              @click="removeSelection"
            >
              {{ t('products.products.ebay.removeCategory') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
