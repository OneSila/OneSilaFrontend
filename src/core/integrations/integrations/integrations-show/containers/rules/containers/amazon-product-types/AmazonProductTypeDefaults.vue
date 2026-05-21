<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import apolloClient from '../../../../../../../../../apollo-client';
import { Button } from '../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../shared/components/atoms/icon';
import { LocalLoader } from '../../../../../../../../shared/components/atoms/local-loader';
import { Selector } from '../../../../../../../../shared/components/atoms/selector';
import { Toast } from '../../../../../../../../shared/modules/toast';
import { displayApolloError } from '../../../../../../../../shared/utils';
import { amazonChannelViewsQuery } from '../../../../../../../../shared/api/queries/salesChannels.js';
import { updateAmazonProductTypeMutation } from '../../../../../../../../shared/api/mutations/salesChannels.js';
import AmazonBrowseNodeSection from '../../../../../../../products/products/product-show/containers/tabs/amazon/components/AmazonBrowseNodeSection.vue';

interface AmazonSalesChannelView {
  id: string;
  remoteId: string;
  name?: string | null;
  isDefault?: boolean | null;
  salesChannel?: {
    id: string;
    hostname?: string | null;
  } | null;
}

const props = defineProps<{ productType: any | null }>();

const { t } = useI18n();
const route = useRoute();

const views = ref<AmazonSalesChannelView[]>([]);
const loadingViews = ref(false);
const selectedViewId = ref<string | null>(null);
const selectedTheme = ref<string | null>(null);
const originalTheme = ref<string | null>(null);
const savingTheme = ref(false);

const routeValueToString = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return value.length ? String(value[0]) : null;
  }
  return value ? String(value) : null;
};

const productTypeId = computed(() => props.productType?.id || null);
const salesChannelId = computed(
  () =>
    props.productType?.salesChannel?.id ||
    routeValueToString(route.params.integrationId) ||
    routeValueToString(route.query.salesChannelId) ||
    routeValueToString(route.query.integrationId),
);

const normalizeVariationThemeOption = (entry: any): string | null => {
  if (typeof entry === 'string') {
    return entry;
  }

  if (entry && typeof entry === 'object') {
    return entry.name || entry.value || entry.theme || entry.id || null;
  }

  return null;
};

const normalizeVariationThemes = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value.map(normalizeVariationThemeOption).filter(Boolean) as string[];
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidates = value.variationThemes || value.variationTheme || value.enum;
  if (Array.isArray(candidates)) {
    return candidates.map(normalizeVariationThemeOption).filter(Boolean) as string[];
  }

  const values = Object.values(value);
  const normalizedValues = values.map(normalizeVariationThemeOption).filter(Boolean) as string[];
  if (normalizedValues.length) {
    return normalizedValues;
  }

  return Object.keys(value);
};

const variationThemeOptions = computed(() =>
  normalizeVariationThemes(props.productType?.variationThemes).map((theme) => ({
    id: theme,
    name: theme,
  })),
);

const selectedView = computed(() =>
  views.value.find((view) => view.id === selectedViewId.value) || null,
);

const hasThemeChanges = computed(() => selectedTheme.value !== originalTheme.value);

const fetchViews = async () => {
  if (!salesChannelId.value) {
    views.value = [];
    selectedViewId.value = null;
    return;
  }

  loadingViews.value = true;
  try {
    const { data } = await apolloClient.query({
      query: amazonChannelViewsQuery,
      variables: {
        filter: {
          salesChannel: { id: { exact: salesChannelId.value } },
        },
      },
      fetchPolicy: 'cache-first',
    });

    views.value = (data?.amazonChannelViews?.edges || [])
      .map((edge: any) => edge.node)
      .sort((a: AmazonSalesChannelView, b: AmazonSalesChannelView) => Number(b.isDefault) - Number(a.isDefault));

    const defaultView = views.value.find((view) => view.isDefault) || views.value[0] || null;
    if (!selectedViewId.value || !views.value.some((view) => view.id === selectedViewId.value)) {
      selectedViewId.value = defaultView?.id || null;
    }
  } catch (error) {
    views.value = [];
    selectedViewId.value = null;
    displayApolloError(error);
  } finally {
    loadingViews.value = false;
  }
};

const saveVariationTheme = async () => {
  if (!productTypeId.value || !hasThemeChanges.value || savingTheme.value) {
    return;
  }

  savingTheme.value = true;
  try {
    await apolloClient.mutate({
      mutation: updateAmazonProductTypeMutation,
      variables: {
        data: {
          id: productTypeId.value,
          defaultVariationTheme: selectedTheme.value || null,
        },
      },
    });
    originalTheme.value = selectedTheme.value;
    Toast.success(t('integrations.show.amazon.productRules.defaultVariationThemeSaved'));
  } catch (error) {
    displayApolloError(error);
  } finally {
    savingTheme.value = false;
  }
};

watch(
  () => props.productType?.defaultVariationTheme,
  (value) => {
    selectedTheme.value = value || null;
    originalTheme.value = value || null;
  },
  { immediate: true },
);

watch(salesChannelId, fetchViews, { immediate: true });
</script>

<template>
  <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3 mt-4">
    <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
      <div class="space-y-8 px-4 py-6 sm:p-8">
        <div>
          <h4 class="font-semibold mb-2">
            {{ t('integrations.show.amazon.productRules.defaultsTitle') }}
          </h4>
          <p class="text-xs text-gray-500">
            {{ t('integrations.show.amazon.productRules.defaultsDescription') }}
          </p>
        </div>

        <div>
          <h5 class="font-semibold mb-2">
            {{ t('products.products.amazon.variationTheme') }}
          </h5>
          <p class="text-xs text-gray-500 mb-2">
            {{ t('integrations.show.amazon.productRules.defaultVariationThemeDescription') }}
          </p>
          <Flex gap="2" middle class="w-full">
            <FlexCell class="flex-1 min-w-0">
              <Selector
                v-model="selectedTheme"
                class="w-full"
                :options="variationThemeOptions"
                label-by="name"
                value-by="id"
                :filterable="true"
                :placeholder="t('products.products.amazon.variationThemePlaceholder')"
              />
            </FlexCell>
            <FlexCell>
              <Button
                class="btn btn-primary"
                :disabled="!hasThemeChanges || savingTheme"
                :loading="savingTheme"
                @click="saveVariationTheme"
              >
                {{ t('shared.button.save') }}
              </Button>
            </FlexCell>
          </Flex>
          <p v-if="!variationThemeOptions.length" class="text-xs text-gray-500 mt-2">
            {{ t('integrations.show.amazon.productRules.noVariationThemes') }}
          </p>
        </div>

        <div class="border-t pt-6">
          <h5 class="font-semibold mb-2">
            {{ t('integrations.show.amazon.productRules.defaultBrowseNode') }}
          </h5>
          <LocalLoader :loading="loadingViews" />
          <div v-if="!loadingViews && views.length" class="flex flex-col lg:flex-row gap-6">
            <div class="lg:w-72 shrink-0 border-r border-gray-200 pr-4">
              <div class="space-y-2">
                <div
                  v-for="view in views"
                  :key="view.id"
                  class="cursor-pointer flex items-center gap-3 p-3 border rounded-md"
                  :class="{ 'bg-primary text-white': selectedViewId === view.id }"
                  @click="selectedViewId = view.id"
                >
                  <Icon name="store" class="w-4 h-4" />
                  <div class="flex flex-col gap-1">
                    <Flex gap="2">
                      <FlexCell>
                        <span>{{ view.name || view.remoteId }}</span>
                      </FlexCell>
                      <FlexCell>
                        <Icon
                          v-if="view.isDefault"
                          name="crown"
                          class="w-4 h-4 text-yellow-400"
                          :title="t('products.products.amazon.defaultMarketplace')"
                        />
                      </FlexCell>
                    </Flex>
                    <span v-if="view.salesChannel?.hostname" class="text-xs">
                      {{ view.salesChannel.hostname }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex-1">
              <AmazonBrowseNodeSection
                v-if="selectedView"
                :product-id="null"
                :product-type-id="productTypeId"
                :sales-channel-id="salesChannelId"
                :sales-channel-view-id="selectedView.id"
                :marketplace-id="selectedView.remoteId"
                :view="selectedView"
              />
            </div>
          </div>
          <p v-else-if="!loadingViews" class="text-sm text-gray-500">
            {{ t('products.products.variations.amazon.noViews') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
