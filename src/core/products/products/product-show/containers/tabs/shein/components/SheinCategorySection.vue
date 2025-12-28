<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { sheinCategoriesQuery } from '../../../../../../../../shared/api/queries/sheinCategories.js';
import { sheinPropertiesByRemoteIdsQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import {
  createSheinProductCategoryMutation,
  updateSheinProductCategoryMutation,
  deleteSheinProductCategoryMutation,
} from '../../../../../../../../shared/api/mutations/sheinProducts.js';

interface SheinCategoryNode {
  remoteId: string;
  name: string;
  parentRemoteId?: string | null;
  isLeaf: boolean;
  productTypeRemoteId?: string | null;
  defaultLanguage?: string | null;
  currency?: string | null;
  properties: any[];
}

const props = defineProps<{
  productId: string | null;
  salesChannelId: string | null;
  channel: any | null;
  category: { id: string | null; remoteId: string | null; salesChannelId?: string | null } | null;
  defaultCategory: { remoteId: string | null; name: string | null } | null;
}>();

const emit = defineEmits<{
  (e: 'saved', payload: { id: string; remoteId: string; salesChannelId: string | null }): void;
  (e: 'deleted'): void;
}>();

const { t } = useI18n();

const nodes = ref<SheinCategoryNode[]>([]);
const loadingNodes = ref(false);
const currentParentId = ref<string | null>(null);
const pathStack = ref<SheinCategoryNode[]>([]);
const pendingNode = ref<SheinCategoryNode | null>(null);
const selectedNode = ref<SheinCategoryNode | null>(null);
const savedRemoteId = ref<string | null>(null);
const productCategoryId = ref<string | null>(null);
const search = ref('');
const loadingSelected = ref(false);
const saving = ref(false);
const manualCategoryInput = ref('');
const manualSelectionLoading = ref(false);
const manualSelectionError = ref<string | null>(null);
const localPropertiesByRemoteId = ref<Record<string, { id: string; name: string }>>({});
const remotePropertiesByRemoteId = ref<Record<string, { id: string; name: string }>>({});

const manualCategoryId = computed(() => manualCategoryInput.value.trim());

const filteredNodes = computed(() =>
  nodes.value.filter((node) =>
    node.name.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const hasUnsavedChanges = computed(
  () => pendingNode.value !== null && pendingNode.value.remoteId !== savedRemoteId.value,
);

const parseCategoryProperties = (value: unknown): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      /* ignore malformed JSON */
    }
  }
  return [];
};

const normalizeRemarks = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry)).filter((entry) => entry);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry)).filter((entry) => entry);
      }
    } catch (error) {
      return value ? [value] : [];
    }
    return value ? [value] : [];
  }
  return [];
};

const normalizePropertyName = (value: unknown): string => {
  if (!value) return '';
  return String(value).replace(/^OPENAPI-\s*/i, '').trim();
};

const normalizeCategoryProperty = (entry: any) => {
  if (!entry || typeof entry !== 'object') {
    return {
      propertyId: '',
      name: normalizePropertyName(entry),
      nameEn: '',
      propertyType: '',
      valueMode: '',
      valueLimit: null,
      requirement: '',
      attributeType: '',
      isMainAttribute: false,
      allowsUnmappedValues: false,
      remarks: [],
    };
  }
  return {
    propertyId: String(entry.propertyId || entry.property_id || ''),
    name: normalizePropertyName(
      entry.propertyName ||
        entry.property_name ||
        entry.attributeName ||
        entry.attribute_name ||
        entry.name ||
        '',
    ),
    nameEn: normalizePropertyName(
      entry.propertyNameEn || entry.property_name_en || entry.name_en || '',
    ),
    propertyType: entry.propertyType || entry.property_type || entry.type || '',
    valueMode: entry.valueMode || entry.value_mode || '',
    valueLimit: entry.valueLimit ?? entry.value_limit ?? null,
    requirement: entry.requirement || '',
    attributeType: entry.attributeType || entry.attribute_type || '',
    isMainAttribute: Boolean(entry.isMainAttribute ?? entry.is_main_attribute),
    allowsUnmappedValues: Boolean(entry.allowsUnmappedValues ?? entry.allows_unmapped_values),
    remarks: normalizeRemarks(entry.remarks),
  };
};

const normalizeCategoryNode = (node: any): SheinCategoryNode => ({
  remoteId: String(node?.remoteId ?? ''),
  name: String(node?.name ?? ''),
  parentRemoteId: node?.parentRemoteId ?? null,
  isLeaf: Boolean(node?.isLeaf),
  productTypeRemoteId: node?.productTypeRemoteId ?? null,
  defaultLanguage: node?.defaultLanguage ?? null,
  currency: node?.currency ?? null,
  properties: parseCategoryProperties(node?.properties ?? node?.configuratorProperties),
});

const mapCategoriesConnection = (connection: any): SheinCategoryNode[] => {
  if (!connection) return [];
  const list = Array.isArray(connection)
    ? connection
    : connection.edges?.map((edge: any) => edge.node) || [];
  return list.map((item: any) => normalizeCategoryNode(item));
};

const resetNavigation = () => {
  pathStack.value = [];
  currentParentId.value = null;
  search.value = '';
};

const fetchNodes = async () => {
  if (!props.salesChannelId) {
    nodes.value = [];
    return;
  }
  loadingNodes.value = true;
  try {
    const filter: Record<string, any> = {};
    if (props.salesChannelId) {
      filter.salesChannel = { id: { exact: props.salesChannelId } };
    }
    if (currentParentId.value) {
      filter.parentRemoteId = { exact: currentParentId.value };
    }

    const { data } = await apolloClient.query({
      query: sheinCategoriesQuery,
      variables: { filter },
      fetchPolicy: 'cache-first',
    });
    nodes.value = mapCategoriesConnection(data?.sheinCategories);
  } catch (error) {
    nodes.value = [];
    displayApolloError(error);
  } finally {
    loadingNodes.value = false;
  }
};

const fetchCategoryDetails = async (remoteId: string) => {
  try {
    const filter: Record<string, any> = {
      remoteId: { exact: remoteId },
    };
    if (props.salesChannelId) {
      filter.salesChannel = { id: { exact: props.salesChannelId } };
    }
    const { data } = await apolloClient.query({
      query: sheinCategoriesQuery,
      variables: {
        first: 1,
        filter,
      },
      fetchPolicy: 'cache-first',
    });
    const categories = mapCategoriesConnection(data?.sheinCategories);
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

  if (!savedRemoteId.value) {
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
  () => props.channel?.id,
  () => {
    resetNavigation();
    fetchSelected();
    fetchNodes();
    manualCategoryInput.value = '';
    manualSelectionError.value = null;
  },
);

watch(
  () => currentParentId.value,
  () => {
    fetchNodes();
  },
  { immediate: true },
);

watch(
  manualCategoryInput,
  () => {
    manualSelectionError.value = null;
  },
);

const goToChild = (node: SheinCategoryNode) => {
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

const selectNode = (node: SheinCategoryNode) => {
  if (!node.isLeaf) {
    Toast.info(t('products.products.shein.leafRestriction'));
    return;
  }
  pendingNode.value = node;
};

const cancelSelection = () => {
  pendingNode.value = null;
};

const copyCategoryId = async (remoteId?: string | null) => {
  if (!remoteId) return;
  try {
    await navigator.clipboard.writeText(remoteId);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const formatCategoryProperties = (entries: any[]) =>
  entries
    .map((entry) => normalizeCategoryProperty(entry))
    .map((entry) => ({
      ...entry,
      name: entry.name || entry.nameEn,
      isConfigurator: entry.attributeType === 'sales',
    }))
    .filter((entry) =>
      Boolean(
        entry.name ||
          entry.nameEn ||
          entry.propertyType ||
          entry.requirement ||
          entry.attributeType ||
          entry.remarks.length,
      ),
    );

const formatRequirementLabel = (value: string) => {
  const labels: Record<string, string> = {
    required: t('products.products.shein.categoryAttributes.requirement.required'),
    optional: t('products.products.shein.categoryAttributes.requirement.optional'),
    not_fillable: t('products.products.shein.categoryAttributes.requirement.notFillable'),
  };
  return labels[value] || t('products.products.shein.categoryAttributes.requirement.unknown');
};

const formatAttributeTypeLabel = (value: string) => {
  const labels: Record<string, string> = {
    sales: t('products.products.shein.categoryAttributes.attributeType.sales'),
    size: t('products.products.shein.categoryAttributes.attributeType.size'),
    composition: t('products.products.shein.categoryAttributes.attributeType.composition'),
    common: t('products.products.shein.categoryAttributes.attributeType.common'),
  };
  return labels[value] || t('products.products.shein.categoryAttributes.unknown');
};

const selectedCategoryProperties = computed(() =>
  formatCategoryProperties(selectedNode.value?.properties ?? []),
);

const pendingCategoryProperties = computed(() =>
  formatCategoryProperties(pendingNode.value?.properties ?? []),
);

const categoryPropertyRemoteIds = computed(() => {
  const ids = new Set<string>();
  const addIds = (items: ReturnType<typeof formatCategoryProperties>) => {
    items.forEach((item) => {
      if (item.propertyId) {
        ids.add(item.propertyId);
      }
    });
  };
  addIds(selectedCategoryProperties.value);
  addIds(pendingCategoryProperties.value);
  return Array.from(ids);
});

const fetchLocalProperties = async () => {
  const ids = categoryPropertyRemoteIds.value;
  if (!props.salesChannelId || !ids.length) {
    localPropertiesByRemoteId.value = {};
    remotePropertiesByRemoteId.value = {};
    return;
  }
  try {
    const { data } = await apolloClient.query({
      query: sheinPropertiesByRemoteIdsQuery,
      variables: {
        first: ids.length,
        filter: {
          salesChannel: { id: { exact: props.salesChannelId } },
          remoteId: { inList: ids },
        },
      },
      fetchPolicy: 'cache-first',
    });
    const edges = data?.sheinProperties?.edges || [];
    const localMap: Record<string, { id: string; name: string }> = {};
    const remoteMap: Record<string, { id: string; name: string }> = {};
    edges.forEach((edge: any) => {
      const node = edge?.node;
      const remoteId = node?.remoteId;
      if (!remoteId) {
        return;
      }
      remoteMap[String(remoteId)] = {
        id: String(node?.id || ''),
        name: String(node?.name || node?.nameEn || ''),
      };
      const localInstance = node?.localInstance;
      if (localInstance?.id) {
        localMap[String(remoteId)] = {
          id: String(localInstance.id),
          name: String(localInstance.name || node?.name || ''),
        };
      }
    });
    localPropertiesByRemoteId.value = localMap;
    remotePropertiesByRemoteId.value = remoteMap;
  } catch (error) {
    localPropertiesByRemoteId.value = {};
    remotePropertiesByRemoteId.value = {};
    displayApolloError(error);
  }
};

const getLocalProperty = (propertyId: string) =>
  localPropertiesByRemoteId.value[propertyId] || null;

const getRemoteProperty = (propertyId: string) =>
  remotePropertiesByRemoteId.value[propertyId] || null;

const remotePropertyPath = (propertyId: string) => {
  const remoteProperty = getRemoteProperty(propertyId);
  if (!remoteProperty?.id) {
    return undefined;
  }
  const integrationId = props.channel?.integrationPtr?.id;
  return {
    name: 'integrations.remoteProperties.edit',
    params: { type: 'shein', id: remoteProperty.id },
    query: {
      ...(integrationId ? { integrationId } : {}),
      ...(props.salesChannelId ? { salesChannelId: props.salesChannelId } : {}),
    },
  };
};

watch(
  [() => props.salesChannelId, () => categoryPropertyRemoteIds.value.join('|')],
  () => {
    fetchLocalProperties();
  },
  { immediate: true },
);

const saveSelection = async () => {
  if (!pendingNode.value || !props.productId || !props.salesChannelId) {
    return;
  }

  const productTypeRemoteId = pendingNode.value.productTypeRemoteId || null;
  if (!productTypeRemoteId) {
    Toast.error(t('products.products.shein.productTypeIdMissing'));
    return;
  }

  saving.value = true;
  try {
    const remoteId = pendingNode.value.remoteId;
    if (productCategoryId.value) {
      await apolloClient.mutate({
        mutation: updateSheinProductCategoryMutation,
        variables: {
          data: {
            id: productCategoryId.value,
            remoteId,
            productTypeRemoteId,
          },
        },
      });
    } else {
      const { data } = await apolloClient.mutate({
        mutation: createSheinProductCategoryMutation,
        variables: {
          data: {
            product: { id: props.productId },
            salesChannel: { id: props.salesChannelId },
            remoteId,
            productTypeRemoteId,
          },
        },
      });
      productCategoryId.value = data?.createSheinProductCategory?.id || null;
    }

    savedRemoteId.value = remoteId;
    selectedNode.value = pendingNode.value;
    pendingNode.value = null;
    Toast.success(t('products.products.shein.categorySaved'));
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
      mutation: deleteSheinProductCategoryMutation,
      variables: { data: { id: productCategoryId.value } },
    });
    productCategoryId.value = null;
    savedRemoteId.value = null;
    selectedNode.value = null;
    pendingNode.value = null;
    Toast.success(t('products.products.shein.categoryRemoved'));
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
      manualSelectionError.value = t('products.products.shein.manualEntry.invalid');
      return;
    }
    pendingNode.value = node;
  } finally {
    manualSelectionLoading.value = false;
  }
};

const hasChannel = computed(() => Boolean(props.channel));

defineExpose({ hasUnsavedChanges });
</script>

<template>
  <div>
    <Flex gap="2">
      <FlexCell>
        <h4 class="font-semibold mb-2">{{ t('products.products.shein.categoryTitle') }}</h4>
      </FlexCell>
    </Flex>
    <p class="text-xs text-gray-500 mb-2">
      {{ t('products.products.shein.categoryDescription') }}
    </p>

    <div class="bg-blue-50 border rounded mt-4 p-6">
      <div v-if="!hasChannel" class="text-sm text-gray-600">
        {{ t('products.products.shein.selectChannelPrompt') }}
      </div>
      <div v-else class="flex flex-col lg:flex-row gap-6">
        <div class="lg:w-1/2">
          <div class="flex items-center gap-2 text-sm mb-2">
            <span class="cursor-pointer hover:underline" @click="goToLevel(null)">
              {{ t('products.products.shein.rootLabel') }}
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
                @click="!node.isLeaf ? goToChild(node) : selectNode(node)"
              >
                <Icon :name="!node.isLeaf ? 'angle-right' : 'circle'" class="w-3" />
                <span>{{ node.name }}</span>
              </div>
              <div class="flex gap-2">
                <Button
                  class="btn btn-sm btn-outline-primary"
                  :disabled="!node.isLeaf"
                  :title="!node.isLeaf ? t('products.products.shein.leafRestriction') : undefined"
                  @click.stop="selectNode(node)"
                >
                  {{ t('shared.button.select') }}
                </Button>
              </div>
            </li>
          </ul>

          <div class="mt-6 border rounded bg-white p-4">
            <h6 class="font-semibold text-sm mb-1">
              {{ t('products.products.shein.manualEntry.title') }}
            </h6>
            <p class="text-xs text-gray-500 mb-3">
              {{ t('products.products.shein.manualEntry.description') }}
            </p>
            <div class="flex flex-col sm:flex-row gap-2">
              <input
                v-model="manualCategoryInput"
                type="text"
                class="form-input flex-1"
                :placeholder="t('products.products.shein.manualEntry.placeholder')"
                @keyup.enter="setManualCategory"
              />
              <Button
                class="btn btn-sm btn-outline-primary"
                :disabled="manualSelectionLoading || !manualCategoryId"
                :loading="manualSelectionLoading"
                @click="setManualCategory"
              >
                {{ t('products.products.shein.manualEntry.button') }}
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
              {{ t('products.products.shein.currentSelection') }}
            </h5>
            <div class="min-h-[56px] border rounded p-3 bg-white">
              <div v-if="loadingSelected">
                <LocalLoader :loading="true" />
              </div>
              <div v-else-if="selectedNode">
                <div class="text-sm font-medium">{{ selectedNode.name }}</div>
                <div class="text-xs text-gray-500 flex items-center gap-2">
                  <span>{{ selectedNode.remoteId }}</span>
                  <button
                    class="p-1 rounded hover:bg-gray-100"
                    type="button"
                    @click="copyCategoryId(selectedNode.remoteId)"
                  >
                    <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
                <div v-if="selectedNode.defaultLanguage || selectedNode.currency" class="text-xs text-gray-500 mt-1">
                  <span v-if="selectedNode.defaultLanguage">{{ t('products.products.shein.defaultLanguage', { code: selectedNode.defaultLanguage }) }}</span>
                  <span v-if="selectedNode.defaultLanguage && selectedNode.currency" class="mx-1">•</span>
                  <span v-if="selectedNode.currency">{{ t('products.products.shein.currency', { code: selectedNode.currency }) }}</span>
                </div>
                <div v-if="selectedNode.productTypeRemoteId" class="text-xs text-gray-500 mt-1">
                  {{ t('products.products.shein.productTypeRemoteId', { id: selectedNode.productTypeRemoteId }) }}
                </div>

                <div class="mt-3">
                  <h6 class="font-semibold text-xs text-gray-700 mb-1">
                    {{ t('products.products.shein.categoryAttributes.title') }}
                  </h6>
                  <p class="text-xs text-gray-500 mb-2">
                    {{ t('products.products.shein.categoryAttributes.description') }}
                  </p>
                  <div v-if="selectedCategoryProperties.length" class="overflow-x-auto">
                    <table class="min-w-[720px] w-full text-xs text-left">
                      <thead class="text-gray-500 uppercase border-b">
                        <tr>
                          <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.property') }}</th>
                          <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.type') }}</th>
                          <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.requirement') }}</th>
                          <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.configurable') }}</th>
                          <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.main') }}</th>
                          <th class="py-2">{{ t('products.products.shein.categoryAttributes.columns.attributeType') }}</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y">
                        <tr v-for="item in selectedCategoryProperties" :key="`${item.name}-${item.propertyType}`">
                          <td class="py-2 pr-3 text-gray-700">
                            <div class="font-medium">
                              <Link
                                v-if="item.propertyId && remotePropertyPath(item.propertyId)"
                                :path="remotePropertyPath(item.propertyId)"
                                target="_blank"
                              >
                                {{ item.name || t('products.products.shein.categoryAttributes.unknown') }}
                              </Link>
                              <span v-else>
                                {{ item.name || t('products.products.shein.categoryAttributes.unknown') }}
                              </span>
                            </div>
                            <div v-if="item.nameEn && item.nameEn !== item.name" class="text-[11px] text-gray-500">
                              {{ item.nameEn }}
                            </div>
                            <div class="text-[11px] text-gray-500 mt-1">
                              <span class="font-semibold">
                                {{ t('products.products.shein.categoryAttributes.localProperty') }}:
                              </span>
                              <template v-if="item.propertyId && getLocalProperty(item.propertyId)">
                                <Link
                                  class="ml-1"
                                  target="_blank"
                                  :path="{
                                    name: 'properties.properties.show',
                                    params: { id: getLocalProperty(item.propertyId)?.id },
                                  }"
                                >
                                  {{ getLocalProperty(item.propertyId)?.name }}
                                </Link>
                              </template>
                              <span v-else class="ml-1">-</span>
                            </div>
                          </td>
                          <td class="py-2 pr-3 text-gray-700">
                            <div>{{ item.propertyType || t('products.products.shein.categoryAttributes.unknown') }}</div>
                            <div v-if="item.valueMode" class="text-[11px] text-gray-500">
                              {{ t('products.products.shein.categoryAttributes.valueMode', { mode: item.valueMode }) }}
                            </div>
                          </td>
                          <td class="py-2 pr-3 text-gray-700">
                            {{ formatRequirementLabel(item.requirement) }}
                          </td>
                          <td class="py-2 pr-3 text-gray-700">
                            <Icon
                              :name="item.isConfigurator ? 'check-circle' : 'times-circle'"
                              :class="item.isConfigurator ? 'text-green-500' : 'text-red-500'"
                            />
                          </td>
                          <td class="py-2 pr-3 text-gray-700">
                            <Icon
                              :name="item.isMainAttribute ? 'check-circle' : 'times-circle'"
                              :class="item.isMainAttribute ? 'text-green-500' : 'text-red-500'"
                            />
                          </td>
                          <td class="py-2 text-gray-700">
                            {{ formatAttributeTypeLabel(item.attributeType) }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div v-else class="text-xs text-gray-500">
                    {{ t('products.products.shein.categoryAttributes.empty') }}
                  </div>
                </div>
              </div>
              <div v-else>
                <div
                  v-if="defaultCategory?.remoteId"
                  class="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700"
                >
                  <div class="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    <Icon name="folder" class="w-4 h-4 text-gray-500" />
                    {{ t('products.products.shein.defaultCategoryTitle') }}
                  </div>
                  <div class="text-sm">
                    {{ defaultCategory.name || defaultCategory.remoteId }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>
                      {{ t('products.products.shein.defaultCategoryInfo', { id: defaultCategory.remoteId }) }}
                    </span>
                    <button
                      class="p-1 rounded hover:bg-gray-100"
                      type="button"
                      @click="copyCategoryId(defaultCategory.remoteId)"
                    >
                      <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div v-else class="text-sm text-gray-500">
                  {{ t('products.products.shein.noSelection') }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="pendingNode" class="border rounded p-3 bg-white">
            <h6 class="font-semibold text-sm mb-1">
              {{ t('products.products.shein.pendingSelection') }}
            </h6>
            <div class="text-sm font-medium">{{ pendingNode.name }}</div>
            <div class="text-xs text-gray-500 flex items-center gap-2">
              <span>{{ pendingNode.remoteId }}</span>
              <button
                class="p-1 rounded hover:bg-gray-100"
                type="button"
                @click="copyCategoryId(pendingNode.remoteId)"
              >
                <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
            <div v-if="pendingNode.defaultLanguage || pendingNode.currency" class="text-xs text-gray-500 mt-1">
              <span v-if="pendingNode.defaultLanguage">{{ t('products.products.shein.defaultLanguage', { code: pendingNode.defaultLanguage }) }}</span>
              <span v-if="pendingNode.defaultLanguage && pendingNode.currency" class="mx-1">•</span>
              <span v-if="pendingNode.currency">{{ t('products.products.shein.currency', { code: pendingNode.currency }) }}</span>
            </div>
            <div v-if="pendingNode.productTypeRemoteId" class="text-xs text-gray-500 mt-1">
              {{ t('products.products.shein.productTypeRemoteId', { id: pendingNode.productTypeRemoteId }) }}
            </div>

            <div class="mt-3">
              <h6 class="font-semibold text-xs text-gray-700 mb-1">
                {{ t('products.products.shein.categoryAttributes.title') }}
              </h6>
              <p class="text-xs text-gray-500 mb-2">
                {{ t('products.products.shein.categoryAttributes.description') }}
              </p>
              <div v-if="pendingCategoryProperties.length" class="overflow-x-auto">
                <table class="min-w-[720px] w-full text-xs text-left">
                  <thead class="text-gray-500 uppercase border-b">
                    <tr>
                      <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.property') }}</th>
                      <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.type') }}</th>
                      <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.requirement') }}</th>
                      <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.configurable') }}</th>
                      <th class="py-2 pr-3">{{ t('products.products.shein.categoryAttributes.columns.main') }}</th>
                      <th class="py-2">{{ t('products.products.shein.categoryAttributes.columns.attributeType') }}</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y">
                    <tr v-for="item in pendingCategoryProperties" :key="`${item.name}-${item.propertyType}`">
                      <td class="py-2 pr-3 text-gray-700">
                        <div class="font-medium">
                          <Link
                            v-if="item.propertyId && remotePropertyPath(item.propertyId)"
                            class="text-primary underline"
                            :path="remotePropertyPath(item.propertyId)"
                          >
                            {{ item.name || t('products.products.shein.categoryAttributes.unknown') }}
                          </Link>
                          <span v-else>
                            {{ item.name || t('products.products.shein.categoryAttributes.unknown') }}
                          </span>
                        </div>
                        <div v-if="item.nameEn && item.nameEn !== item.name" class="text-[11px] text-gray-500">
                          {{ item.nameEn }}
                        </div>
                        <div class="text-[11px] text-gray-500 mt-1">
                          <span class="font-semibold">
                            {{ t('products.products.shein.categoryAttributes.localProperty') }}:
                          </span>
                          <template v-if="item.propertyId && getLocalProperty(item.propertyId)">
                            <Link
                              class="ml-1 text-primary underline"
                              :path="{
                                name: 'properties.properties.show',
                                params: { id: getLocalProperty(item.propertyId)?.id },
                              }"
                            >
                              {{ getLocalProperty(item.propertyId)?.name }}
                            </Link>
                          </template>
                          <span v-else class="ml-1">-</span>
                        </div>
                      </td>
                      <td class="py-2 pr-3 text-gray-700">
                        <div>{{ item.propertyType || t('products.products.shein.categoryAttributes.unknown') }}</div>
                        <div v-if="item.valueMode" class="text-[11px] text-gray-500">
                          {{ t('products.products.shein.categoryAttributes.valueMode', { mode: item.valueMode }) }}
                        </div>
                      </td>
                      <td class="py-2 pr-3 text-gray-700">
                        {{ formatRequirementLabel(item.requirement) }}
                      </td>
                      <td class="py-2 pr-3 text-gray-700">
                        <Icon
                          :name="item.isConfigurator ? 'check-circle' : 'times-circle'"
                          :class="item.isConfigurator ? 'text-green-500' : 'text-red-500'"
                        />
                      </td>
                      <td class="py-2 pr-3 text-gray-700">
                        <Icon
                          :name="item.isMainAttribute ? 'check-circle' : 'times-circle'"
                          :class="item.isMainAttribute ? 'text-green-500' : 'text-red-500'"
                        />
                      </td>
                      <td class="py-2 text-gray-700">
                        {{ formatAttributeTypeLabel(item.attributeType) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-xs text-gray-500">
                {{ t('products.products.shein.categoryAttributes.empty') }}
              </div>
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

          <div v-if="productCategoryId" class="flex gap-2">
            <Button class="btn btn-sm btn-outline-danger" :disabled="saving" @click="removeSelection">
              {{ t('products.products.shein.removeCategory') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
