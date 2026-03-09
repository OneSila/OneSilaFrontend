<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { ebayStoreCategoriesQuery } from '../../../../../../../../shared/api/queries/ebayStoreCategories.js';
import { pullEbayStoreCategoriesMutation } from '../../../../../../../../shared/api/mutations/ebayProducts.js';
import {
  mapStoreCategoriesConnection,
  type EbayStoreCategoryNode,
} from './ebayStoreCategoryUtils';

const props = defineProps<{
  salesChannelId: string | null;
}>();

const emit = defineEmits<{
  (e: 'selected', payload: { node: EbayStoreCategoryNode; path: EbayStoreCategoryNode[] }): void;
}>();

const { t } = useI18n();

const nodes = ref<EbayStoreCategoryNode[]>([]);
const loadingNodes = ref(false);
const pulling = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<EbayStoreCategoryNode[]>([]);
const search = ref('');

const filteredNodes = computed(() =>
  nodes.value
    .filter((node) => node.name.toLowerCase().includes(search.value.toLowerCase()))
    .sort((a, b) => (a.order - b.order) || a.name.localeCompare(b.name)),
);

const isBusy = computed(() => loadingNodes.value || pulling.value);

const resetNavigation = () => {
  pathStack.value = [];
  currentParentId.value = null;
  search.value = '';
};

const fetchNodes = async (fetchPolicy: 'cache-first' | 'network-only' | 'no-cache' = 'cache-first') => {
  if (!props.salesChannelId) {
    nodes.value = [];
    return;
  }

  loadingNodes.value = true;
  try {
    const filter: Record<string, any> = {
      salesChannel: { id: { exact: props.salesChannelId } },
    };
    if (!currentParentId.value) {
      filter.parent = { id: { isNull: true } };
    } else {
      filter.parent = { id: { exact: currentParentId.value } };
    }
    const { data } = await apolloClient.query({
      query: ebayStoreCategoriesQuery,
      variables: {
        first: 100,
        filter,
      },
      fetchPolicy,
    });
    nodes.value = mapStoreCategoriesConnection(data?.ebayStoreCategories);
  } catch (error) {
    nodes.value = [];
    displayApolloError(error);
  } finally {
    loadingNodes.value = false;
  }
};

watch(
  () => props.salesChannelId,
  async () => {
    resetNavigation();
    await fetchNodes();
  },
  { immediate: true },
);

const goToChild = (node: EbayStoreCategoryNode) => {
  pathStack.value.push(node);
  currentParentId.value = node.id;
  search.value = '';
  void fetchNodes();
};

const goToLevel = (index: number | null) => {
  if (index === null) {
    resetNavigation();
    void fetchNodes();
    return;
  }
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentParentId.value = pathStack.value[index].id;
  search.value = '';
  void fetchNodes();
};

const goBack = () => {
  if (!pathStack.value.length) {
    goToLevel(null);
    return;
  }
  const target = pathStack.value.length - 2;
  goToLevel(target >= 0 ? target : null);
};

const selectNode = (node: EbayStoreCategoryNode) => {
  if (!node.isLeaf) {
    Toast.info(t('products.products.ebay.storeCategories.leafRestriction'));
    return;
  }
  search.value = '';
  emit('selected', { node, path: [...pathStack.value, node] });
};

const pullStoreCategories = async () => {
  if (!props.salesChannelId || pulling.value) return;

  pulling.value = true;
  try {
    await apolloClient.mutate({
      mutation: pullEbayStoreCategoriesMutation,
      variables: {
        instance: { id: props.salesChannelId },
      },
    });
    apolloClient.cache.evict({ fieldName: 'ebayStoreCategories' });
    apolloClient.cache.gc();
    resetNavigation();
    await fetchNodes('network-only');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1200);
    });
    await fetchNodes('network-only');
    Toast.success(t('products.products.ebay.storeCategories.pullSuccess'));
  } catch (error) {
    displayApolloError(error);
  } finally {
    pulling.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col min-h-0 h-full max-h-[65vh]">
    <div class="flex items-center gap-2 text-sm mb-2">
      <span class="cursor-pointer hover:underline" @click="goToLevel(null)">
        {{ t('products.products.ebay.rootLabel') }}
      </span>
      <template v-for="(crumb, index) in pathStack" :key="crumb.remoteId">
        <span>/</span>
        <span class="cursor-pointer hover:underline" @click="goToLevel(index)">
          {{ crumb.name }}
        </span>
      </template>
      <div v-if="pathStack.length" class="flex gap-1 ml-auto">
        <Button class="btn btn-sm btn-outline-primary" @click="goBack">
          {{ t('shared.button.back') }}
        </Button>
      </div>
    </div>

    <div class="flex items-center gap-2 mb-2">
      <input
        v-model="search"
        type="text"
        class="form-input flex-1 min-w-0"
        :placeholder="t('shared.button.search') + '...'"
        :disabled="isBusy"
      />
      <Button class="btn btn-sm btn-outline-primary" :loading="pulling" :disabled="!salesChannelId || pulling" @click="pullStoreCategories">
        <Icon name="rotate" class="w-3.5 h-3.5 mr-1" />
        {{ t('products.products.ebay.storeCategories.pullButton') }}
      </Button>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto pr-1">
      <div v-if="isBusy" class="h-full">
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
            @click="!node.isLeaf ? goToChild(node) : selectNode(node)"
          >
            <Icon :name="!node.isLeaf ? 'angle-right' : 'circle'" class="w-3.5" />
            <div class="min-w-0">
              <div class="truncate">
                {{ node.name }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ node.fullPath }}
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              class="btn btn-sm btn-outline-primary"
              :disabled="!node.isLeaf"
              :title="!node.isLeaf ? t('products.products.ebay.storeCategories.leafRestriction') : undefined"
              @click.stop="selectNode(node)"
            >
              {{ t('shared.button.select') }}
            </Button>
          </div>
        </li>
      </ul>
    </div>

    <div class="mt-3">
      <slot name="after-search" />
    </div>
  </div>
</template>
