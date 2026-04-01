<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../../apollo-client';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Modal } from '../../../../../../../shared/components/atoms/modal';
import { LocalLoader } from '../../../../../../../shared/components/atoms/local-loader';
import { Toast } from '../../../../../../../shared/modules/toast';
import { translationLanguagesQuery } from '../../../../../../../shared/api/queries/languages.js';
import { getProductContentByLanguageAndChannelQuery, getProductContentByLanguageAndDefaultQuery, productTranslationBulletPointsQuery } from '../../../../../../../shared/api/queries/products.js';
import { mediaProductThroughQuery } from '../../../../../../../shared/api/queries/media.js';
import { TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from '../../../../../../media/files/media';
import { VideoListingPreview } from '../../../../../../media/videos/videos-list/containers/video-listing-preview';

type MediaTypeFilter = 'ALL' | typeof TYPE_IMAGE | typeof TYPE_VIDEO | typeof TYPE_DOCUMENT;

const props = withDefaults(defineProps<{
  product: any;
  salesChannelId: string;
  salesChannels: any[];
  languageCode?: string | null;
  mediaTypeFilter?: MediaTypeFilter;
}>(), {
  languageCode: null,
  mediaTypeFilter: 'ALL',
});

const { t } = useI18n();

const isOpen = ref(false);
const loading = ref(false);
const previewContent = ref<any | null>(null);
const defaultPreviewContent = ref<any | null>(null);
const previewBulletPoints = ref<any[]>([]);
const previewItems = ref<any[]>([]);
const previewInherited = ref(false);
const resolvedLanguageCode = ref<string | null>(props.languageCode || null);

const productName = computed(() => props.product?.name ?? '');
const defaultChannelLabel = computed(() => window.location.hostname);

const cleanHostname = (hostname: string, type: string) => {
  if (!hostname) return '';
  if (type === 'amazon' || type === 'ebay' || type === 'shein') {
    return hostname;
  }
  try {
    const url = new URL(hostname.startsWith('http') ? hostname : `https://${hostname}`);
    return url.hostname.replace(/^www\./i, '').split('.')[0];
  } catch {
    return hostname;
  }
};

const channelLabel = computed(() => {
  if (props.salesChannelId === 'default') {
    return defaultChannelLabel.value;
  }
  const channel = props.salesChannels.find((entry: any) => entry.id === props.salesChannelId);
  if (!channel) {
    return '';
  }
  return cleanHostname(channel.hostname || channel.name || '', channel.type);
});

const buildMediaFilter = (channelId: string) => {
  const filter: Record<string, any> = {
    product: { id: { exact: props.product.id } },
  };

  if (channelId === 'default') {
    filter.salesChannel = { id: { isNull: true } };
  } else {
    filter.salesChannel = { id: { exact: channelId } };
  }

  return filter;
};

const extractMediaNodes = (data: any) => data?.mediaProductThroughs?.edges?.map((edge: any) => edge.node) || [];

const currentChannelType = computed(() => {
  if (props.salesChannelId === 'default') {
    return 'default';
  }

  return props.salesChannels.find((entry: any) => entry.id === props.salesChannelId)?.type || '';
});

const activeIndex = ref(0);

const loadResolvedLanguage = async () => {
  if (props.languageCode) {
    resolvedLanguageCode.value = props.languageCode;
    return props.languageCode;
  }

  const { data } = await apolloClient.query({
    query: translationLanguagesQuery,
    fetchPolicy: 'cache-first',
  });

  const defaultLanguageCode = data?.translationLanguages?.defaultLanguage?.code || 'en';
  resolvedLanguageCode.value = defaultLanguageCode;
  return defaultLanguageCode;
};

const loadPreviewContent = async (languageCode: string) => {
  const { data: defaultData } = await apolloClient.query({
    query: getProductContentByLanguageAndDefaultQuery,
    variables: { languageCode, productId: props.product.id },
    fetchPolicy: 'network-only',
  });

  const defaultTranslation = defaultData?.productTranslations?.edges?.[0]?.node || null;
  defaultPreviewContent.value = defaultTranslation;

  if (props.salesChannelId === 'default') {
    previewContent.value = defaultTranslation;
    previewBulletPoints.value = [];
    if (defaultTranslation?.id) {
      const { data: bulletData } = await apolloClient.query({
        query: productTranslationBulletPointsQuery,
        variables: { filter: { productTranslation: { id: { exact: defaultTranslation.id } } } },
        fetchPolicy: 'network-only',
      });
      previewBulletPoints.value = bulletData?.productTranslationBulletPoints?.edges?.map((edge: any) => edge.node) || [];
    }
    return;
  }

  const { data: channelData } = await apolloClient.query({
    query: getProductContentByLanguageAndChannelQuery,
    variables: {
      languageCode,
      productId: props.product.id,
      salesChannelId: props.salesChannelId,
    },
    fetchPolicy: 'network-only',
  });

  const channelTranslation = channelData?.productTranslations?.edges?.[0]?.node || null;
  previewContent.value = channelTranslation;

  const bulletSourceId = channelTranslation?.id || defaultTranslation?.id || null;
  previewBulletPoints.value = [];

  if (bulletSourceId) {
    const { data: bulletData } = await apolloClient.query({
      query: productTranslationBulletPointsQuery,
      variables: { filter: { productTranslation: { id: { exact: bulletSourceId } } } },
      fetchPolicy: 'network-only',
    });
    previewBulletPoints.value = bulletData?.productTranslationBulletPoints?.edges?.map((edge: any) => edge.node) || [];
  }
};

const loadPreviewMedia = async () => {
  const { data } = await apolloClient.query({
    query: mediaProductThroughQuery,
    variables: { filter: buildMediaFilter(props.salesChannelId) },
    fetchPolicy: 'network-only',
  });

  const channelItems = extractMediaNodes(data);

  if (props.salesChannelId === 'default') {
    previewItems.value = channelItems;
    previewInherited.value = false;
    return;
  }

  if (channelItems.length) {
    previewItems.value = channelItems;
    previewInherited.value = false;
    return;
  }

  const { data: defaultData } = await apolloClient.query({
    query: mediaProductThroughQuery,
    variables: { filter: buildMediaFilter('default') },
    fetchPolicy: 'network-only',
  });

  previewItems.value = extractMediaNodes(defaultData);
  previewInherited.value = true;
};

const loadPreview = async () => {
  loading.value = true;

  try {
    const languageCode = await loadResolvedLanguage();
    await Promise.all([
      loadPreviewContent(languageCode),
      loadPreviewMedia(),
    ]);
  } catch (error) {
    console.error('Failed to load product preview', error);
    Toast.error(t('shared.alert.toast.errorOccurred'));
  } finally {
    loading.value = false;
  }
};

const orderedItems = computed(() => {
  const list = (previewItems.value || []).slice().sort((a, b) => {
    const first = a.sortOrder ?? 0;
    const second = b.sortOrder ?? 0;
    return first - second;
  });

  const mainIndex = list.findIndex((entry) => entry.isMainImage);
  if (mainIndex > 0) {
    const [main] = list.splice(mainIndex, 1);
    list.unshift(main);
  }

  return list;
});

const activeItem = computed(() => orderedItems.value[activeIndex.value] || null);
const mediaType = computed(() => activeItem.value?.media?.type || '');
const imageSource = computed(() =>
  activeItem.value?.media?.imageWebUrl ||
  activeItem.value?.media?.onesilaThumbnailUrl ||
  activeItem.value?.media?.documentImageThumbnailUrl ||
  ''
);
const videoSource = computed(() => activeItem.value?.media?.videoUrl || '');
const hasItems = computed(() => orderedItems.value.length > 0);

const emptyStateMessage = computed(() => {
  if (props.mediaTypeFilter === TYPE_VIDEO) {
    return t('products.products.variations.media.preview.noVideos');
  }
  if (props.mediaTypeFilter === TYPE_DOCUMENT) {
    return t('products.products.variations.media.preview.noDocuments');
  }
  if (props.mediaTypeFilter === TYPE_IMAGE) {
    return t('products.products.variations.media.preview.noImages');
  }
  return t('products.products.variations.media.preview.noMedia');
});

const fieldRules = computed(() => {
  if (currentChannelType.value === 'amazon') {
    return {
      subtitle: true,
      shortDescription: true,
      urlKey: false,
      bulletPoints: true,
    };
  }

  return {
    subtitle: true,
    shortDescription: true,
    urlKey: true,
    bulletPoints: true,
  };
});

const isEmptyContent = (value: string | undefined | null): boolean => {
  if (!value) return true;

  const normalized = value.replace(/\s/g, '').toLowerCase();
  return normalized === '<p><br></p>' || normalized === '<br>' || normalized === '<p></p>';
};

const finalPreview = computed(() => {
  const base = props.salesChannelId !== 'default' && defaultPreviewContent.value ? defaultPreviewContent.value : {};

  return {
    name: previewContent.value?.name || base.name || '',
    subtitle: fieldRules.value.subtitle ? (previewContent.value?.subtitle || base.subtitle || '') : '',
    shortDescription:
      fieldRules.value.shortDescription
        ? (!isEmptyContent(previewContent.value?.shortDescription)
            ? previewContent.value?.shortDescription
            : (base.shortDescription || ''))
        : '',
    description:
      !isEmptyContent(previewContent.value?.description)
        ? previewContent.value?.description
        : (base.description || ''),
    urlKey: fieldRules.value.urlKey ? (previewContent.value?.urlKey || base.urlKey || '') : '',
    bulletPoints: fieldRules.value.bulletPoints ? (previewBulletPoints.value || []) : [],
  };
});

const previewUrl = computed(() => {
  if (!finalPreview.value.urlKey) {
    return channelLabel.value || defaultChannelLabel.value;
  }

  return `${channelLabel.value || defaultChannelLabel.value}/${finalPreview.value.urlKey}`;
});

const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

watch(isOpen, async (value) => {
  if (!value) {
    return;
  }

  await loadPreview();
});

watch(
  () => orderedItems.value,
  () => {
    activeIndex.value = 0;
  },
  { deep: true }
);
</script>

<template>
  <div>
    <Button
      :customClass="'inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50'"
      @click="isOpen = true"
    >
      <Icon name="eye" class="h-4 w-4 text-slate-500" />
      {{ t('shared.button.preview') }}
    </Button>

    <Modal v-model="isOpen">
      <div class="h-[80vh] w-[min(1360px,96vw)] overflow-hidden rounded-2xl bg-white p-5">
        <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div class="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div class="mr-3 flex items-center gap-2">
              <button
                type="button"
                class="h-3 w-3 rounded-full bg-rose-400 transition hover:scale-110"
                @click="isOpen = false"
              ></button>
              <span class="h-3 w-3 rounded-full bg-amber-400"></span>
              <span class="h-3 w-3 rounded-full bg-emerald-400"></span>
            </div>
            <div class="min-w-0 flex-1 truncate rounded-full border border-slate-200 bg-white px-4 py-2 font-mono text-xs text-slate-500 sm:text-sm">
              {{ previewUrl }}
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
              @click="isOpen = false"
            >
              <Icon name="x" class="h-4 w-4" />
            </button>
          </div>

          <div v-if="loading" class="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 px-5 py-5 lg:px-7 lg:py-7">
            <LocalLoader :loading="true" />
          </div>

          <div v-else class="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 px-5 py-5 lg:px-7 lg:py-7">
            <div class="grid gap-6 lg:grid-cols-[minmax(340px,0.85fr)_minmax(0,1.15fr)] lg:items-start">
              <div class="space-y-4">
                <div
                  v-if="hasItems"
                  class="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white"
                  :class="{ 'opacity-60': previewInherited }"
                >
                  <img
                    v-if="(mediaType === TYPE_IMAGE || mediaType === TYPE_DOCUMENT) && imageSource"
                    :src="imageSource"
                    :alt="finalPreview.name || productName"
                    class="h-full w-full object-cover"
                  />
                  <VideoListingPreview
                    v-else-if="mediaType === TYPE_VIDEO && videoSource"
                    :video-url="videoSource"
                    class="h-full w-full"
                  />
                  <div
                    v-else
                    class="flex h-full w-full flex-col items-center justify-center gap-3 bg-slate-50 px-6 text-center text-slate-500"
                  >
                    <Icon :name="mediaType === TYPE_DOCUMENT ? 'file-text' : 'image'" class="h-10 w-10" />
                    <span class="text-sm font-medium">{{ emptyStateMessage }}</span>
                  </div>
                </div>
                <div
                  v-else
                  class="flex aspect-[4/5] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-slate-500"
                >
                  <Icon name="image" class="mb-3 h-10 w-10" />
                  <span class="text-sm font-medium">{{ emptyStateMessage }}</span>
                </div>

                <div v-if="orderedItems.length > 1" class="flex gap-3 overflow-x-auto pb-1">
                  <button
                    v-for="(item, index) in orderedItems"
                    :key="item.id"
                    type="button"
                    class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-white transition"
                    :class="index === activeIndex
                      ? 'border-slate-900 ring-2 ring-slate-200'
                      : 'border-slate-200 hover:border-slate-400'"
                    @click="setActiveIndex(index)"
                  >
                    <img
                      v-if="item.media?.imageWebUrl || item.media?.onesilaThumbnailUrl || item.media?.documentImageThumbnailUrl"
                      :src="item.media.imageWebUrl || item.media.onesilaThumbnailUrl || item.media.documentImageThumbnailUrl"
                      :alt="finalPreview.name || productName"
                      class="h-full w-full object-cover"
                    />
                    <Icon v-else-if="item.media?.type === TYPE_VIDEO" name="video" class="h-5 w-5 text-slate-500" />
                    <Icon v-else name="file-text" class="h-5 w-5 text-slate-500" />
                  </button>
                </div>
              </div>

              <div class="min-w-0 space-y-5 rounded-3xl bg-white/80 p-1">
                <div class="space-y-3">
                  <div v-if="previewInherited" class="flex flex-wrap items-center gap-2">
                    <span
                      class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                    >
                      {{ t('products.translation.warning.inheritFromDefault') }}
                    </span>
                  </div>
                  <div>
                    <h2 class="text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
                      {{ finalPreview.name || productName }}
                    </h2>
                    <p v-if="finalPreview.subtitle" class="mt-2 text-sm text-slate-500 lg:text-base">
                      {{ finalPreview.subtitle }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="fieldRules.shortDescription && finalPreview.shortDescription"
                  class="prose prose-sm max-w-none text-slate-700 lg:prose-base"
                  v-html="finalPreview.shortDescription"
                />

                <div v-if="finalPreview.bulletPoints.length" class="rounded-2xl bg-slate-50 px-4 py-4">
                  <ul class="space-y-2 text-sm text-slate-700">
                    <li
                      v-for="bp in finalPreview.bulletPoints"
                      :key="bp.id || bp.text"
                      class="flex items-start gap-2"
                    >
                      <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-900"></span>
                      <span>{{ bp.text }}</span>
                    </li>
                  </ul>
                </div>

                <div
                  class="prose prose-sm max-w-none text-slate-700 lg:prose-base"
                  v-html="finalPreview.description"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </Modal>
  </div>
</template>
