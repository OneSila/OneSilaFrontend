<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import Swal from 'sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import {
  amazonBrowseNodesQuery,
  amazonProductBrowseNodesQuery,
} from '../../../../../../../../shared/api/queries/amazonProducts.js';
import { amazonProductTypesQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import {
  createAmazonProductBrowseNodeMutation,
  updateAmazonProductBrowseNodeMutation,
  deleteAmazonProductBrowseNodeMutation,
} from '../../../../../../../../shared/api/mutations/amazonProducts.js';
import { createAndMapAmazonProductTypeMutation } from '../../../../../../../../shared/api/mutations/amazonProducts.js';

interface BrowseNode {
  id: string;
  remoteId: string;
  name: string;
  hasChildren: boolean;
  productTypeDefinitions: string[];
  browsePathByName: string[];
}

const props = defineProps<{
  productId: string | null;
  salesChannelId: string | null;
  salesChannelViewId: string | null;
  marketplaceId: string | null;
  view?: any | null;
}>();

const { t } = useI18n();

const nodes = ref<BrowseNode[]>([]);
const loadingNodes = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<BrowseNode[]>([]);
const selectedNodeDetails = ref<BrowseNode | null>(null);
const pendingNode = ref<BrowseNode | null>(null);
const productBrowseNodeId = ref<string | null>(null);
const loadingSelected = ref(false);
const saving = ref(false);
const manualBrowseNodeInput = ref('');
const manualSelectionLoading = ref(false);
const manualSelectionError = ref<string | null>(null);

const displayedNode = computed(() => pendingNode.value || selectedNodeDetails.value);
const manualBrowseNodeId = computed(() => manualBrowseNodeInput.value.trim());

interface RecommendedType {
  code: string;
  name: string;
  exists: boolean;
  id?: string;
}

const recommendedTypes = ref<RecommendedType[]>([]);

const search = ref('');
const filteredNodes = computed(() =>
  nodes.value.filter((n) =>
    n.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const fetchNodes = async () => {
  if (!props.marketplaceId) return;
  loadingNodes.value = true;
  try {
    const filter: any = { marketplaceId: { exact: props.marketplaceId } };
    if (!currentParentId.value) {
      filter.isRoot = { exact: true };
    } else {
      filter.parentNode = { remoteId: { exact: currentParentId.value } };
    }
    const { data } = await apolloClient.query({
      query: amazonBrowseNodesQuery,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });
    nodes.value = data?.amazonBrowseNodes?.edges?.map((e: any) => e.node) || [];
  } catch (error) {
    nodes.value = [];
    displayApolloError(error);
  } finally {
    loadingNodes.value = false;
  }
};

watch([
  () => props.marketplaceId,
  currentParentId,
], fetchNodes, { immediate: true });

const fetchSelected = async () => {
  if (!props.productId || !props.salesChannelViewId) {
    selectedNodeDetails.value = null;
    pendingNode.value = null;
    productBrowseNodeId.value = null;
    return;
  }
  loadingSelected.value = true;
  const filter = {
    product: { id: { exact: props.productId } },
    view: { id: { exact: props.salesChannelViewId } },
  };
  const { data } = await apolloClient.query({
    query: amazonProductBrowseNodesQuery,
    variables: { filter },
    fetchPolicy: 'cache-first',
  });
  const node = data?.amazonProductBrowseNodes?.edges?.[0]?.node;
  if (node) {
    productBrowseNodeId.value = node.id;
    await fetchSelectedNodeDetails(node.recommendedBrowseNodeId);
  } else {
    productBrowseNodeId.value = null;
    selectedNodeDetails.value = null;
  }
  pendingNode.value = null;
  loadingSelected.value = false;
};

const fetchBrowseNodeDetails = async (remoteId: string) => {
  if (!props.marketplaceId) return;
  try {
    const filter = {
      marketplaceId: { exact: props.marketplaceId },
      remoteId: { exact: remoteId },
    };
    const { data } = await apolloClient.query({
      query: amazonBrowseNodesQuery,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });
    return data?.amazonBrowseNodes?.edges?.[0]?.node || null;
  } catch (error) {
    displayApolloError(error);
    return null;
  }
};

const fetchSelectedNodeDetails = async (remoteId: string) => {
  selectedNodeDetails.value = await fetchBrowseNodeDetails(remoteId);
};

const formatTypeName = (code: string) =>
  code
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

const fetchRecommendedTypes = async () => {
  const codes = displayedNode.value?.productTypeDefinitions || [];
  if (!props.salesChannelId || !codes.length) {
    recommendedTypes.value = [];
    return;
  }
  const { data } = await apolloClient.query({
    query: amazonProductTypesQuery,
    variables: {
      first: codes.length,
      filter: {
        salesChannel: { id: { exact: props.salesChannelId } },
        productTypeCode: { inList: codes },
      },
    },
    fetchPolicy: 'cache-first',
  });
  const map = new Map<string, { id: string }>(
    (data?.amazonProductTypes?.edges || []).map((e: any) => [
      e.node.productTypeCode,
      e.node as { id: string },
    ]),
  );
  recommendedTypes.value = codes.map((code: string) => {
    const node = map.get(code);
    return {
      code,
      name: formatTypeName(code),
      exists: !!node,
      id: node?.id,
    } as RecommendedType;
  });
};

watch([() => displayedNode.value, () => props.salesChannelId], fetchRecommendedTypes, {
  immediate: true,
});

interface SwalClasses {
  popup?: string;
  confirmButton?: string;
  cancelButton?: string;
}

const defaultSwalOptions: SweetAlertOptions = {
  title: t('shared.alert.mutationAlert.title'),
  text: t('shared.alert.mutationAlert.text'),
  confirmButtonText: t('shared.alert.mutationAlert.confirmButtonText'),
  cancelButtonText: t('shared.alert.mutationAlert.cancelButtonText'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em',
};

const defaultSwalClasses: SwalClasses = {
  popup: 'sweet-alerts',
  confirmButton: 'btn btn-secondary',
  cancelButton: 'btn btn-dark ltr:mr-3 rtl:ml-3',
};

const confirmAndMutate = async (
  mutate: () => Promise<void>,
  swalOptions: SweetAlertOptions,
) => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: defaultSwalClasses,
    buttonsStyling: false,
  });

  const result = await swalWithBootstrapButtons.fire({
    ...defaultSwalOptions,
    ...swalOptions,
  } as SweetAlertOptions);

  if (result.isConfirmed) {
    await mutate();
  }
};

const createType = async (type: RecommendedType) => {
  if (!props.salesChannelId) return;
  try {
    await apolloClient.mutate({
      mutation: createAndMapAmazonProductTypeMutation,
      variables: {
        salesChannel: { id: props.salesChannelId },
        productTypeCode: type.code,
      },
    });
    Toast.success(t('products.products.amazon.productTypeCreated'));
    await fetchRecommendedTypes();
  } catch (error) {
    displayApolloError(error);
  }
};

const confirmCreateType = (type: RecommendedType) =>
  confirmAndMutate(() => createType(type), {
    title: t('products.products.amazon.createProductTypeTitle'),
    text: t('products.products.amazon.createProductTypeConfirm', {
      type: type.name,
    }),
  });

watch([
  () => props.productId,
  () => props.salesChannelViewId,
  () => props.marketplaceId,
], fetchSelected, { immediate: true });

watch(
  () => props.marketplaceId,
  () => {
    manualBrowseNodeInput.value = '';
    manualSelectionError.value = null;
  },
);

watch(
  manualBrowseNodeInput,
  () => {
    manualSelectionError.value = null;
  },
);

const goToChild = (node: BrowseNode) => {
  search.value = '';
  pathStack.value.push(node);
  currentParentId.value = node.remoteId;
};

const goToLevel = (index: number | null) => {
  search.value = '';
  if (index === null) {
    pathStack.value = [];
    currentParentId.value = null;
    return;
  }
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentParentId.value = pathStack.value[index].remoteId;
};

const goBack = () => {
  search.value = '';
  if (!pathStack.value.length) {
    goToLevel(null);
    return;
  }
  const target = pathStack.value.length - 2;
  goToLevel(target >= 0 ? target : null);
};

const selectCurrent = () => {
  const node = pathStack.value[pathStack.value.length - 1];
  if (node) {
    selectNode(node);
  }
};
const selectNode = (node: BrowseNode) => {
  pendingNode.value = node;
};

const copyBrowseNodeId = async (remoteId?: string | null) => {
  if (!remoteId) return;
  try {
    await navigator.clipboard.writeText(remoteId);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const setManualBrowseNode = async () => {
  if (!manualBrowseNodeId.value || manualSelectionLoading.value) {
    return;
  }
  manualSelectionLoading.value = true;
  manualSelectionError.value = null;
  try {
    const node = await fetchBrowseNodeDetails(manualBrowseNodeId.value);
    if (!node) {
      manualSelectionError.value = t('products.products.amazon.manualEntry.invalid');
      return;
    }
    pendingNode.value = node;
  } finally {
    manualSelectionLoading.value = false;
  }
};

const saveSelection = async () => {
  const node = pendingNode.value;
  if (!node || !props.productId || !props.salesChannelId || !props.salesChannelViewId) return;
  saving.value = true;
  try {
    if (productBrowseNodeId.value) {
      await apolloClient.mutate({
        mutation: updateAmazonProductBrowseNodeMutation,
        variables: {
          data: {
            id: productBrowseNodeId.value,
            recommendedBrowseNodeId: node.remoteId,
          },
        },
      });
    } else {
      const { data } = await apolloClient.mutate({
        mutation: createAmazonProductBrowseNodeMutation,
        variables: {
          data: {
            product: { id: props.productId },
            salesChannel: { id: props.salesChannelId },
            view: { id: props.salesChannelViewId },
            recommendedBrowseNodeId: node.remoteId,
          },
        },
      });
      productBrowseNodeId.value = data?.createAmazonProductBrowseNode?.id || null;
    }
    await fetchSelectedNodeDetails(node.remoteId);
    pendingNode.value = null;
    Toast.success(t('products.products.amazon.browseNodeSaved'));
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const removeSelection = async () => {
  if (!productBrowseNodeId.value) return;
  saving.value = true;
  try {
    await apolloClient.mutate({
      mutation: deleteAmazonProductBrowseNodeMutation,
      variables: { data: { id: productBrowseNodeId.value } },
    });
    productBrowseNodeId.value = null;
    selectedNodeDetails.value = null;
    pendingNode.value = null;
    Toast.success(t('products.products.amazon.browseNodeDeleted'));
  } catch (error) {
    displayApolloError(error);
  } finally {
    saving.value = false;
  }
};

const cancelSelection = () => {
  pendingNode.value = null;
};

watch([
  () => props.salesChannelViewId,
  () => props.marketplaceId,
], () => {
  goToLevel(null);
});

const showAlert = computed(
  () =>
    props.view && !props.view.isDefault && !loadingSelected.value && !productBrowseNodeId.value,
);

const hasUnsavedChanges = computed(() => pendingNode.value !== null);

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div>
    <Flex gap="2">
      <FlexCell>
        <h4 class="font-semibold mb-2">{{ t('products.products.amazon.browseNode') }}</h4>
      </FlexCell>
      <FlexCell>
        <div v-if="showAlert" class="text-danger text-small blink-animation ml-1 mb-1">
          <Icon size="sm" name="exclamation-circle"/>
          <span class="ml-1">
            {{ t('products.products.amazon.defaultMarketplaceFallback') }}
          </span>
        </div>
      </FlexCell>
    </Flex>
    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.amazon.browseNodeDescription') }}
    </p>

    <div class="bg-blue-50 border rounded mt-4 p-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-1/2">
          <div class="flex items-center gap-2 text-sm mb-2">
            <span
              class="cursor-pointer hover:underline"
              @click="goToLevel(null)"
            >
              {{ t('products.products.amazon.browseNodeRoot') }}
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
              <Button
                class="btn btn-sm btn-outline-primary"
                @click="selectCurrent"
              >
                {{ t('products.products.amazon.selectCurrentNode') }}
              </Button>
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
                    :title="node.hasChildren ? t('products.products.amazon.leafRestriction') : undefined"
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
              {{ t('products.products.amazon.manualEntry.title') }}
            </h6>
            <p class="text-xs text-gray-500 mb-3">
              {{ t('products.products.amazon.manualEntry.description') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="manualBrowseNodeInput"
                type="text"
                class="form-input flex-1"
                :placeholder="t('products.products.amazon.manualEntry.placeholder')"
                @keyup.enter="setManualBrowseNode"
              />
              <Button
                class="btn btn-sm btn-outline-primary"
                :disabled="manualSelectionLoading || !manualBrowseNodeId"
                :loading="manualSelectionLoading"
                @click="setManualBrowseNode"
              >
                {{ t('products.products.amazon.manualEntry.button') }}
              </Button>
            </div>
            <p v-if="manualSelectionError" class="text-xs text-red-600 mt-2">
              {{ manualSelectionError }}
            </p>
          </div>
        </div>

        <div class="lg:w-1/2 space-y-4">
          <div>
            <h5 class="font-semibold text-sm mb-1">
              {{ t('products.products.amazon.currentSelection') }}
            </h5>
            <div class="min-h-[56px] border rounded p-3 bg-white">
              <div v-if="loadingSelected">
                <LocalLoader :loading="true" />
              </div>
              <div v-else-if="selectedNodeDetails">
                <div class="text-sm font-medium">{{ selectedNodeDetails.name }}</div>
                <div class="text-xs text-gray-500 flex items-center gap-2">
                  <span>{{ selectedNodeDetails.remoteId }}</span>
                  <button
                    class="p-1 rounded hover:bg-gray-100"
                    type="button"
                    @click="copyBrowseNodeId(selectedNodeDetails.remoteId)"
                  >
                    <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ selectedNodeDetails.browsePathByName.join(' > ') }}
                </div>
                <div v-if="!pendingNode && recommendedTypes.length" class="mt-3">
                  <h6 class="font-semibold text-xs text-gray-700 mb-1">
                    {{ t('products.products.amazon.recommendedProductTypes') }}
                  </h6>
                  <ul class="space-y-1">
                    <li
                      v-for="type in recommendedTypes"
                      :key="type.code"
                      class="flex items-center gap-2 text-xs text-gray-700"
                    >
                      <Icon
                        :name="type.exists ? 'circle-check' : 'circle-xmark'"
                        class="w-3"
                        :class="type.exists ? 'text-green-500' : 'text-red-500'"
                      />
                      <Link
                        v-if="type.exists && type.id"
                        :path="{
                          name: 'integrations.remoteProductTypes.edit',
                          params: { type: 'amazon', id: type.id },
                          query: { integrationId: props.salesChannelId },
                        }"
                        class="hover:underline"
                      >
                        {{ type.name }}
                      </Link>
                      <span v-else>{{ type.name }}</span>
                      <div
                        v-if="!type.exists"
                        class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                        @click.stop="confirmCreateType(type)"
                      >
                        <Icon name="plus" class="w-3 text-gray-600" />
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div v-else class="text-sm text-gray-500">
                {{ t('products.products.amazon.noBrowseNodeSelected') }}
              </div>
            </div>
          </div>

          <div v-if="pendingNode" class="border rounded p-3 bg-white">
            <h6 class="font-semibold text-sm mb-1">
              {{ t('products.products.amazon.pendingSelection') }}
            </h6>
            <div class="text-sm font-medium">{{ pendingNode.name }}</div>
            <div class="text-xs text-gray-500 flex items-center gap-2">
              <span>{{ pendingNode.remoteId }}</span>
              <button
                class="p-1 rounded hover:bg-gray-100"
                type="button"
                @click="copyBrowseNodeId(pendingNode.remoteId)"
              >
                <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ pendingNode.browsePathByName.join(' > ') }}
            </div>
            <div v-if="recommendedTypes.length" class="mt-3">
              <h6 class="font-semibold text-xs text-gray-700 mb-1">
                {{ t('products.products.amazon.recommendedProductTypes') }}
              </h6>
              <ul class="space-y-1">
                <li
                  v-for="type in recommendedTypes"
                  :key="type.code"
                  class="flex items-center gap-2 text-xs text-gray-700"
                >
                  <Icon
                    :name="type.exists ? 'circle-check' : 'circle-xmark'"
                    class="w-3"
                    :class="type.exists ? 'text-green-500' : 'text-red-500'"
                  />
                  <Link
                    v-if="type.exists && type.id"
                    :path="{
                      name: 'integrations.remoteProductTypes.edit',
                      params: { type: 'amazon', id: type.id },
                      query: { integrationId: props.salesChannelId },
                    }"
                    class="hover:underline"
                  >
                    {{ type.name }}
                  </Link>
                  <span v-else>{{ type.name }}</span>
                  <div
                    v-if="!type.exists"
                    class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer"
                    @click.stop="confirmCreateType(type)"
                  >
                    <Icon name="plus" class="w-3 text-gray-600" />
                  </div>
                </li>
              </ul>
            </div>
            <div class="mt-3 flex gap-2">
              <Button class="btn btn-sm btn-primary" :disabled="saving" @click="saveSelection">
                {{ t('shared.button.save') }}
              </Button>
              <Button class="btn btn-sm btn-outline-dark" :disabled="saving" @click="cancelSelection">
                {{ t('shared.button.cancel') }}
              </Button>
            </div>
          </div>

          <div v-if="productBrowseNodeId" class="flex gap-2">
            <Button class="btn btn-sm btn-outline-danger" :disabled="saving" @click="removeSelection">
              {{ t('shared.button.delete') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
