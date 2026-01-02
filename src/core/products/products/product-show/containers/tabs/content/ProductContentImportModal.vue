<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../apollo-client';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Modal } from '../../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { IntegrationsSelector } from '../../../../../../../shared/components/molecules/integrations-selector';
import { Toggle } from '../../../../../../../shared/components/atoms/toggle';
import { Badge } from '../../../../../../../shared/components/atoms/badge';
import { Toast } from '../../../../../../../shared/modules/toast';
import { formatIntegrationLabel, processGraphQLErrors } from '../../../../../../../shared/utils';
import {
  getProductContentsByChannelQuery,
  getProductContentsByDefaultQuery,
  productTranslationBulletPointsQuery,
} from '../../../../../../../shared/api/queries/products.js';
import {
  createProductTranslationMutation,
  updateProductTranslationMutation,
  createProductTranslationBulletPointsMutation,
  deleteProductTranslationBulletPointsMutation,
} from '../../../../../../../shared/api/mutations/products.js';
import { getContentFieldRules } from './contentFieldRules';
import ProductContentPreview from './ProductContentPreview.vue';

interface SalesChannel {
  id: string;
  hostname?: string | null;
  type?: string | null;
}

interface TranslationNode {
  id: string;
  language: string;
  name?: string | null;
  subtitle?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  urlKey?: string | null;
}

interface BulletPointNode {
  id?: string | null;
  text?: string | null;
  sortOrder?: number | null;
}

const props = defineProps<{
  productId: string;
  currentLanguage: string | null;
  currentSalesChannel: 'default' | string;
  salesChannels: SalesChannel[];
}>();

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { t } = useI18n();

const showModal = ref(false);
const selectedSourceChannel = ref<string | null>(null);
const overrideExisting = ref(false);
const importAllLanguages = ref(false);
const loading = ref(false);
const importing = ref(false);
const sourceTranslations = ref<TranslationNode[]>([]);
const sourcePreview = ref<TranslationNode | null>(null);
const sourcePreviewBulletPoints = ref<BulletPointNode[]>([]);
const destinationTranslations = ref<TranslationNode[]>([]);
const destinationPreview = ref<TranslationNode | null>(null);
const destinationPreviewBulletPoints = ref<BulletPointNode[]>([]);

const emptyHtml = '<p><br></p>';

const formatChannelLabel = (channel?: SalesChannel) => {
  if (!channel) return t('shared.labels.default');
  return formatIntegrationLabel(channel) || t('shared.labels.default');
};

const sourceChannelCount = computed(() => {
  const addDefault = props.currentSalesChannel !== 'default';
  const filtered = props.salesChannels.filter((channel) => channel.id !== props.currentSalesChannel);
  return filtered.length + (addDefault ? 1 : 0);
});

const targetChannelLabel = computed(() => {
  if (props.currentSalesChannel === 'default') {
    return t('shared.labels.default');
  }
  const channel = props.salesChannels.find((item) => item.id === props.currentSalesChannel);
  return channel ? formatChannelLabel(channel) : props.currentSalesChannel;
});

const resolveChannelType = (channelId: string | null) => {
  if (!channelId || channelId === 'default') return 'default';
  const channel = props.salesChannels.find((item) => item.id === channelId);
  return channel?.type || 'default';
};

const sourceChannelType = computed(() => resolveChannelType(selectedSourceChannel.value));
const destinationChannelType = computed(() => resolveChannelType(props.currentSalesChannel));

const sourceRules = computed(() => getContentFieldRules(sourceChannelType.value));
const destinationRules = computed(() => getContentFieldRules(destinationChannelType.value));

const allowedFields = computed(() => ({
  name: sourceRules.value.name && destinationRules.value.name,
  subtitle: sourceRules.value.subtitle && destinationRules.value.subtitle,
  shortDescription: sourceRules.value.shortDescription && destinationRules.value.shortDescription,
  description: sourceRules.value.description && destinationRules.value.description,
  urlKey: sourceRules.value.urlKey && destinationRules.value.urlKey,
  bulletPoints: sourceRules.value.bulletPoints && destinationRules.value.bulletPoints,
}));

const availableLanguagesBadge = computed(() =>
  t('products.translation.import.availableLanguagesBadge', { count: sourceTranslations.value.length }),
);

const currentLanguageBadge = computed(() =>
  t('products.translation.import.currentLanguageBadge', { code: props.currentLanguage || '-' }),
);

const hasSourceForCurrentLanguage = computed(() => !!sourcePreview.value);
const hasAnySourceLanguages = computed(() => sourceTranslations.value.length > 0);

const canImport = computed(() => {
  if (!selectedSourceChannel.value || importing.value) return false;
  if (importAllLanguages.value) {
    return hasAnySourceLanguages.value;
  }
  return !!props.currentLanguage && hasSourceForCurrentLanguage.value;
});

const normalizeHtmlValue = (value?: string | null) => {
  if (!value) return emptyHtml;
  const trimmed = value.trim();
  return trimmed || emptyHtml;
};

const isEmptyHtml = (value?: string | null) => {
  if (!value) return true;
  const normalized = value.replace(/\s/g, '').toLowerCase();
  return normalized === '<p><br></p>' || normalized === '<br>' || normalized === '<p></p>';
};

const hasValue = (field: keyof TranslationNode, value?: string | null) => {
  if (field === 'shortDescription' || field === 'description') {
    return !isEmptyHtml(value);
  }
  return !!value && value.trim().length > 0;
};

const sourceLanguageBadges = computed(() =>
  Array.from(new Set(sourceTranslations.value.map((item) => item.language))).filter(Boolean),
);

const resolvePreviewValue = (
  field: keyof TranslationNode,
  sourceValue?: string | null,
  destinationValue?: string | null,
) => {
  if (!allowedFields.value[field]) {
    return field === 'shortDescription' || field === 'description'
      ? normalizeHtmlValue(destinationValue)
      : (destinationValue || '');
  }

  if (overrideExisting.value) {
    return field === 'shortDescription' || field === 'description'
      ? normalizeHtmlValue(sourceValue)
      : (sourceValue || '');
  }

  if (hasValue(field, destinationValue)) {
    return field === 'shortDescription' || field === 'description'
      ? normalizeHtmlValue(destinationValue)
      : (destinationValue || '');
  }

  if (hasValue(field, sourceValue)) {
    return field === 'shortDescription' || field === 'description'
      ? normalizeHtmlValue(sourceValue)
      : (sourceValue || '');
  }

  return field === 'shortDescription' || field === 'description'
    ? normalizeHtmlValue(destinationValue)
    : (destinationValue || '');
};

const previewContent = computed(() => {
  if (!selectedSourceChannel.value) return null;
  if (importAllLanguages.value && !hasSourceForCurrentLanguage.value) return null;
  if (!sourcePreview.value && !destinationPreview.value) return null;

  const source = sourcePreview.value;
  const destination = destinationPreview.value;

  return {
    name: resolvePreviewValue('name', source?.name, destination?.name),
    subtitle: resolvePreviewValue('subtitle', source?.subtitle, destination?.subtitle),
    shortDescription: resolvePreviewValue('shortDescription', source?.shortDescription, destination?.shortDescription),
    description: resolvePreviewValue('description', source?.description, destination?.description),
    urlKey: resolvePreviewValue('urlKey', source?.urlKey, destination?.urlKey),
  };
});

const previewBulletPoints = computed(() => {
  if (!allowedFields.value.bulletPoints) {
    return destinationPreviewBulletPoints.value;
  }

  const destinationHasPoints = destinationPreviewBulletPoints.value.some(
    (point) => point.text && point.text.trim(),
  );

  if (overrideExisting.value) {
    return sourcePreviewBulletPoints.value;
  }

  if (destinationHasPoints) {
    return destinationPreviewBulletPoints.value;
  }

  return sourcePreviewBulletPoints.value;
});

const buildFieldPayload = (source: TranslationNode, destination: TranslationNode | null) => {
  const payload: Record<string, string> = {};
  const fields: Array<keyof TranslationNode> = ['name', 'subtitle', 'shortDescription', 'description', 'urlKey'];

  fields.forEach((field) => {
    if (!allowedFields.value[field]) return;
    const sourceValue = source[field] ?? null;
    const destinationValue = destination?.[field] ?? null;

    if (!overrideExisting.value) {
      if (hasValue(field, destinationValue)) return;
      if (!hasValue(field, sourceValue)) return;
      payload[field] = field === 'shortDescription' || field === 'description'
        ? normalizeHtmlValue(sourceValue)
        : (sourceValue || '');
      return;
    }

    payload[field] = field === 'shortDescription' || field === 'description'
      ? normalizeHtmlValue(sourceValue)
      : (sourceValue || '');
  });

  return payload;
};

const fetchTranslationsForChannel = async (channelId: string): Promise<TranslationNode[]> => {
  const query = channelId === 'default' ? getProductContentsByDefaultQuery : getProductContentsByChannelQuery;
  const variables = channelId === 'default'
    ? { productId: props.productId }
    : { productId: props.productId, salesChannelId: channelId };

  const { data } = await apolloClient.query({
    query,
    variables,
    fetchPolicy: 'network-only',
  });

  return data?.productTranslations?.edges?.map((edge: any) => edge.node as TranslationNode) ?? [];
};

const fetchBulletPoints = async (translationId: string) => {
  const { data } = await apolloClient.query({
    query: productTranslationBulletPointsQuery,
    variables: { filter: { productTranslation: { id: { exact: translationId } } } },
    fetchPolicy: 'network-only',
  });

  return data?.productTranslationBulletPoints?.edges?.map((edge: any) => edge.node) ?? [];
};

const loadSourceTranslations = async () => {
  if (!selectedSourceChannel.value) {
    sourceTranslations.value = [];
    sourcePreview.value = null;
    sourcePreviewBulletPoints.value = [];
    return;
  }

  loading.value = true;
  try {
    sourceTranslations.value = await fetchTranslationsForChannel(selectedSourceChannel.value);
  } finally {
    loading.value = false;
  }
};

const loadDestinationTranslations = async () => {
  destinationTranslations.value = await fetchTranslationsForChannel(props.currentSalesChannel);
};

const updatePreview = async () => {
  if (!props.currentLanguage) {
    sourcePreview.value = null;
    sourcePreviewBulletPoints.value = [];
    destinationPreview.value = null;
    destinationPreviewBulletPoints.value = [];
    return;
  }

  sourcePreview.value =
    sourceTranslations.value.find((item) => item.language === props.currentLanguage) || null;
  sourcePreviewBulletPoints.value = [];

  destinationPreview.value =
    destinationTranslations.value.find((item) => item.language === props.currentLanguage) || null;
  destinationPreviewBulletPoints.value = [];

  if (sourcePreview.value && sourceRules.value.bulletPoints) {
    sourcePreviewBulletPoints.value = await fetchBulletPoints(sourcePreview.value.id);
  }

  if (destinationPreview.value && destinationRules.value.bulletPoints) {
    destinationPreviewBulletPoints.value = await fetchBulletPoints(destinationPreview.value.id);
  }
};

const deleteBulletPoints = async (points: BulletPointNode[]) => {
  const payload = points
    .filter((point) => point.id)
    .map((point) => ({ id: point.id }));

  if (!payload.length) return;

  await apolloClient.mutate({
    mutation: deleteProductTranslationBulletPointsMutation,
    variables: { data: payload },
  });
};

const createBulletPoints = async (translationId: string, points: BulletPointNode[]) => {
  const payload = points
    .filter((point) => point.text && point.text.trim())
    .map((point, index) => ({
      text: point.text,
      sortOrder: point.sortOrder ?? index,
      productTranslation: { id: translationId },
    }));

  if (!payload.length) return;

  await apolloClient.mutate({
    mutation: createProductTranslationBulletPointsMutation,
    variables: { data: payload },
  });
};

const importBulletPoints = async (
  sourceTranslationId: string,
  destinationTranslationId: string,
) => {
  const sourcePoints = await fetchBulletPoints(sourceTranslationId);
  const destinationPoints = await fetchBulletPoints(destinationTranslationId);
  const destinationHasPoints = destinationPoints.some((point) => point.text && point.text.trim());

  if (!overrideExisting.value && destinationHasPoints) return;

  if (destinationPoints.length) {
    await deleteBulletPoints(destinationPoints);
  }

  if (sourcePoints.length) {
    await createBulletPoints(destinationTranslationId, sourcePoints);
  }
};

const handleImport = async () => {
  if (!canImport.value || !selectedSourceChannel.value || !props.currentLanguage) return;

  importing.value = true;
  try {
    const normalizedSourceList: TranslationNode[] = (
      importAllLanguages.value
        ? sourceTranslations.value
        : sourcePreview.value
          ? [sourcePreview.value]
          : []
    ).filter(Boolean) as TranslationNode[];

    const destinationTranslations = await fetchTranslationsForChannel(props.currentSalesChannel);
    const destinationMap = new Map(destinationTranslations.map((item) => [item.language, item]));

    for (const sourceItem of normalizedSourceList) {
      if (!sourceItem.language) continue;
      const destinationItem = destinationMap.get(sourceItem.language) || null;
      const payload = buildFieldPayload(sourceItem, destinationItem);
      const salesChannelInput =
        props.currentSalesChannel === 'default' ? null : { id: props.currentSalesChannel };

      let destinationId = destinationItem?.id || null;

      if (Object.keys(payload).length) {
        if (destinationId) {
          await apolloClient.mutate({
            mutation: updateProductTranslationMutation,
            variables: { data: { id: destinationId, ...payload } },
          });
        } else {
          const { data } = await apolloClient.mutate({
            mutation: createProductTranslationMutation,
            variables: {
              data: {
                product: { id: props.productId },
                language: sourceItem.language,
                salesChannel: salesChannelInput,
                ...payload,
              },
            },
          });
          destinationId = data?.createProductTranslation?.id || null;
        }
      }

      if (allowedFields.value.bulletPoints && destinationId) {
        await importBulletPoints(sourceItem.id, destinationId);
      }
    }

    Toast.success(t('products.translation.import.success'));
    showModal.value = false;
    emit('imported');
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    if (Object.keys(validationErrors).length) {
      Object.values(validationErrors).forEach((message) => Toast.error(message));
    } else {
      Toast.error(t('shared.messages.somethingWentWrong'));
    }
  } finally {
    importing.value = false;
  }
};

watch(showModal, async (open) => {
  if (!open) return;
  overrideExisting.value = false;
  importAllLanguages.value = false;
  selectedSourceChannel.value = null;
  sourceTranslations.value = [];
  sourcePreview.value = null;
  sourcePreviewBulletPoints.value = [];
  await loadDestinationTranslations();
  await loadSourceTranslations();
  await updatePreview();
});

watch(selectedSourceChannel, async () => {
  await loadSourceTranslations();
  await updatePreview();
});

watch(
  () => props.currentLanguage,
  async () => {
    await updatePreview();
  },
);

watch(
  () => props.currentSalesChannel,
  async () => {
    await loadDestinationTranslations();
    await updatePreview();
  },
);

const importActionLabel = computed(() => {
  if (!selectedSourceChannel.value) return t('products.translation.import.importAction');
  const selectedLabel =
    selectedSourceChannel.value === 'default'
      ? t('shared.labels.default')
      : formatChannelLabel(props.salesChannels.find((item) => item.id === selectedSourceChannel.value));
  return t('products.translation.import.importActionWithSource', { source: selectedLabel });
});

const showMultiLanguageWarning = computed(() =>
  importAllLanguages.value &&
  !!selectedSourceChannel.value &&
  !hasSourceForCurrentLanguage.value &&
  hasAnySourceLanguages.value,
);
</script>

<template>
  <div class="inline-flex items-center">
    <Button class="btn btn-outline-primary mx-2" @click="showModal = true">
      {{ t('products.translation.import.button') }}
    </Button>

    <Modal v-model="showModal" @closed="showModal = false">
      <Card class="modal-content w-[80vw] max-w-5xl max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.translation.import.title') }}
          </h3>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">
              {{ t('products.translation.import.targetLabel') }}
            </label>
            <div class="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
              {{ targetChannelLabel }}
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">
              {{ t('products.translation.import.sourceLabel') }}
            </label>
            <IntegrationsSelector
              v-model="selectedSourceChannel"
              :integrations="props.salesChannels"
              :exclude-ids="[props.currentSalesChannel]"
              :add-default="props.currentSalesChannel !== 'default'"
              :placeholder="t('products.translation.import.sourcePlaceholder')"
              :removable="false"
              :disabled="!sourceChannelCount"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-800">
                  {{ t('products.translation.import.overrideLabel') }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ t('products.translation.import.overrideHelp') }}
                </div>
              </div>
              <Toggle v-model="overrideExisting" />
            </label>

            <label class="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
              <div>
                <div class="text-sm font-medium text-gray-800">
                  {{ t('products.translation.import.allLanguagesLabel') }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ t('products.translation.import.allLanguagesHelp') }}
                </div>
                <div v-if="importAllLanguages" class="mt-2 flex flex-wrap gap-2">
                  <Badge :text="availableLanguagesBadge" color="indigo" />
                  <Badge
                    v-for="code in sourceLanguageBadges"
                    :key="code"
                    :text="code"
                    color="green"
                  />
                </div>
                <div v-else class="mt-2 flex flex-wrap gap-2">
                  <Badge :text="currentLanguageBadge" color="gray" />
                </div>
              </div>
              <Toggle v-model="importAllLanguages" />
            </label>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-gray-700">
                {{ t('products.translation.import.previewTitle') }}
              </h4>
            </div>

            <div v-if="loading" class="text-sm text-gray-500">
              {{ t('shared.labels.loading') }}
            </div>

            <div
              v-else-if="selectedSourceChannel && !hasSourceForCurrentLanguage && !importAllLanguages"
              class="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              {{ t('products.translation.import.missingSource') }}
            </div>

            <div
              v-else-if="showMultiLanguageWarning"
              class="rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700"
            >
              {{ t('products.translation.import.missingSourceMultiLanguage') }}
            </div>

            <div v-else-if="selectedSourceChannel && previewContent" class="rounded-lg border border-gray-200">
              <ProductContentPreview
                :content="previewContent"
                :default-content="null"
                :current-channel="props.currentSalesChannel"
                :channels="props.salesChannels"
                :bullet-points="previewBulletPoints"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <Button class="btn btn-outline-dark" @click="showModal = false">
              {{ t('shared.button.cancel') }}
            </Button>
            <Button class="btn btn-primary" :disabled="!canImport" @click="handleImport">
              {{ importActionLabel }}
            </Button>
          </div>
        </div>
      </Card>
    </Modal>
  </div>
</template>
