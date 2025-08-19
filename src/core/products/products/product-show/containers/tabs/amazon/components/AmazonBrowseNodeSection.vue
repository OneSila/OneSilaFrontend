<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import {
  amazonBrowseNodesQuery,
  amazonProductBrowseNodesQuery,
} from '../../../../../../../../shared/api/queries/amazonProducts.js';
import {
  createAmazonProductBrowseNodeMutation,
  updateAmazonProductBrowseNodeMutation,
  deleteAmazonProductBrowseNodeMutation,
} from '../../../../../../../../shared/api/mutations/amazonProducts.js';

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
const productBrowseNodeId = ref<string | null>(null);

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

watch([
  () => props.productId,
  () => props.salesChannelViewId,
  () => props.marketplaceId,
], fetchSelected, { immediate: true });

const goToChild = (node: BrowseNode) => {
  pathStack.value.push(node);
  currentParentId.value = node.remoteId;
};

const goBack = () => {
  pathStack.value.pop();
  currentParentId.value = pathStack.value.length
    ? pathStack.value[pathStack.value.length - 1].remoteId
    : null;
};

const selectNode = async (node: BrowseNode) => {
  if (!props.productId || !props.salesChannelId || !props.salesChannelViewId) return;
  if (productBrowseNodeId.value) {
    await apolloClient.mutate({
      mutation: updateAmazonProductBrowseNodeMutation,
      variables: {
        id: productBrowseNodeId.value,
        input: { recommendedBrowseNodeId: node.remoteId },
      },
    });
  } else {
    const { data } = await apolloClient.mutate({
      mutation: createAmazonProductBrowseNodeMutation,
      variables: {
        input: {
          product: props.productId,
          salesChannel: props.salesChannelId,
          salesChannelView: props.salesChannelViewId,
          recommendedBrowseNodeId: node.remoteId,
        },
      },
    });
    productBrowseNodeId.value = data?.createAmazonProductBrowseNode?.id || null;
  }
  await fetchSelectedNodeDetails(node.remoteId);
};

const removeSelection = async () => {
  if (!productBrowseNodeId.value) return;
  await apolloClient.mutate({
    mutation: deleteAmazonProductBrowseNodeMutation,
    variables: { id: productBrowseNodeId.value },
  });
  productBrowseNodeId.value = null;
  selectedNodeDetails.value = null;
};
</script>

<template>
  <div>
    <h4 class="font-semibold mb-2">{{ t('products.products.amazon.browseNode') }}</h4>

    <div class="mb-4">
      <div v-if="selectedNodeDetails" class="mb-2">
        <div class="text-sm">
          {{ selectedNodeDetails.browsePathByName.join(' > ') }}
        </div>
        <div
          v-if="selectedNodeDetails.productTypeDefinitions.length"
          class="text-xs text-gray-500 mt-1"
        >
          {{ t('products.products.amazon.recommendedProductTypes') }}:
          {{ selectedNodeDetails.productTypeDefinitions.join(', ') }}
        </div>
        <Button class="btn btn-xs btn-outline-danger mt-2" @click="removeSelection">
          {{ t('shared.button.remove') }}
        </Button>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ t('products.products.amazon.noBrowseNodeSelected') }}
      </div>
    </div>

    <div class="border rounded p-2">
      <div class="mb-2 flex items-center justify-between">
        <div class="text-sm font-semibold">
          <span v-if="pathStack.length">{{ pathStack.map((p) => p.name).join(' / ') }}</span>
          <span v-else>{{ t('products.products.amazon.browseNodeRoot') }}</span>
        </div>
        <Button v-if="pathStack.length" class="btn btn-xs btn-outline-primary" @click="goBack">
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
          class="flex justify-between items-center py-1 border-b last:border-b-0"
        >
          <span>{{ node.name }}</span>
          <div class="flex gap-1">
            <Button class="btn btn-xs btn-outline-primary" @click="selectNode(node)">
              {{ t('shared.button.select') }}
            </Button>
            <Button
              v-if="node.hasChildren"
              class="btn btn-xs btn-outline-secondary"
              @click="goToChild(node)"
            >
              {{ t('shared.button.open') }}
            </Button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

