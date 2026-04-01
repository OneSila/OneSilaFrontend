<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { IntegrationTypes } from '../../../../../../../integrations/integrations/integrations';
import type { MiraklCategoryNode } from './miraklCategoryUtils';

const props = defineProps<{
  category: MiraklCategoryNode | null;
  salesChannelId: string | null;
  channel: any | null;
}>();

const { t } = useI18n();

const isTemplateMissing = (productType: MiraklCategoryNode['productTypes'][number]) =>
  !productType.readyToPush && !productType.templateUrl;

const getMiraklIntegrationShowId = () =>
  props.channel?.id || props.channel?.saleschannelPtr?.proxyId || props.channel?.integrationPtr?.id || null;

const productTypePath = (productType: MiraklCategoryNode['productTypes'][number]) => {
  if (!productType.id) {
    return undefined;
  }

  const query: Record<string, string> = {};
  const integrationId = getMiraklIntegrationShowId();

  if (integrationId) {
    query.integrationId = integrationId;
  }

  if (props.salesChannelId) {
    query.salesChannelId = props.salesChannelId;
  }

  return {
    name: 'integrations.remoteProductTypes.edit',
    params: { type: IntegrationTypes.Mirakl, id: productType.id },
    ...(Object.keys(query).length ? { query } : {}),
  };
};

const remotePropertyPath = (propertyId?: string | null) => {
  if (!propertyId) {
    return undefined;
  }

  const integrationId = getMiraklIntegrationShowId();
  return {
    name: 'integrations.remoteProperties.edit',
    params: { type: 'mirakl', id: propertyId },
    query: {
      ...(integrationId ? { integrationId } : {}),
      ...(props.salesChannelId ? { salesChannelId: props.salesChannelId } : {}),
    },
  };
};

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
  <div v-if="category" class="min-w-0 max-w-full overflow-hidden">
    <div class="text-sm font-medium break-words">{{ category.name }}</div>
    <div class="text-xs text-gray-500 flex items-center gap-2 min-w-0">
      <span class="truncate">{{ category.remoteId }}</span>
      <button
        class="flex-shrink-0 p-1 rounded hover:bg-gray-100"
        type="button"
        @click="copyCategoryId(category.remoteId)"
      >
        <Icon name="clipboard" class="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>

    <div class="mt-4">
      <div class="font-semibold text-sm mb-2">
        {{ t('products.products.mirakl.details.productTypes') }}
      </div>

      <div v-if="!category.productTypes.length" class="text-sm text-gray-500">
        {{ t('products.products.mirakl.details.noProductTypes') }}
      </div>
      <div v-else class="space-y-6 min-w-0">
        <div
          v-for="productType in category.productTypes"
          :key="productType.id || productType.remoteId"
          class="space-y-4 rounded-md border border-gray-200 bg-white p-4 min-w-0"
        >
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-900 break-words">
              {{ productType.name || productType.remoteId }}
            </div>
            <div class="text-xs text-gray-500 break-all">
              {{ t('products.products.mirakl.details.productTypeId', { id: productType.remoteId }) }}
            </div>
          </div>

          <div
            v-if="isTemplateMissing(productType)"
            class="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            <div class="flex items-start gap-3">
              <Icon name="triangle-exclamation" class="mt-0.5 h-4 w-4 text-amber-500" />
              <span>{{ t('products.products.mirakl.details.templateMissingWarning') }}</span>
            </div>
            <div v-if="productTypePath(productType)">
              <Link
                :path="productTypePath(productType)"
                class="inline-flex items-center rounded bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                {{ t('products.products.mirakl.details.openProductType') }}
              </Link>
            </div>
          </div>

          <div v-if="!productType.items.length" class="text-sm text-gray-500">
            {{ t('products.products.mirakl.details.noItems') }}
          </div>

          <div v-else class="w-full max-w-full overflow-x-auto rounded-md border border-gray-200 custom-scrollbar">
            <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
              <thead>
                <tr>
                  <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.property') }}</th>
                  <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.code') }}</th>
                  <th class="p-2 text-left">{{ t('integrations.show.mirakl.properties.labels.requirementLevel') }}</th>
                  <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.required') }}</th>
                  <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.variant') }}</th>
                  <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.localProperty') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                <tr v-for="item in productType.items" :key="item.id">
                  <td class="p-2">
                    <Link
                      v-if="item.remoteProperty?.id"
                      :path="remotePropertyPath(item.remoteProperty.id)"
                      class="font-medium"
                    >
                      {{ item.remoteProperty?.name || item.remoteProperty?.code || '—' }}
                    </Link>
                    <span v-else class="font-medium">
                      {{ item.remoteProperty?.name || item.remoteProperty?.code || '—' }}
                    </span>
                  </td>
                  <td class="p-2">{{ item.remoteProperty?.code || '—' }}</td>
                  <td class="p-2">{{ item.requirementLevel || '—' }}</td>
                  <td class="p-2">
                    <Icon v-if="item.required" name="check-circle" class="text-green-500" />
                    <Icon v-else name="times-circle" class="text-red-500" />
                  </td>
                  <td class="p-2">
                    <Icon v-if="item.variant" name="check-circle" class="text-green-500" />
                    <Icon v-else name="times-circle" class="text-red-500" />
                  </td>
                  <td class="p-2">
                    {{ item.localInstance?.property?.name || item.remoteProperty?.localInstance?.name || t('products.products.mirakl.details.noLocalProperty') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
