<script setup lang="ts">
import { ref, watch, computed } from 'vue';
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
const pendingNode = ref<BrowseNode | null>(null);
const productBrowseNodeId = ref<string | null>(null);

const displayedNode = computed(() => pendingNode.value || selectedNodeDetails.value);

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
  if (productBrowseNodeId.value) {
    await apolloClient.mutate({
      mutation: updateAmazonProductBrowseNodeMutation,
      variables: {
        id: productBrowseNodeId.value,
        data: { recommendedBrowseNodeId: node.remoteId },
      },
    });
  } else {
    const { data } = await apolloClient.mutate({
      mutation: createAmazonProductBrowseNodeMutation,
      variables: {
        data: {
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
  pendingNode.value = null;
};

const removeSelection = async () => {
  if (!productBrowseNodeId.value) return;
  await apolloClient.mutate({
    mutation: deleteAmazonProductBrowseNodeMutation,
    variables: { id: productBrowseNodeId.value },
  });
  productBrowseNodeId.value = null;
  selectedNodeDetails.value = null;
  pendingNode.value = null;
};
</script>

<template>
  <div>
    <h4 class="font-semibold mb-2">{{ t('products.products.amazon.browseNode') }}</h4>

    <div class="mb-4">
      <div v-if="displayedNode" class="mb-2">
        <div class="flex justify-between items-start">
          <div class="text-sm">
            {{ displayedNode.browsePathByName.join(' > ') }}
          </div>
          <div
            v-if="displayedNode.productTypeDefinitions.length"
            class="text-xs text-gray-500 ml-4"
          >
            <div>{{ t('products.products.amazon.recommendedProductTypes') }}</div>
            <ul class="list-disc ml-4">
              <li
                v-for="type in displayedNode.productTypeDefinitions"
                :key="type"
              >
                {{ type }}
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
            v-if="productBrowseNodeId"
            class="btn btn-xs btn-outline-danger"
            @click="removeSelection"
          >
            {{ t('shared.button.remove') }}
          </Button>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500">
        {{ t('products.products.amazon.noBrowseNodeSelected') }}
      </div>
    </div>

    <div class="border rounded p-2">
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
          class="btn btn-xs btn-outline-primary ml-auto"
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
            { 'cursor-pointer hover:bg-gray-100': node.hasChildren },
          ]"
          @click="node.hasChildren && goToChild(node)"
        >
          <span class="flex-1">{{ node.name }}</span>
          <Button
            v-if="pendingNode && pendingNode.remoteId === node.remoteId"
            class="btn btn-xs btn-primary"
            disabled
            @click.stop
          >
            {{ t('shared.labels.selected') }}
          </Button>
          <Button
            v-else
            class="btn btn-xs btn-outline-primary"
            @click.stop="selectNode(node)"
          >
            {{ t('shared.button.select') }}
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

