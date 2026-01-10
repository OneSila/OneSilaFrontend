<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../apollo-client';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Modal } from '../../atoms/modal';
import { Card } from '../../atoms/card';
import { IntegrationsSelector } from '../../molecules/integrations-selector';
import { Toggle } from '../../atoms/toggle';
import { Badge } from '../../atoms/badge';
import { Accordion } from '../../atoms/accordion';
import { Checkbox } from '../../atoms/checkbox';
import { Selector } from '../../atoms/selector';
import { Toast } from '../../../modules/toast';
import { formatIntegrationLabel, processGraphQLErrors } from '../../../utils';
import {
  getProductContentsByChannelQuery,
  getProductContentsByDefaultQuery,
  productTranslationBulletPointsQuery,
} from '../../../api/queries/products.js';
import {
  createProductTranslationMutation,
  importProductTranslationsMutation,
  updateProductTranslationMutation,
  createProductTranslationBulletPointsMutation,
  deleteProductTranslationBulletPointsMutation,
} from '../../../api/mutations/products.js';
import { translationLanguagesQuery } from '../../../api/queries/languages.js';
import { getContentFieldRules } from '../../../../core/products/products/product-show/containers/tabs/content/contentFieldRules';
import ProductContentPreview from '../../../../core/products/products/product-show/containers/tabs/content/ProductContentPreview.vue';

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

type ImportFieldKey = 'name' | 'subtitle' | 'shortDescription' | 'description' | 'urlKey' | 'bulletPoints';

interface LanguageOption {
  code: string;
  name?: string | null;
}

interface Props {
  productIds: string[];
  currentLanguage: string | null;
  currentSalesChannel: 'default' | string | null;
  salesChannels: SalesChannel[];
  btnClass?: string;
  useDefaultButtonStyles?: boolean;
  buttonLabel?: string;
  iconName?: string | null;
  iconClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  btnClass: 'btn-outline-primary mx-2',
  useDefaultButtonStyles: true,
  buttonLabel: 'products.translation.import.button',
  iconName: null,
  iconClass: 'mr-2',
});

const emit = defineEmits<{
  (e: 'imported'): void;
}>();

const { t } = useI18n();

const hasProducts = computed(() => props.productIds.length > 0);
const buttonClass = computed(() => {
  if (props.useDefaultButtonStyles) {
    return `btn ${props.btnClass}`.trim();
  }
  return props.btnClass;
});

const showModal = ref(false);
const selectedSourceChannel = ref<string | null>(null);
const selectedTargetChannel = ref<string | null>(null);
const selectedLanguage = ref<string | null>(null);
const overrideExisting = ref(false);
const importAllLanguages = ref(false);
const loading = ref(false);
const importing = ref(false);
const languageLoading = ref(false);
const languageOptions = ref<LanguageOption[]>([]);
const sourceTranslations = ref<TranslationNode[]>([]);
const sourcePreview = ref<TranslationNode | null>(null);
const sourcePreviewBulletPoints = ref<BulletPointNode[]>([]);
const destinationTranslations = ref<TranslationNode[]>([]);
const destinationPreview = ref<TranslationNode | null>(null);
const destinationPreviewBulletPoints = ref<BulletPointNode[]>([]);
const selectedFields = reactive<Record<ImportFieldKey, boolean>>({
  name: false,
  subtitle: false,
  shortDescription: false,
  description: false,
  urlKey: false,
  bulletPoints: false,
});
const fieldEnumMap: Record<ImportFieldKey, string> = {
  name: 'NAME',
  subtitle: 'SUBTITLE',
  shortDescription: 'SHORT_DESCRIPTION',
  description: 'DESCRIPTION',
  urlKey: 'URL_KEY',
  bulletPoints: 'BULLET_POINTS',
};

const emptyHtml = '<p><br></p>';

const formatChannelLabel = (channel?: SalesChannel) => {
  if (!channel) return t('shared.labels.default');
  return formatIntegrationLabel(channel) || t('shared.labels.default');
};

const isSingleUpdate = computed(() => props.productIds.length === 1);
const resolvedProductId = computed(() => (isSingleUpdate.value ? props.productIds[0] : null));
const resolvedLanguage = computed(() => props.currentLanguage ?? selectedLanguage.value);
const resolvedTargetChannel = computed(() => props.currentSalesChannel ?? selectedTargetChannel.value);
const hasTargetSelection = computed(() => !!resolvedTargetChannel.value);
const hasLanguageSelection = computed(() => !!resolvedLanguage.value);
const hasSourceSelection = computed(() => !!selectedSourceChannel.value);

const sourceChannelCount = computed(() => {
  const target = resolvedTargetChannel.value;
  const addDefault = target !== 'default';
  const filtered = target
    ? props.salesChannels.filter((channel) => channel.id !== target)
    : props.salesChannels;
  return filtered.length + (addDefault ? 1 : 0);
});

const sourceExcludeIds = computed(() => (resolvedTargetChannel.value ? [resolvedTargetChannel.value] : []));

const targetChannelLabel = computed(() => {
  const target = resolvedTargetChannel.value;
  if (!target || target === 'default') {
    return t('shared.labels.default');
  }
  const channel = props.salesChannels.find((item) => item.id === target);
  return channel ? formatChannelLabel(channel) : target;
});

const resolveChannelType = (channelId: string | null) => {
  if (!channelId || channelId === 'default') return 'default';
  const channel = props.salesChannels.find((item) => item.id === channelId);
  return channel?.type || 'default';
};

const sourceChannelType = computed(() => resolveChannelType(selectedSourceChannel.value));
const destinationChannelType = computed(() => resolveChannelType(resolvedTargetChannel.value));

const sourceRules = computed(() => getContentFieldRules(sourceChannelType.value));
const destinationRules = computed(() => getContentFieldRules(destinationChannelType.value));

const baseAllowedFields = computed(() => {
  if (!hasSourceSelection.value || !hasTargetSelection.value) {
    return {
      name: false,
      subtitle: false,
      shortDescription: false,
      description: false,
      urlKey: false,
      bulletPoints: false,
    };
  }
  return {
    name: sourceRules.value.name && destinationRules.value.name,
    subtitle: sourceRules.value.subtitle && destinationRules.value.subtitle,
    shortDescription: sourceRules.value.shortDescription && destinationRules.value.shortDescription,
    description: sourceRules.value.description && destinationRules.value.description,
    urlKey: sourceRules.value.urlKey && destinationRules.value.urlKey,
    bulletPoints: sourceRules.value.bulletPoints && destinationRules.value.bulletPoints,
  };
});

const allowedFields = computed(() => ({
  name: baseAllowedFields.value.name && selectedFields.name,
  subtitle: baseAllowedFields.value.subtitle && selectedFields.subtitle,
  shortDescription: baseAllowedFields.value.shortDescription && selectedFields.shortDescription,
  description: baseAllowedFields.value.description && selectedFields.description,
  urlKey: baseAllowedFields.value.urlKey && selectedFields.urlKey,
  bulletPoints: baseAllowedFields.value.bulletPoints && selectedFields.bulletPoints,
}));

const advancedOptionsItems = computed(() => [
  { name: 'fields', label: t('products.translation.import.advancedOptionsTitle') },
]);

const fieldOptions = computed<Array<{ key: ImportFieldKey; label: string; available: boolean }>>(() => [
  { key: 'name', label: t('shared.labels.name'), available: baseAllowedFields.value.name },
  { key: 'subtitle', label: t('products.translation.labels.subtitle'), available: baseAllowedFields.value.subtitle },
  {
    key: 'shortDescription',
    label: t('shared.labels.shortDescription'),
    available: baseAllowedFields.value.shortDescription,
  },
  { key: 'description', label: t('products.translation.labels.description'), available: baseAllowedFields.value.description },
  { key: 'urlKey', label: t('products.translation.labels.urlKey'), available: baseAllowedFields.value.urlKey },
  { key: 'bulletPoints', label: t('products.translation.labels.bulletPoints'), available: baseAllowedFields.value.bulletPoints },
]);

const previewChannel = computed(() => resolvedTargetChannel.value || 'default');

const resetSelectedFields = () => {
  const rules = baseAllowedFields.value;
  selectedFields.name = rules.name;
  selectedFields.subtitle = rules.subtitle;
  selectedFields.shortDescription = rules.shortDescription;
  selectedFields.description = rules.description;
  selectedFields.urlKey = rules.urlKey;
  selectedFields.bulletPoints = rules.bulletPoints;
};

const updateSelectedField = (field: ImportFieldKey, value: boolean) => {
  selectedFields[field] = value;
};

const selectedFieldEnums = computed(() =>
  (Object.entries(selectedFields) as Array<[ImportFieldKey, boolean]>)
    .filter(([, enabled]) => enabled)
    .map(([field]) => fieldEnumMap[field]),
);

const openModal = () => {
  if (!hasProducts.value) return;
  showModal.value = true;
};

const availableLanguagesBadge = computed(() =>
  t('products.translation.import.availableLanguagesBadge', { count: sourceTranslations.value.length }),
);

const currentLanguageBadge = computed(() =>
  t('products.translation.import.currentLanguageBadge', { code: resolvedLanguage.value || '-' }),
);

const hasSourceForCurrentLanguage = computed(() => !!sourcePreview.value);
const hasAnySourceLanguages = computed(() => sourceTranslations.value.length > 0);

const canImport = computed(() => {
  if (!selectedSourceChannel.value || importing.value) return false;
  if (!hasTargetSelection.value) return false;
  if (selectedSourceChannel.value === resolvedTargetChannel.value) return false;
  if (!isSingleUpdate.value) {
    if (importAllLanguages.value) return true;
    return hasLanguageSelection.value;
  }
  if (importAllLanguages.value) {
    return hasAnySourceLanguages.value;
  }
  return hasLanguageSelection.value && hasSourceForCurrentLanguage.value;
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
  if (!hasTargetSelection.value) return null;
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
  if (!resolvedProductId.value) return [];
  const query = channelId === 'default' ? getProductContentsByDefaultQuery : getProductContentsByChannelQuery;
  const variables = channelId === 'default'
    ? { productId: resolvedProductId.value }
    : { productId: resolvedProductId.value, salesChannelId: channelId };

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

const loadLanguageOptions = async () => {
  if (props.currentLanguage) return;
  languageLoading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: translationLanguagesQuery,
      fetchPolicy: 'cache-first',
    });

    const languages = (data?.translationLanguages?.languages || []) as LanguageOption[];
    languageOptions.value = languages.map((language) => ({
      code: language.code,
      name: language.name || language.code,
    }));

    const defaultCode = data?.translationLanguages?.defaultLanguage?.code || null;
    if (!selectedLanguage.value) {
      selectedLanguage.value = defaultCode || languageOptions.value[0]?.code || null;
    }
  } finally {
    languageLoading.value = false;
  }
};

const loadSourceTranslations = async () => {
  if (!selectedSourceChannel.value || !isSingleUpdate.value) {
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
  if (!resolvedTargetChannel.value || !isSingleUpdate.value) {
    destinationTranslations.value = [];
    destinationPreview.value = null;
    destinationPreviewBulletPoints.value = [];
    return;
  }
  destinationTranslations.value = await fetchTranslationsForChannel(resolvedTargetChannel.value);
};

const updatePreview = async () => {
  if (!resolvedLanguage.value || !resolvedTargetChannel.value || !isSingleUpdate.value) {
    sourcePreview.value = null;
    sourcePreviewBulletPoints.value = [];
    destinationPreview.value = null;
    destinationPreviewBulletPoints.value = [];
    return;
  }

  const language = resolvedLanguage.value;

  sourcePreview.value =
    sourceTranslations.value.find((item) => item.language === language) || null;
  sourcePreviewBulletPoints.value = [];

  destinationPreview.value =
    destinationTranslations.value.find((item) => item.language === language) || null;
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

const handleImportSingle = async () => {
  if (!canImport.value || !selectedSourceChannel.value || !resolvedTargetChannel.value) return;
  if (!resolvedProductId.value) return;
  if (!hasLanguageSelection.value && !importAllLanguages.value) return;

  importing.value = true;
  try {
    const normalizedSourceList: TranslationNode[] = (
      importAllLanguages.value
        ? sourceTranslations.value
        : sourcePreview.value
          ? [sourcePreview.value]
          : []
    ).filter(Boolean) as TranslationNode[];

    const destinationTranslations = await fetchTranslationsForChannel(resolvedTargetChannel.value);
    const destinationMap = new Map(destinationTranslations.map((item) => [item.language, item]));

    for (const sourceItem of normalizedSourceList) {
      if (!sourceItem.language) continue;
      const destinationItem = destinationMap.get(sourceItem.language) || null;
      const payload = buildFieldPayload(sourceItem, destinationItem);
      const salesChannelInput =
        resolvedTargetChannel.value === 'default' ? null : { id: resolvedTargetChannel.value };

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
                product: { id: resolvedProductId.value },
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

const handleImportMulti = async () => {
  if (!canImport.value || !selectedSourceChannel.value || !resolvedTargetChannel.value) return;

  importing.value = true;
  try {
    const channelSource =
      selectedSourceChannel.value === 'default' ? null : { id: selectedSourceChannel.value };
    const channelTarget =
      resolvedTargetChannel.value === 'default' ? null : { id: resolvedTargetChannel.value };
    const products = props.productIds.map((id) => ({ id: String(id) }));

    const { data } = await apolloClient.mutate({
      mutation: importProductTranslationsMutation,
      variables: {
        instance: {
          channelSource,
          channelTarget,
          language: importAllLanguages.value ? null : resolvedLanguage.value,
          override: overrideExisting.value,
          allLanguages: importAllLanguages.value,
          fields: selectedFieldEnums.value,
          products,
        },
      },
    });

    if (data?.importProductTranslations?.success) {
      Toast.success(t('products.translation.import.multiStarted'));
      showModal.value = false;
      emit('imported');
      return;
    }

    Toast.error(t('shared.messages.somethingWentWrong'));
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

const handleImport = async () => {
  if (isSingleUpdate.value) {
    await handleImportSingle();
    return;
  }
  await handleImportMulti();
};

watch(showModal, async (open) => {
  if (!open) return;
  overrideExisting.value = false;
  importAllLanguages.value = false;
  selectedSourceChannel.value = null;
  selectedTargetChannel.value = props.currentSalesChannel ?? null;
  selectedLanguage.value = props.currentLanguage ?? null;
  sourceTranslations.value = [];
  sourcePreview.value = null;
  sourcePreviewBulletPoints.value = [];
  if (!props.currentLanguage) {
    await loadLanguageOptions();
  }
  await loadDestinationTranslations();
  await loadSourceTranslations();
  await updatePreview();
  resetSelectedFields();
});

watch(selectedSourceChannel, async () => {
  await loadSourceTranslations();
  await updatePreview();
  resetSelectedFields();
});

watch(
  () => resolvedLanguage.value,
  async () => {
    await updatePreview();
  },
);

watch(
  () => resolvedTargetChannel.value,
  async (next) => {
    if (next && selectedSourceChannel.value === next) {
      selectedSourceChannel.value = null;
    }
    await loadDestinationTranslations();
    await updatePreview();
    resetSelectedFields();
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
    <Button :class="buttonClass" :disabled="!hasProducts" @click="openModal">
      <Icon v-if="props.iconName" :name="props.iconName" size="sm" :class="props.iconClass" />
      {{ t(props.buttonLabel) }}
    </Button>

    <Modal v-model="showModal" @closed="showModal = false">
      <Card class="modal-content w-[80vw] max-w-5xl max-h-[80vh] overflow-y-auto">
        <div class="border-b border-gray-200 pb-4 mb-4">
          <h3 class="text-xl font-semibold">
            {{ t('products.translation.import.title') }}
          </h3>
          <p class="text-sm text-gray-500 mt-2">
            {{ isSingleUpdate ? t('products.translation.import.descriptionSingle') : t('products.translation.import.descriptionMulti') }}
          </p>
        </div>

        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">
              {{ t('products.translation.import.targetLabel') }}
            </label>
            <div
              v-if="props.currentSalesChannel !== null"
              class="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700"
            >
              {{ targetChannelLabel }}
            </div>
            <IntegrationsSelector
              v-else
              v-model="selectedTargetChannel"
              :integrations="props.salesChannels"
              :add-default="true"
              :placeholder="t('products.translation.import.targetPlaceholder')"
              :removable="false"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">
              {{ t('products.translation.import.sourceLabel') }}
            </label>
            <IntegrationsSelector
              v-model="selectedSourceChannel"
              :integrations="props.salesChannels"
              :exclude-ids="sourceExcludeIds"
              :add-default="resolvedTargetChannel !== 'default'"
              :placeholder="t('products.translation.import.sourcePlaceholder')"
              :removable="false"
              :disabled="!sourceChannelCount"
            />
          </div>

          <div v-if="props.currentLanguage === null && importAllLanguages == false" class="space-y-2">
            <label class="text-sm font-semibold text-gray-700">
              {{ t('shared.labels.language') }}
            </label>
            <Selector
              v-model="selectedLanguage"
              :options="languageOptions"
              label-by="name"
              value-by="code"
              :placeholder="t('products.translation.placeholders.language')"
              :removable="false"
              :is-loading="languageLoading"
              :disabled="languageLoading || !languageOptions.length"
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
                  <Badge v-if="isSingleUpdate" :text="availableLanguagesBadge" color="indigo" />
                  <Badge
                    v-if="isSingleUpdate"
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

          <Accordion :items="advancedOptionsItems">
            <template #fields>
              <div class="space-y-4">
                <div class="space-y-1">
                  <h5 class="text-sm font-semibold text-gray-700">
                    {{ t('products.translation.import.fieldsLabel') }}
                  </h5>
                  <p class="text-xs text-gray-500">
                    {{ t('products.translation.import.fieldsHelp') }}
                  </p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    v-for="field in fieldOptions"
                    :key="field.key"
                    class="flex items-center rounded-md border border-gray-200 px-3 py-2"
                    :class="field.available ? '' : 'cursor-not-allowed opacity-50'"
                  >
                    <Checkbox
                      :model-value="selectedFields[field.key]"
                      :disabled="!field.available"
                      @update:modelValue="(value) => updateSelectedField(field.key, value)"
                    >
                      {{ field.label }}
                    </Checkbox>
                  </label>
                </div>
              </div>
            </template>
          </Accordion>

          <div v-if="isSingleUpdate" class="space-y-2">
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
                :current-channel="previewChannel"
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
