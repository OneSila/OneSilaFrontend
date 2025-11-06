<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { ebayCategoriesQuery } from '../../../../../../../../shared/api/queries/ebayCategories.js';
import {
  createEbayProductCategoryMutation,
  updateEbayProductCategoryMutation,
  deleteEbayProductCategoryMutation,
} from '../../../../../../../../shared/api/mutations/ebayProducts.js';

interface EbayCategoryNode {
  remoteId: string;
  name: string;
  fullName?: string | null;
  hasChildren: boolean;
  parentNode?: { remoteId?: string | null } | null;
}

const props = defineProps<{
  productId: string | null;
  salesChannelId: string | null;
  view: any | null;
  category: { id: string | null; remoteId: string | null; salesChannelId?: string | null } | null;
  defaultCategory: { remoteId: string | null; name: string | null } | null;
}>();

const emit = defineEmits<{
  (e: 'saved', payload: { id: string; remoteId: string; salesChannelId: string | null }): void;
  (e: 'deleted'): void;
}>();

const { t } = useI18n();

const nodes = ref<EbayCategoryNode[]>([]);
const loadingNodes = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<EbayCategoryNode[]>([]);
const pendingNode = ref<EbayCategoryNode | null>(null);
const selectedNode = ref<EbayCategoryNode | null>(null);
const savedRemoteId = ref<string | null>(null);
const productCategoryId = ref<string | null>(null);
const search = ref('');
const loadingSelected = ref(false);
const saving = ref(false);

const defaultTreeId = computed(() => props.view?.defaultCategoryTreeId || null);

const filteredNodes = computed(() =>
  nodes.value.filter((node) =>
    node.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const hasUnsavedChanges = computed(
  () => pendingNode.value !== null && pendingNode.value.remoteId !== savedRemoteId.value,
);

const resetNavigation = () => {
  pathStack.value = [];
  currentParentId.value = null;
  search.value = '';
};

const mapCategoriesConnection = (connection: any): EbayCategoryNode[] => {
  if (!connection) return [];
  if (Array.isArray(connection)) return connection as EbayCategoryNode[];
  return connection.edges?.map((edge: any) => edge.node) || [];
};

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

const fetchSelected = async () => {
  savedRemoteId.value = props.category?.remoteId || null;
  productCategoryId.value = props.category?.id || null;
  pendingNode.value = null;

  if (!savedRemoteId.value || !defaultTreeId.value) {
    selectedNode.value = null;
    return;
  }

  loadingSelected.value = true;
  try {
    selectedNode.value = await fetchCategoryDetails(savedRemoteId.value);
  } finally {
    loadingSelected.value = false;
  }
};

watch(
  () => props.category,
  () => {
    fetchSelected();
  },
  { immediate: true },
);

watch(
  () => props.view?.id,
  () => {
    resetNavigation();
    fetchSelected();
  },
);

watch(
  () => defaultTreeId.value,
  () => {
    resetNavigation();
    fetchSelected();
  },
);

watch(
  () => [defaultTreeId.value, currentParentId.value],
  () => {
    fetchNodes();
  },
  { immediate: true },
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

const selectNode = (node: EbayCategoryNode) => {
  if (node.hasChildren) {
    Toast.info(t('products.products.ebay.leafRestriction'));
    return;
  }
  pendingNode.value = node;
};

const cancelSelection = () => {
  pendingNode.value = null;
};

const saveSelection = async () => {
  if (!pendingNode.value || !props.productId || !props.salesChannelId || !props.view?.id) {
    return;
  }

  saving.value = true;
  try {
    const remoteId = pendingNode.value.remoteId;
    if (productCategoryId.value) {
      await apolloClient.mutate({
        mutation: updateEbayProductCategoryMutation,
        variables: {
          data: {
            id: productCategoryId.value,
            remoteId,
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
          },
        },
      });
      productCategoryId.value = data?.createEbayProductCategory?.id || null;
    }

    savedRemoteId.value = remoteId;
    selectedNode.value = pendingNode.value;
    pendingNode.value = null;
    Toast.success(t('products.products.ebay.categorySaved'));
    if (productCategoryId.value) {
      emit('saved', {
        id: productCategoryId.value,
        remoteId,
        salesChannelId: props.salesChannelId || null,
      });
    }
  } catch (error) {
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
    selectedNode.value = null;
    pendingNode.value = null;
    Toast.success(t('products.products.ebay.categoryRemoved'));
    emit('deleted');
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
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

        <div class="lg:w-1/2 space-y-4">
          <div>
            <h5 class="font-semibold text-sm mb-1">
              {{ t('products.products.ebay.currentSelection') }}
            </h5>
            <div class="min-h-[56px] border rounded p-3 bg-white">
              <div v-if="loadingSelected">
                <LocalLoader :loading="true" />
              </div>
              <div v-else-if="selectedNode">
                <div class="text-sm font-medium">{{ selectedNode.fullName || selectedNode.name }}</div>
                <div class="text-xs text-gray-500">{{ selectedNode.remoteId }}</div>
              </div>
              <div v-else>
                <div
                  v-if="defaultCategory?.remoteId"
                  class="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                >
                  <div class="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Icon name="folder" class="w-4 h-4 text-gray-500" />
                    {{ t('products.products.ebay.defaultCategoryTitle') }}
                  </div>
                  <div class="text-sm">
                    {{ defaultCategory.name || defaultCategory.remoteId }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ t('products.products.ebay.defaultCategoryInfo', { id: defaultCategory.remoteId }) }}
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">
                  {{ t('products.products.ebay.noSelection') }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="pendingNode" class="border rounded p-3 bg-white">
            <h6 class="font-semibold text-sm mb-1">
              {{ t('products.products.ebay.pendingSelection') }}
            </h6>
            <div class="text-sm font-medium">{{ pendingNode.fullName || pendingNode.name }}</div>
            <div class="text-xs text-gray-500">{{ pendingNode.remoteId }}</div>
            <div class="mt-3 flex gap-2">
              <Button
                class="btn btn-sm btn-primary"
                :disabled="saving"
                @click="saveSelection"
              >
                {{ t('shared.button.save') }}
              </Button>
              <Button class="btn btn-sm btn-outline-dark" :disabled="saving" @click="cancelSelection">
                {{ t('shared.button.cancel') }}
              </Button>
            </div>
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
