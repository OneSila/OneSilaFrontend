<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { ebayCategoriesQuery } from '../../../../../../../../shared/api/queries/ebayCategories.js';
import { mapCategoriesConnection, type EbayCategoryNode } from './ebayCategoryUtils';

const props = defineProps<{
  defaultCategoryTreeId: string | null;
}>();

const emit = defineEmits<{
  (e: 'selected', payload: { node: EbayCategoryNode; path: EbayCategoryNode[] }): void;
}>();

const { t } = useI18n();

const nodes = ref<EbayCategoryNode[]>([]);
const loadingNodes = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<EbayCategoryNode[]>([]);
const search = ref('');

const filteredNodes = computed(() =>
  nodes.value.filter((node) =>
    node.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const resetNavigation = () => {
  pathStack.value = [];
  currentParentId.value = null;
  search.value = '';
};

const fetchNodes = async () => {
  if (!props.defaultCategoryTreeId) {
    nodes.value = [];
    return;
  }
  loadingNodes.value = true;
  try {
    const filter: Record<string, any> = {
      marketplaceDefaultTreeId: { exact: props.defaultCategoryTreeId },
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

watch(
  () => props.defaultCategoryTreeId,
  async () => {
    resetNavigation();
    await fetchNodes();
  },
  { immediate: true },
);

const goToChild = (node: EbayCategoryNode) => {
  pathStack.value.push(node);
  currentParentId.value = node.remoteId;
  search.value = '';
  fetchNodes();
};

const goToLevel = (index: number | null) => {
  if (index === null) {
    resetNavigation();
    fetchNodes();
    return;
  }
  pathStack.value = pathStack.value.slice(0, index + 1);
  currentParentId.value = pathStack.value[index].remoteId;
  search.value = '';
  fetchNodes();
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
  emit('selected', { node, path: [...pathStack.value, node] });
};
</script>

<template>
  <div class="flex flex-col min-h-0 h-full max-h-[65vh]">
    <div class="flex items-center gap-2 text-sm mb-2">
      <span class="cursor-pointer hover:underline" @click="goToLevel(null)">
        {{ t('products.products.ebay.rootLabel') }}
      </span>
      <template v-for="(crumb, index) in pathStack" :key="crumb.remoteId">
        <span>&gt;</span>
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

    <input
      v-model="search"
      type="text"
      class="form-input w-full mb-2"
      :placeholder="t('shared.button.search') + '...'"
    />

    <div class="flex-1 min-h-0 overflow-y-auto pr-1">
      <div v-if="loadingNodes" class="h-full">
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
  </div>
</template>
