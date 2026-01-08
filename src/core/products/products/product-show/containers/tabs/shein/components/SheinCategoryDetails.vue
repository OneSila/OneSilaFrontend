<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../../apollo-client';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { sheinPropertiesByRemoteIdsQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import {
  parseCategoryProperties,
  type SheinCategoryNode,
} from './sheinCategoryUtils';

const props = defineProps<{
  category: SheinCategoryNode | null;
  salesChannelId: string | null;
  channel: any | null;
}>();

const { t } = useI18n();

const localPropertiesByRemoteId = ref<Record<string, { id: string; name: string }>>({});
const remotePropertiesByRemoteId = ref<Record<string, { id: string; name: string }>>({});

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
    } catch (_error) {
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

const categoryProperties = computed(() =>
  formatCategoryProperties(parseCategoryProperties(props.category?.properties)),
);

const categoryPropertyRemoteIds = computed(() => {
  const ids = new Set<string>();
  categoryProperties.value.forEach((item) => {
    if (item.propertyId) {
      ids.add(item.propertyId);
    }
  });
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

const copyCategoryId = async (remoteId?: string | null) => {
  if (!remoteId) return;
  try {
    await navigator.clipboard.writeText(remoteId);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (_error) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};
</script>

<template>
  <div v-if="category">
    <div class="text-sm font-medium">{{ category.name }}</div>
    <div class="text-xs text-gray-500 flex items-center gap-2">
      <span>{{ category.remoteId }}</span>
      <button
        class="p-1 rounded hover:bg-gray-100"
        type="button"
        @click="copyCategoryId(category.remoteId)"
      >
        <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>
    <div v-if="category.defaultLanguage || category.currency" class="text-xs text-gray-500 mt-1">
      <span v-if="category.defaultLanguage">
        {{ t('products.products.shein.defaultLanguage', { code: category.defaultLanguage }) }}
      </span>
      <span v-if="category.defaultLanguage && category.currency" class="mx-1">•</span>
      <span v-if="category.currency">
        {{ t('products.products.shein.currency', { code: category.currency }) }}
      </span>
    </div>
    <div v-if="category.productTypeRemoteId" class="text-xs text-gray-500 mt-1">
      {{ t('products.products.shein.productTypeRemoteId', { id: category.productTypeRemoteId }) }}
    </div>

    <div class="mt-3">
      <h6 class="font-semibold text-xs text-gray-700 mb-1">
        {{ t('products.products.shein.categoryAttributes.title') }}
      </h6>
      <p class="text-xs text-gray-500 mb-2">
        {{ t('products.products.shein.categoryAttributes.description') }}
      </p>
      <div v-if="categoryProperties.length" class="overflow-x-auto">
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
            <tr v-for="item in categoryProperties" :key="`${item.name}-${item.propertyType}`">
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
</template>
