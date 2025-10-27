<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Badge } from '../../../shared/components/atoms/badge';
import { Icon } from '../../../shared/components/atoms/icon';

type SourceKey = 'product' | 'mapping' | 'salesChannel' | 'notSynced' | 'bundle' | 'defaultSync';

type SourceDefinition = {
  key: SourceKey;
  color: string;
  label: string;
};

type FieldDescriptor = {
  label: string;
  sources: SourceDefinition[];
};

type SectionDescriptor = {
  key: string;
  title: string;
  description: string;
  fields: FieldDescriptor[];
};

const docsUrl = 'https://developers.openai.com/commerce/specs/feed';
const { t } = useI18n();

const sourceDefinitions = computed<Record<SourceKey, SourceDefinition>>(() => ({
  product: {
    key: 'product',
    color: 'blue',
    label: t('settings.chatGptProductFeed.info.sources.product'),
  },
  mapping: {
    key: 'mapping',
    color: 'purple',
    label: t('settings.chatGptProductFeed.info.sources.mapping'),
  },
  salesChannel: {
    key: 'salesChannel',
    color: 'indigo',
    label: t('settings.chatGptProductFeed.info.sources.salesChannel'),
  },
  notSynced: {
    key: 'notSynced',
    color: 'gray',
    label: t('settings.chatGptProductFeed.info.sources.notSynced'),
  },
  bundle: {
    key: 'bundle',
    color: 'green',
    label: t('settings.chatGptProductFeed.info.sources.bundle'),
  },
  defaultSync: {
    key: 'defaultSync',
    color: 'yellow',
    label: t('settings.chatGptProductFeed.info.sources.defaultSync'),
  },
}));

const field = (fieldKey: string, sourceKeys: SourceKey[]): FieldDescriptor => ({
  label: t(`settings.chatGptProductFeed.info.fields.${fieldKey}`),
  sources: sourceKeys.map((key) => sourceDefinitions.value[key]),
});

const sections = computed<SectionDescriptor[]>(() => [
  {
    key: 'basicProductData',
    title: t('settings.chatGptProductFeed.info.sections.basicProductData.title'),
    description: t('settings.chatGptProductFeed.info.sections.basicProductData.description'),
    fields: [
      field('id', ['product']),
      field('gtin', ['product']),
      field('mpn', ['mapping']),
      field('title', ['product']),
      field('description', ['product']),
      field('link', ['product']),
    ],
  },
  {
    key: 'itemInformation',
    title: t('settings.chatGptProductFeed.info.sections.itemInformation.title'),
    description: t('settings.chatGptProductFeed.info.sections.itemInformation.description'),
    fields: [
      field('condition', ['mapping']),
      field('productCategory', ['product']),
      field('brand', ['mapping']),
      field('material', ['mapping']),
      field('dimensions', ['mapping', 'product']),
      field('length', ['mapping']),
      field('width', ['mapping']),
      field('height', ['mapping']),
      field('weight', ['mapping']),
      field('ageGroup', ['mapping']),
    ],
  },
  {
    key: 'media',
    title: t('settings.chatGptProductFeed.info.sections.media.title'),
    description: t('settings.chatGptProductFeed.info.sections.media.description'),
    fields: [
      field('imageLink', ['product']),
      field('additionalImageLink', ['product']),
      field('videoLink', ['product']),
    ],
  },
  {
    key: 'priceAndPromotions',
    title: t('settings.chatGptProductFeed.info.sections.priceAndPromotions.title'),
    description: t('settings.chatGptProductFeed.info.sections.priceAndPromotions.description'),
    fields: [
      field('price', ['product']),
      field('applicableTaxesFees', ['notSynced']),
      field('salePrice', ['product']),
      field('salePriceEffectiveDate', ['notSynced']),
      field('unitPricingMeasure', ['notSynced']),
      field('pricingTrend', ['notSynced']),
    ],
  },
  {
    key: 'availabilityInventory',
    title: t('settings.chatGptProductFeed.info.sections.availabilityInventory.title'),
    description: t('settings.chatGptProductFeed.info.sections.availabilityInventory.description'),
    fields: [
      field('availability', ['product']),
      field('availabilityDate', ['defaultSync']),
      field('inventoryQuantity', ['salesChannel']),
      field('expirationDate', ['mapping']),
      field('pickupMethod', ['mapping']),
      field('pickupSla', ['notSynced']),
    ],
  },
  {
    key: 'variants',
    title: t('settings.chatGptProductFeed.info.sections.variants.title'),
    description: t('settings.chatGptProductFeed.info.sections.variants.description'),
    fields: [
      field('itemGroupId', ['product']),
      field('itemGroupTitle', ['product']),
      field('color', ['mapping']),
      field('size', ['mapping']),
      field('sizeSystem', ['mapping']),
      field('gender', ['mapping']),
      field('offerId', ['product']),
      field('customVariant1Category', ['product']),
      field('customVariant1Option', ['product']),
      field('customVariant2Category', ['product']),
      field('customVariant2Option', ['product']),
      field('customVariant3Category', ['product']),
      field('customVariant3Option', ['product']),
    ],
  },
  {
    key: 'fulfillment',
    title: t('settings.chatGptProductFeed.info.sections.fulfillment.title'),
    description: t('settings.chatGptProductFeed.info.sections.fulfillment.description'),
    fields: [field('fulfillmentData', ['notSynced'])],
  },
  {
    key: 'merchantInfo',
    title: t('settings.chatGptProductFeed.info.sections.merchantInfo.title'),
    description: t('settings.chatGptProductFeed.info.sections.merchantInfo.description'),
    fields: [
      field('sellerName', ['salesChannel']),
      field('sellerUrl', ['salesChannel']),
      field('sellerPrivacyPolicy', ['salesChannel']),
      field('sellerTos', ['salesChannel']),
    ],
  },
  {
    key: 'returns',
    title: t('settings.chatGptProductFeed.info.sections.returns.title'),
    description: t('settings.chatGptProductFeed.info.sections.returns.description'),
    fields: [
      field('returnPolicy', ['salesChannel']),
      field('returnWindow', ['salesChannel']),
    ],
  },
  {
    key: 'performanceSignals',
    title: t('settings.chatGptProductFeed.info.sections.performanceSignals.title'),
    description: t('settings.chatGptProductFeed.info.sections.performanceSignals.description'),
    fields: [
      field('popularityScore', ['mapping']),
      field('returnRate', ['notSynced']),
    ],
  },
  {
    key: 'compliance',
    title: t('settings.chatGptProductFeed.info.sections.compliance.title'),
    description: t('settings.chatGptProductFeed.info.sections.compliance.description'),
    fields: [
      field('warning', ['mapping']),
      field('ageRestriction', ['mapping']),
    ],
  },
  {
    key: 'reviewsQa',
    title: t('settings.chatGptProductFeed.info.sections.reviewsQa.title'),
    description: t('settings.chatGptProductFeed.info.sections.reviewsQa.description'),
    fields: [field('reviews', ['notSynced'])],
  },
  {
    key: 'relatedProducts',
    title: t('settings.chatGptProductFeed.info.sections.relatedProducts.title'),
    description: t('settings.chatGptProductFeed.info.sections.relatedProducts.description'),
    fields: [field('relatedProducts', ['bundle'])],
  },
  {
    key: 'geoTagging',
    title: t('settings.chatGptProductFeed.info.sections.geoTagging.title'),
    description: t('settings.chatGptProductFeed.info.sections.geoTagging.description'),
    fields: [field('geoOverrides', ['notSynced'])],
  },
]);
</script>

<template>
  <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 space-y-6">
    <div class="flex flex-col gap-3">
      <div>
        <h2 class="text-xl font-semibold text-gray-900">{{ t('settings.chatGptProductFeed.info.title') }}</h2>
        <p class="mt-1 text-sm text-gray-600">{{ t('settings.chatGptProductFeed.info.description') }}</p>
      </div>
      <a
        :href="docsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <Icon name="arrow-up-right-from-square" size="sm" />
        {{ t('settings.chatGptProductFeed.info.linkLabel') }}
      </a>
    </div>
    <div class="space-y-6">
      <div
        v-for="(section, index) in sections"
        :key="section.key"
        :class="index === 0 ? '' : 'pt-6 border-t border-gray-200'"
      >
        <h3 class="text-base font-semibold text-gray-900">{{ section.title }}</h3>
        <p class="mt-1 text-sm text-gray-600">{{ section.description }}</p>
        <div class="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <tbody class="divide-y divide-gray-200">
              <tr v-for="fieldItem in section.fields" :key="fieldItem.label" class="bg-white">
                <td class="px-4 py-3 font-medium text-gray-900">{{ fieldItem.label }}</td>
                <td class="px-4 py-3">
                  <div class="flex flex-wrap gap-2">
                    <Badge
                      v-for="source in fieldItem.sources"
                      :key="source.key"
                      :text="source.label"
                      :color="source.color"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
