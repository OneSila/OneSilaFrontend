<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { Link } from '../../../../../../../../shared/components/atoms/link';
import { IntegrationTypes } from '../../../../../../../integrations/integrations/integrations';
import {shortenText} from "../../../../../../../../shared/utils";

const props = defineProps<{ views: any[]; amazonProducts: any[]; modelValue: string | null }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { t } = useI18n();

const select = (val: string) => emit('update:modelValue', val);

const MARKETPLACE_KEY_SEPARATOR = '::';
const createMarketplaceKey = (viewId: string, productId?: string | null) =>
  `${viewId}${MARKETPLACE_KEY_SEPARATOR}${productId ?? ''}`;

const doesProductMatchView = (product: any, view: any) => {
  if (!view || !product?.createdMarketplaces?.length) return false;
  const identifiers = [view.remoteId, view.id].filter(Boolean);

  return product.createdMarketplaces.some((marketplaceId: string) => {
    if (!marketplaceId) return false;

    const [marketplaceViewId] = marketplaceId.split(MARKETPLACE_KEY_SEPARATOR);

    return (
      identifiers.includes(marketplaceId) ||
      identifiers.includes(marketplaceViewId)
    );
  });
};

const groupedViews = computed(() => {
  const groups: Record<string, any[]> = {};
  props.views.forEach((view: any) => {
    const scId = view.salesChannel?.id || 'unknown';
    if (!groups[scId]) groups[scId] = [];

    const matchingProducts = props.amazonProducts.filter((product: any) =>
      doesProductMatchView(product, view),
    );

    if (matchingProducts.length) {
      matchingProducts.forEach((product: any) => {
        groups[scId].push({
          key: createMarketplaceKey(view.id, product.id),
          view,
          product,
        });
      });
    } else {
      groups[scId].push({
        key: createMarketplaceKey(view.id, null),
        view,
        product: null,
      });
    }
  });
  return Object.entries(groups).map(([salesChannelId, entries]) => ({
    salesChannelId,
    entries: entries.sort(
      (a: any, b: any) => Number(b.view.isDefault) - Number(a.view.isDefault),
    ),
  }));
});
</script>

<template>
  <div class="border-r border-gray-200 pr-4">
    <div class="max-h-[660px] overflow-y-auto">
      <div v-for="group in groupedViews" :key="group.salesChannelId" class="mb-4 space-y-2">
        <div
          v-for="entry in group.entries"
          :key="entry.key"
          class="cursor-pointer flex items-center gap-3 p-3 border rounded-md"
          :class="{ 'bg-primary text-white': modelValue === entry.key }"
          @click="select(entry.key)"
        >
          <Icon
            :name="entry.product ? 'circle-check' : 'circle-xmark'"
            class="w-4 h-4"
            :class="entry.product ? 'text-green-500' : 'text-red-500'"
          />
          <div class="flex flex-col gap-1">
            <FlexCell>
              <Flex gap="2">
                <FlexCell>
                  <span>{{ entry.view.name || entry.view.remoteId }}</span>
                </FlexCell>
                <FlexCell>
                  <Icon
                    v-if="entry.view.isDefault"
                    name="crown"
                    class="w-4 h-4 text-yellow-400"
                    :title="t('products.products.amazon.defaultMarketplace')"
                  />
                </FlexCell>
              </Flex>
            </FlexCell>

            <Link
              class="text-xs"
              :path="{
                name: 'integrations.integrations.show',
                params: { type: IntegrationTypes.Amazon, id: entry.view.salesChannel.id },
              }"
            >
              ({{ entry.view.salesChannel.hostname }})
            </Link>
            <div
              v-if="entry.product?.remoteParentProduct?.localInstance?.id"
              class="text-xs"
            >
              <hr class="my-2">
              {{ t('products.products.amazon.parentProductLabel') }}
              <Link
                class="text-xs ml-1"
                :path="{
                  name: 'products.products.show',
                  params: { id: entry.product.remoteParentProduct.localInstance.id },
                }"
              >
                {{
                  shortenText(entry.product.remoteParentProduct.localInstance.sku, 15)
                }}
              </Link>
            </div>
          </div>
        </div>
        <div class="h-px bg-gray-200"></div>
      </div>
    </div>
  </div>
</template>

