<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Accordion } from '../../../../../../../../shared/components/atoms/accordion';
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

const accordionItems = computed(() =>
  (props.category?.productTypes || []).map((productType) => ({
    name: productType.id || productType.remoteId,
    label: productType.name || productType.remoteId,
    icon: 'layer-group',
  })),
);

const getProductTypeSlotName = (productType: MiraklCategoryNode['productTypes'][number]) =>
  productType.id || productType.remoteId;

const getProductTypeStatusClass = (productType: MiraklCategoryNode['productTypes'][number]) =>
  productType.readyToPush
    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';

const getProductTypeStatusIcon = (productType: MiraklCategoryNode['productTypes'][number]) =>
  productType.readyToPush ? 'circle-check' : 'triangle-exclamation';

const getProductTypeStatusLabel = (productType: MiraklCategoryNode['productTypes'][number]) =>
  productType.readyToPush
    ? t('products.products.mirakl.details.readyToPush')
    : t('products.products.mirakl.details.notReadyToPush');

const isTemplateMissing = (productType: MiraklCategoryNode['productTypes'][number]) =>
  !productType.readyToPush && !productType.templateUrl;

const productTypePath = (productType: MiraklCategoryNode['productTypes'][number]) => {
  if (!productType.id) {
    return undefined;
  }

  const query: Record<string, string> = {};
  const integrationId = props.channel?.integrationPtr?.id;

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

  const integrationId = props.channel?.integrationPtr?.id;
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

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
      <div class="rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div class="text-xs text-gray-500">{{ t('products.products.mirakl.details.level') }}</div>
        <div class="text-sm font-medium">{{ category.level }}</div>
      </div>
      <div class="rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div class="text-xs text-gray-500">{{ t('products.products.mirakl.details.parentCode') }}</div>
        <div class="text-sm font-medium">{{ category.parentCode || '—' }}</div>
      </div>
      <div class="rounded border border-gray-200 bg-gray-50 px-3 py-2">
        <div class="text-xs text-gray-500">{{ t('products.products.mirakl.details.leaf') }}</div>
        <div class="text-sm font-medium">
          {{ category.isLeaf ? t('products.products.mirakl.details.yes') : t('products.products.mirakl.details.no') }}
        </div>
      </div>
    </div>

    <div class="mt-4">
      <div class="font-semibold text-sm mb-2">
        {{ t('products.products.mirakl.details.productTypes') }}
      </div>

      <div v-if="!accordionItems.length" class="text-sm text-gray-500">
        {{ t('products.products.mirakl.details.noProductTypes') }}
      </div>

      <Accordion v-else :items="accordionItems" :default-active="accordionItems[0]?.name">
        <template
          v-for="productType in category.productTypes"
          :key="`${productType.id || productType.remoteId}-actions`"
          v-slot:[`${getProductTypeSlotName(productType)}-actions`]
        >
          <div
            class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
            :class="getProductTypeStatusClass(productType)"
          >
            <Icon :name="getProductTypeStatusIcon(productType)" class="h-3 w-3" />
            <span>{{ getProductTypeStatusLabel(productType) }}</span>
          </div>
        </template>
        <template
          v-for="productType in category.productTypes"
          :key="productType.id || productType.remoteId"
          v-slot:[getProductTypeSlotName(productType)]
        >
          <div class="space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <div class="text-xs text-gray-500">
                {{ t('products.products.mirakl.details.productTypeId', { id: productType.remoteId }) }}
              </div>
              <div
                class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                :class="getProductTypeStatusClass(productType)"
              >
                <Icon :name="getProductTypeStatusIcon(productType)" class="h-3 w-3" />
                <span>{{ getProductTypeStatusLabel(productType) }}</span>
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

            <div v-else class="overflow-x-auto">
              <table class="w-full min-w-max divide-y divide-gray-300 table-hover">
                <thead>
                  <tr>
                    <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.property') }}</th>
                    <th class="p-2 text-left">{{ t('products.products.mirakl.details.columns.code') }}</th>
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
        </template>
      </Accordion>
    </div>
  </div>
</template>
