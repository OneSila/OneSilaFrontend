<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import apolloClient from '../../../../../../../../apollo-client';
import { integrationsQuery } from '../../../../../../../shared/api/queries/integrations.js';
import { SalesChannelTabs } from '../../../../../../../shared/components/molecules/sales-channel-tabs';
import { IntegrationTypes } from '../../../../../../integrations/integrations/integrations';
import { Product } from '../../../../configs';
import { Button } from '../../../../../../../shared/components/atoms/button';
import TabContentTemplate from '../TabContentTemplate.vue';
import { MediaCreate } from './containers/media-create';
import { MediaList } from './containers/media-list';
import ProductMediaPreview from './ProductMediaPreview.vue';

type MediaListExpose = {
  ensureChannelSpecificSet: () => Promise<boolean>;
};

const props = defineProps<{ product: Product }>();

const { t } = useI18n();

const ids = ref<string[]>([]);
const refetchNeeded = ref(false);
const salesChannels = ref<any[]>([]);
const currentSalesChannel = ref<'default' | string>('default');
const previewItems = ref<any[]>([]);
const inheritedFromDefault = ref(false);
const mediaListRef = ref<MediaListExpose | null>(null);
const creatingGallery = ref(false);

const defaultChannelLabel = window.location.hostname;
const productName = computed(() => (props.product as any)?.name ?? '');
const isDefaultChannel = computed(() => currentSalesChannel.value === 'default');
const isReadOnly = computed(() => !isDefaultChannel.value && inheritedFromDefault.value);

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

const ensureChannelSet = async () => {
  if (isDefaultChannel.value) {
    return;
  }
  await mediaListRef.value?.ensureChannelSpecificSet();
};

const handleCreateGallery = async () => {
  if (creatingGallery.value || isDefaultChannel.value) {
    return;
  }

  creatingGallery.value = true;
  try {
    await ensureChannelSet();
  } catch (error) {
    console.error('Failed to create sales channel gallery', error);
  } finally {
    creatingGallery.value = false;
  }
};

</script>

<template>
  <TabContentTemplate>
    <template #content>
      <div class="grid gap-6 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_380px]">
        <SalesChannelTabs
          v-model="currentSalesChannel"
          :channels="salesChannels"
        />
        <div class="space-y-4">
          <Flex class="items-center justify-end">
            <FlexCell grow></FlexCell>
            <FlexCell v-if="isReadOnly" class="mr-2">
              <Button
                class="btn btn-primary"
                :disabled="creatingGallery"
                @click="handleCreateGallery"
              >
                {{ t('products.products.variations.media.actions.createChannelGallery') }}
              </Button>
            </FlexCell>
            <FlexCell>
              <MediaCreate
                :product="product"
                :media-ids="ids"
                :sales-channel-id="currentSalesChannel"
                :disabled="isReadOnly"
                @media-added="handleMediaAdded"
              />
            </FlexCell>
          </Flex>
          <MediaList
            ref="mediaListRef"
            :product="product"
            :refetch-needed="refetchNeeded"
            :sales-channel-id="currentSalesChannel"
            :readonly-mode="isReadOnly"
            @refetched="handleRefetched"
            @update-ids="updateIds"
            @items-loaded="handleItemsLoaded"
          />
        </div>
        <ProductMediaPreview
          class="lg:col-span-2 xl:col-span-1"
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
