<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import apolloClient from '../../../../../../../../apollo-client';
import { integrationsQuery } from '../../../../../../../shared/api/queries/integrations.js';
import { SalesChannelTabs } from '../../../../../../../shared/components/molecules/sales-channel-tabs';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
import { Product } from '../../../../configs';
import TabContentTemplate from '../TabContentTemplate.vue';
import { MediaCreate } from './containers/media-create';
import { MediaList } from './containers/media-list';
import ProductMediaPreview from './ProductMediaPreview.vue';

type EnsureChannelSpecificSetResult = {
  duplicated: boolean;
  appliedToCurrentChannel: boolean;
  createdEntries: Array<{ id: string; media: { id: string } }> | null;
};

type MediaListExpose = {
  ensureChannelSpecificSet: () => Promise<EnsureChannelSpecificSetResult>;
};

const props = defineProps<{ product: Product }>();

const ids = ref<string[]>([]);
const refetchNeeded = ref(false);
const salesChannels = ref<any[]>([]);
const currentSalesChannel = ref<'default' | string>('default');
const previewItems = ref<any[]>([]);
const inheritedFromDefault = ref(false);
const mediaListRef = ref<MediaListExpose | null>(null);
const isChannelMutationRunning = ref(false);

const defaultChannelLabel = window.location.hostname;
const productName = computed(() => (props.product as any)?.name ?? '');

const cleanHostname = (hostname: string, type: string) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon || type === IntegrationTypes.Ebay) {
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    const clean = url.hostname.replace(/^www\./i, '');
    return clean.split('.')[0];
  } catch {
    return hostname;
  }
};

const channelLabel = computed(() => {
  if (currentSalesChannel.value === 'default') {
    return defaultChannelLabel;
  }
  const channel = salesChannels.value.find((entry: any) => entry.id === currentSalesChannel.value);
  if (!channel) {
    return '';
  }
  const label = channel.hostname || channel.name || '';
  return cleanHostname(label, channel.type);
});

const loadSalesChannels = async () => {
  try {
    const { data } = await apolloClient.query({ query: integrationsQuery, fetchPolicy: 'cache-first' });
    salesChannels.value =
      data?.integrations.edges
        ?.map((edge: any) => edge.node)
        ?.filter((channel: any) => channel.type !== IntegrationTypes.Webhook) || [];
  } catch (error) {
    console.error('Failed to load sales channels', error);
  }
};

onMounted(async () => {
  await loadSalesChannels();
});

const handleMediaAdded = () => {
  refetchNeeded.value = true;
};

const handleRefetched = () => {
  refetchNeeded.value = false;
};

const updateIds = (newIds: string[]) => {
  ids.value = newIds;
};

const handleItemsLoaded = ({ items, inherited }: { items: any[]; inherited: boolean }) => {
  previewItems.value = items;
  inheritedFromDefault.value = inherited;
};

const handleMutationStart = () => {
  isChannelMutationRunning.value = true;
};

const handleMutationEnd = () => {
  isChannelMutationRunning.value = false;
};

const ensureChannelSet = async () => {
  if (currentSalesChannel.value === 'default') {
    return;
  }
  await mediaListRef.value?.ensureChannelSpecificSet();
};

</script>

<template>
  <TabContentTemplate>
    <template #content>
      <div class="grid gap-6 lg:grid-cols-[220px_1fr_380px]">
        <SalesChannelTabs
          v-model="currentSalesChannel"
          :channels="salesChannels"
          :disabled="isChannelMutationRunning"
        />
        <div class="space-y-4">
          <Flex class="items-center justify-end">
            <FlexCell grow></FlexCell>
            <FlexCell>
              <MediaCreate
                :product="product"
                :media-ids="ids"
                :sales-channel-id="currentSalesChannel"
                :ensure-sales-channel-set="ensureChannelSet"
                @media-added="handleMediaAdded"
              />
            </FlexCell>
          </Flex>
          <MediaList
            ref="mediaListRef"
            :product="product"
            :refetch-needed="refetchNeeded"
            :sales-channel-id="currentSalesChannel"
            @refetched="handleRefetched"
            @update-ids="updateIds"
            @items-loaded="handleItemsLoaded"
            @mutation-start="handleMutationStart"
            @mutation-end="handleMutationEnd"
          />
        </div>
        <ProductMediaPreview
          :product-name="productName"
          :channel-label="channelLabel"
          :default-label="defaultChannelLabel"
          :items="previewItems"
          :is-inherited="inheritedFromDefault"
        />
      </div>
    </template>
  </TabContentTemplate>
</template>
