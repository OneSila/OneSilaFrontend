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
}>();

const { t } = useI18n();

const nodes = ref<BrowseNode[]>([]);
const loadingNodes = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<BrowseNode[]>([]);
const selectedNodeDetails = ref<BrowseNode | null>(null);
const pendingNode = ref<BrowseNode | null>(null);
const productBrowseNodeId = ref<string | null>(null);

const displayedNode = computed(() => pendingNode.value || selectedNodeDetails.value);

interface RecommendedType {
  code: string;
  name: string;
  exists: boolean;
  id?: string;
}

const recommendedTypes = ref<RecommendedType[]>([]);

const fetchNodes = async () => {
  if (!props.marketplaceId) return;
  loadingNodes.value = true;
  const filter: any = { marketplaceId: { exact: props.marketplaceId } };
  if (!currentParentId.value) {
    filter.isRoot = { exact: true };
  } else {
    filter.parentNode = { remoteId: { exact: currentParentId.value } };
  }
  const { data } = await apolloClient.query({
    query: amazonBrowseNodesQuery,
    variables: { filter },
    fetchPolicy: 'network-only',
  });
  nodes.value = data?.amazonBrowseNodes?.edges?.map((e: any) => e.node) || [];
  loadingNodes.value = false;
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
  const filter = {
    product: { id: { exact: props.productId } },
    salesChannelView: { id: { exact: props.salesChannelViewId } },
  };
  const { data } = await apolloClient.query({
    query: amazonProductBrowseNodesQuery,
    variables: { filter },
    fetchPolicy: 'network-only',
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
};

const fetchSelectedNodeDetails = async (remoteId: string) => {
  if (!props.marketplaceId) return;
  const filter = {
    marketplaceId: { exact: props.marketplaceId },
    remoteId: { exact: remoteId },
  };
  const { data } = await apolloClient.query({
    query: amazonBrowseNodesQuery,
    variables: { filter },
    fetchPolicy: 'network-only',
  });
  selectedNodeDetails.value = data?.amazonBrowseNodes?.edges?.[0]?.node || null;
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
        productTypeCode: { in: codes },
      },
    },
    fetchPolicy: 'network-only',
  });
  const map = new Map(
    (data?.amazonProductTypes?.edges || []).map((e: any) => [e.node.productTypeCode, e.node]),
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

const defaultSwalOptions = {
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
  });

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
        data: {
          salesChannel: { id: props.salesChannelId },
          productTypeCode: type.code,
        },
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

const goToChild = (node: BrowseNode) => {
  pathStack.value.push(node);
  currentParentId.value = node.remoteId;
};

const goToLevel = (index: number | null) => {
  if (index === null) {
    pathStack.value = [];
    currentParentId.value = null;
    return;
  }
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentParentId.value = pathStack.value[index].remoteId;
};

const goBack = () => {
  if (!pathStack.value.length) {
    goToLevel(null);
    return;
  }
  const target = pathStack.value.length - 2;
  goToLevel(target >= 0 ? target : null);
};
const selectNode = (node: BrowseNode) => {
  pendingNode.value = node;
};

const saveSelection = async () => {
  const node = pendingNode.value;
  if (!node || !props.productId || !props.salesChannelId || !props.salesChannelViewId) return;
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
            salesChannelView: { id: props.salesChannelViewId },
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
  }
};

const removeSelection = async () => {
  if (!productBrowseNodeId.value) return;
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
</script>

<template>
  <div>
    <h4 class="font-semibold mb-2">{{ t('products.products.amazon.browseNode') }}</h4>
    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.amazon.browseNodeDescription') }}
    </p>

    <div class="bg-blue-50 border rounded mt-4 p-6">
      <div v-if="displayedNode" class="mb-2">
        <div class="flex justify-between items-start">
          <div class="text-sm">
            {{ displayedNode.browsePathByName.join(' > ') }}
          </div>
          <div
            v-if="recommendedTypes.length"
            class="text-sm text-gray-500 ml-4 pl-4 border-l"
          >
            <div>{{ t('products.products.amazon.recommendedProductTypes') }}</div>
            <ul class="mt-1 space-y-1">
              <li
                v-for="type in recommendedTypes"
                :key="type.code"
                class="flex items-center gap-2"
              >
                <Icon
                  :name="type.exists ? 'circle-check' : 'circle-xmark'"
                  class="w-3"
                  :class="type.exists ? 'text-green-500' : 'text-red-500'"
                />
                <Link
                  v-if="type.exists && type.id"
                  :path="{
                    name: 'integrations.amazonProductTypes.edit',
                    params: { type: 'amazon', id: type.id },
                    query: { integrationId: props.salesChannelId },
                  }"
                  class="hover:underline"
                >
                  {{ type.name }}
                </Link>
                <span v-else>{{ type.name }}</span>
                <Button
                  v-if="!type.exists"
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="confirmCreateType(type)"
                >
                  <Icon name="plus" />
                </Button>
              </li>
            </ul>
          </div>
        </div>
        <div class="flex gap-2 mt-2">
          <Button
            v-if="pendingNode"
            class="btn btn-sm btn-primary"
            @click="saveSelection"
          >
            {{ t('shared.button.save') }}
          </Button>
          <Button
            v-if="pendingNode"
            class="btn btn-sm btn-outline-dark"
            @click="cancelSelection"
          >
            {{ t('shared.button.cancel') }}
          </Button>
          <Button
            v-if="productBrowseNodeId"
            class="btn btn-sm btn-outline-danger"
            @click="removeSelection"
          >
            {{ t('shared.button.delete') }}
          </Button>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ t('products.products.amazon.noBrowseNodeSelected') }}
      </div>
    </div>

    <div class="p-6 border rounded">
      <div class="mb-2 text-base font-semibold flex flex-wrap items-center gap-1 py-2">
        <span
          class="cursor-pointer hover:underline"
          @click="goToLevel(null)"
          >{{ t('products.products.amazon.browseNodeRoot') }}</span
        >
        <template v-for="(crumb, index) in pathStack" :key="crumb.remoteId">
          <span>&gt;</span>
          <span
            class="cursor-pointer hover:underline"
            @click="goToLevel(index)"
            >{{ crumb.name }}</span
          >
        </template>
        <Button
          v-if="pathStack.length"
          class="btn btn-sm btn-outline-primary ml-auto"
          @click="goBack"
        >
          {{ t('shared.button.back') }}
        </Button>
      </div>

      <div v-if="loadingNodes">
        <LocalLoader :loading="true" />
      </div>
      <ul v-else>
        <li
          v-for="node in nodes"
          :key="node.remoteId"
          :class="[
            'flex justify-between items-center py-1 border-b last:border-b-0',
            node.hasChildren ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed',
          ]"
          @click="node.hasChildren && goToChild(node)"
        >
          <span class="flex items-center gap-2 flex-1">
            <Icon :name="node.hasChildren ? 'angle-right' : 'circle'" class="w-3" />
            <span>
              <div>{{ node.name }}</div>
            </span>
          </span>
          <div class="flex gap-2">
            <template v-if="pendingNode && pendingNode.remoteId === node.remoteId">
              <Button class="btn btn-sm btn-primary" disabled @click.stop>
                {{ t('shared.labels.selected') }}
              </Button>
              <Button
                class="btn btn-sm btn-outline-dark"
                @click.stop="cancelSelection"
              >
                {{ t('shared.button.cancel') }}
              </Button>
            </template>
            <Button
              v-else
              class="btn btn-sm btn-outline-primary"
              @click.stop="selectNode(node)"
            >
              {{ t('shared.button.select') }}
            </Button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

