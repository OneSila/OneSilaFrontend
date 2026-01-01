<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import { Toast } from '../../../modules/toast';
import { processGraphQLErrors } from '../../../utils';
import { IntegrationTypes } from '../../../../core/integrations/integrations/integrations';
import { getContentFieldRules } from '../../../../core/products/products/product-show/containers/tabs/content/contentFieldRules';
import {
  getProductContentByLanguageAndChannelQuery,
  productTranslationBulletPointsQuery,
} from '../../../api/queries/products.js';
import {
  createProductTranslationMutation,
  updateProductTranslationMutation,
  createProductTranslationBulletPointsMutation,
  deleteProductTranslationBulletPointsMutation,
} from '../../../api/mutations/products.js';
import AdvancedContentGeneratorPreviewMainView from './AdvancedContentGeneratorPreviewMainView.vue';
import AdvancedContentGeneratorPreviewProductTabs from './AdvancedContentGeneratorPreviewProductTabs.vue';
import AdvancedContentGeneratorPreviewActions from './AdvancedContentGeneratorPreviewActions.vue';

interface IntegrationChannel {
  id: string;
  proxyId?: string | null;
  hostname?: string | null;
  type?: string | null;
}

interface ProductSummary {
  id: string;
  sku: string;
}

type Status = 'pending' | 'approved' | 'rejected';

interface PreviewItem {
  key: string;
  productSku: string;
  integrationProxyId: string;
  integrationId?: string | null;
  integrationType?: string | null;
  integrationLabel: string;
  language: string;
}

interface PreviewContent {
  name: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  urlKey: string;
  bulletPoints: string[];
}

const props = defineProps<{
  preview: any;
  salesChannels: IntegrationChannel[];
  productMap: Map<string, ProductSummary>;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

const { t } = useI18n();

const items = ref<PreviewItem[]>([]);
const productOrder = ref<string[]>([]);
const currentProductSku = ref<string | null>(null);
const currentKey = ref<string | null>(null);
const saving = ref(false);

const contentByKey = reactive<Record<string, PreviewContent>>({});
const statusByKey = reactive<Record<string, Status>>({});

const integrationByProxyId = computed(() => {
  const map = new Map<string, IntegrationChannel>();
  (props.salesChannels || []).forEach((channel) => {
    if (channel.proxyId) {
      map.set(String(channel.proxyId), channel);
    }
    if (channel.id) {
      map.set(String(channel.id), channel);
    }
  });
  return map;
});

const cleanHostname = (hostname: string, type?: string | null) => {
  if (!hostname) return '';
  if (type === IntegrationTypes.Amazon) {
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    return url.hostname.replace(/^www\./i, '');
  } catch {
    return hostname;
  }
};

const formatIntegrationLabel = (channel?: IntegrationChannel) => {
  if (!channel) {
    return t('shared.components.organisms.advancedContentGenerator.unknownChannel');
  }
  const label = channel.hostname || channel.type || channel.id || '';
  return cleanHostname(label, channel.type);
};

const normalizePreviewContent = (content: any): PreviewContent => {
  const safe = content && typeof content === 'object' ? content : {};
  const rawBulletPoints = Array.isArray(safe.bulletPoints)
    ? safe.bulletPoints
    : typeof safe.bulletPoints === 'string'
      ? safe.bulletPoints.split('\n')
      : [];
  return {
    name: safe.name || '',
    subtitle: safe.subtitle || '',
    shortDescription: safe.shortDescription || '',
    description: safe.description || '',
    urlKey: safe.urlKey || '',
    bulletPoints: rawBulletPoints.map((point: any) => String(point || '')).filter((point: string) => point.trim()),
  };
};

const parsePreview = (raw: any) => {
  let normalized = raw;
  if (typeof normalized === 'string') {
    try {
      normalized = JSON.parse(normalized);
    } catch (_error) {
      normalized = [];
    }
  }
  const list = Array.isArray(normalized) ? normalized : [normalized];
  const parsedItems: PreviewItem[] = [];
  const order: string[] = [];

  list.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    Object.entries(entry).forEach(([integrationProxyId, productBlock]) => {
      if (!productBlock || typeof productBlock !== 'object') return;
      Object.entries(productBlock as Record<string, any>).forEach(([sku, languageBlock]) => {
        if (!languageBlock || typeof languageBlock !== 'object') return;
        if (!order.includes(sku)) {
          order.push(sku);
        }
        Object.entries(languageBlock as Record<string, any>).forEach(([language, content]) => {
          const channel = integrationByProxyId.value.get(String(integrationProxyId));
          const key = `${sku}::${integrationProxyId}::${language}`;
          parsedItems.push({
            key,
            productSku: sku,
            integrationProxyId: String(integrationProxyId),
            integrationId: channel?.id || null,
            integrationType: channel?.type || null,
            integrationLabel: formatIntegrationLabel(channel),
            language,
          });
          contentByKey[key] = normalizePreviewContent(content);
          statusByKey[key] = 'pending';
        });
      });
    });
  });

  items.value = parsedItems;
  const mapOrder = Array.from(props.productMap.keys());
  const orderedFromMap = mapOrder.filter((sku) => order.includes(sku));
  productOrder.value = orderedFromMap.length ? orderedFromMap : order;

  const initialSku = order[0] || parsedItems[0]?.productSku || null;
  currentProductSku.value = initialSku;
};

const itemsByProduct = computed(() => {
  const map = new Map<string, PreviewItem[]>();
  items.value.forEach((item) => {
    if (!map.has(item.productSku)) {
      map.set(item.productSku, []);
    }
    map.get(item.productSku)?.push(item);
  });
  return map;
});

const sortedItemsForProduct = (sku: string | null) => {
  const list = sku ? itemsByProduct.value.get(sku) || [] : [];
  return [...list].sort((a, b) => {
    if (a.integrationLabel === b.integrationLabel) {
      return a.language.localeCompare(b.language);
    }
    return a.integrationLabel.localeCompare(b.integrationLabel);
  });
};

const currentItems = computed(() => sortedItemsForProduct(currentProductSku.value));

const setCurrentKeyFromProduct = () => {
  const available = currentItems.value;
  if (!available.length) {
    currentKey.value = null;
    return;
  }
  if (!currentKey.value || !available.some((item) => item.key === currentKey.value)) {
    currentKey.value = available[0].key;
  }
};

const setStatus = (key: string | null, status: Status) => {
  if (!key) return;
  statusByKey[key] = status;
};

const goToNext = () => {
  const productSkus = productOrder.value;
  if (!currentProductSku.value || !currentKey.value) return;

  const itemsForProduct = currentItems.value;
  const currentIndex = itemsForProduct.findIndex((item) => item.key === currentKey.value);

  if (currentIndex >= 0 && currentIndex < itemsForProduct.length - 1) {
    currentKey.value = itemsForProduct[currentIndex + 1].key;
    return;
  }

  const productIndex = productSkus.indexOf(currentProductSku.value);
  if (productIndex >= 0 && productIndex < productSkus.length - 1) {
    currentProductSku.value = productSkus[productIndex + 1];
    setCurrentKeyFromProduct();
  }
};

const handleApproveNext = () => {
  setStatus(currentKey.value, 'approved');
  goToNext();
};

const handleRejectNext = () => {
  setStatus(currentKey.value, 'rejected');
  goToNext();
};

const productTabs = computed(() =>
  productOrder.value.map((sku) => {
    const productItems = itemsByProduct.value.get(sku) || [];
    const completed = productItems.length > 0 && productItems.every((item) => statusByKey[item.key] !== 'pending');
    return { sku, completed };
  }),
);

const hasPending = computed(() => items.value.some((item) => statusByKey[item.key] === 'pending'));

const getLimitRange = (limits: any, field: string) => {
  const limit = limits?.[field];
  if (typeof limit === 'number') {
    return { min: 0, max: limit };
  }
  return { min: limit?.min || 0, max: limit?.max };
};

const hasItemLimitIssues = (item: PreviewItem) => {
  const content = contentByKey[item.key];
  if (!content) return false;
  const rules = getContentFieldRules(item.integrationType || 'default');
  const limits = rules.limits || {};

  const checkValue = (field: keyof PreviewContent, value: string) => {
    const range = getLimitRange(limits, field);
    const length = value?.length || 0;
    if (range.max && length > range.max) return true;
    if (range.min && length < range.min) return true;
    return false;
  };

  if (rules.name && checkValue('name', content.name)) return true;
  if (rules.subtitle && checkValue('subtitle', content.subtitle)) return true;
  if (rules.shortDescription && checkValue('shortDescription', content.shortDescription)) return true;
  if (rules.description && checkValue('description', content.description)) return true;
  if (rules.urlKey && checkValue('urlKey', content.urlKey)) return true;

  if (rules.bulletPoints) {
    if ((content.bulletPoints || []).length > 5) return true;
    const bulletLimit = getLimitRange(limits, 'bulletPoints');
    if (bulletLimit.max) {
      return content.bulletPoints.some((point) => point.length > (bulletLimit.max || 0));
    }
  }

  return false;
};

const hasLimitIssues = computed(() =>
  items.value.some((item) => statusByKey[item.key] === 'approved' && hasItemLimitIssues(item)),
);

const fetchTranslationId = async (productId: string, language: string, salesChannelId: string) => {
  const { data } = await apolloClient.query({
    query: getProductContentByLanguageAndChannelQuery,
    variables: { languageCode: language, productId, salesChannelId },
    fetchPolicy: 'network-only',
  });
  return data?.productTranslations?.edges?.[0]?.node || null;
};

const saveBulletPoints = async (translationId: string, bulletPoints: string[]) => {
  const { data } = await apolloClient.query({
    query: productTranslationBulletPointsQuery,
    variables: { filter: { productTranslation: { id: { exact: translationId } } } },
    fetchPolicy: 'network-only',
  });

  const existing = data?.productTranslationBulletPoints?.edges?.map((edge: any) => edge.node) ?? [];
  if (existing.length) {
    await apolloClient.mutate({
      mutation: deleteProductTranslationBulletPointsMutation,
      variables: { data: existing.map((point: any) => ({ id: point.id })) },
    });
  }

  const cleaned = bulletPoints.filter((point) => point.trim()).slice(0, 5);
  if (!cleaned.length) return;

  await apolloClient.mutate({
    mutation: createProductTranslationBulletPointsMutation,
    variables: {
      data: cleaned.map((text, index) => ({
        text,
        sortOrder: index,
        productTranslation: { id: translationId },
      })),
    },
  });
};

const saveItem = async (item: PreviewItem) => {
  const product = props.productMap.get(item.productSku);
  const channel = integrationByProxyId.value.get(item.integrationProxyId);
  if (!product || !channel) {
    return;
  }

  const content = contentByKey[item.key];
  const rules = getContentFieldRules(item.integrationType || 'default');

  const payload: any = {
    product: { id: product.id },
    language: item.language,
    salesChannel: { id: channel.id },
  };

  if (rules.name) payload.name = content.name || '';
  if (rules.subtitle) payload.subtitle = content.subtitle || '';
  if (rules.shortDescription) payload.shortDescription = content.shortDescription || '';
  if (rules.description) payload.description = content.description || '';
  if (rules.urlKey) payload.urlKey = content.urlKey || '';

  const existingTranslation = await fetchTranslationId(product.id, item.language, channel.id);

  let translationId = existingTranslation?.id;
  if (translationId) {
    await apolloClient.mutate({
      mutation: updateProductTranslationMutation,
      variables: { data: { id: translationId, ...payload } },
    });
  } else {
    const { data } = await apolloClient.mutate({
      mutation: createProductTranslationMutation,
      variables: { data: payload },
    });
    translationId = data?.createProductTranslation?.id;
  }

  if (translationId && rules.bulletPoints) {
    await saveBulletPoints(translationId, content.bulletPoints || []);
  }
};

const saveApproved = async () => {
  if (saving.value || hasPending.value || hasLimitIssues.value) return;
  saving.value = true;

  try {
    const approved = items.value.filter((item) => statusByKey[item.key] === 'approved');
    for (const item of approved) {
      await saveItem(item);
    }
    Toast.success(t('shared.components.organisms.advancedContentGenerator.saveSuccess'));
    emit('close');
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    Object.values(validationErrors).forEach((message) => Toast.error(message));
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.preview,
  (value) => {
    items.value = [];
    productOrder.value = [];
    Object.keys(contentByKey).forEach((key) => delete contentByKey[key]);
    Object.keys(statusByKey).forEach((key) => delete statusByKey[key]);
    parsePreview(value);
    setCurrentKeyFromProduct();
  },
  { immediate: true },
);

watch(currentProductSku, () => {
  setCurrentKeyFromProduct();
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <div v-if="productTabs.length > 1" class="w-full lg:w-48">
        <AdvancedContentGeneratorPreviewProductTabs
          :products="productTabs"
          :current-sku="currentProductSku || ''"
          @select="(sku) => (currentProductSku = sku)"
        />
      </div>

      <div class="flex-1 space-y-6">
        <AdvancedContentGeneratorPreviewMainView
          :items="currentItems"
          :current-key="currentKey"
          :content-by-key="contentByKey"
          :status-by-key="statusByKey"
          @update:currentKey="(key) => (currentKey = key)"
        />

        <AdvancedContentGeneratorPreviewActions
          :saving="saving"
          :has-pending="hasPending"
          :has-limit-issues="hasLimitIssues"
          @approve-next="handleApproveNext"
          @reject-next="handleRejectNext"
          @save="saveApproved"
          @cancel="emit('close')"
        />
      </div>
    </div>
  </div>
</template>
