<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { shortenText } from '../../../../../../../shared/utils';
import { TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from '../../../../../../media/files/media';

type MediaTypeFilter = 'ALL' | typeof TYPE_IMAGE | typeof TYPE_VIDEO | typeof TYPE_DOCUMENT;

type MediaItem = {
  id: string;
  isMainImage: boolean;
  sortOrder: number | null;
  media: {
    id: string;
    type: string;
    imageWebUrl?: string;
    onesilaThumbnailUrl?: string;
    videoUrl?: string;
  };
};

const props = defineProps<{
  productName: string;
  channelLabel: string;
  defaultLabel: string;
  items: MediaItem[];
  mediaTypeFilter: MediaTypeFilter;
  isInherited: boolean;
}>();

const { t } = useI18n();

const orderedItems = computed(() => {
  const list = (props.items || []).slice().sort((a, b) => {
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

const activeIndex = ref(0);

watch(
  () => props.items,
  () => {
    activeIndex.value = 0;
  },
  { deep: true }
);

const activeItem = computed(() => orderedItems.value[activeIndex.value] || null);

const previewTitle = computed(() => {
  const fallbackTitle = t('products.products.variations.media.preview.untitledProduct');
  const resolvedName = (props.productName || '').trim();

  if (!resolvedName) {
    return fallbackTitle;
  }

  return shortenText(resolvedName, 60);
});
const channelDisplay = computed(() => props.channelLabel || props.defaultLabel);

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
const emptyStateIcon = computed(() => {
  if (props.mediaTypeFilter === TYPE_VIDEO) {
    return 'video';
  }
  if (props.mediaTypeFilter === TYPE_DOCUMENT) {
    return 'file-text';
  }
  return 'image';
});

const mediaType = computed(() => activeItem.value?.media?.type || '');
const imageSource = computed(() => activeItem.value?.media?.imageWebUrl || activeItem.value?.media?.onesilaThumbnailUrl || '');
const videoSource = computed(() => activeItem.value?.media?.videoUrl || '');

const setActiveIndex = (index: number) => {
  activeIndex.value = index;
};

</script>

<template>
  <div class="sticky top-20 h-fit max-h-[580px] overflow-x-hidden overflow-y-auto rounded border bg-white shadow">
    <div class="border-b bg-gray-100 px-5 py-3 text-sm text-gray-500">
      {{
        t('products.products.variations.media.preview.channelHeading', {
          channel: channelDisplay || t('products.products.variations.media.preview.channelFallback')
        })
      }}
    </div>
    <div class="space-y-4 px-5 py-4">
      <div>
        <h3 class="truncate text-lg font-semibold text-gray-900">{{ previewTitle }}</h3>
        <p class="text-sm text-gray-600">{{ t('products.products.variations.media.preview.description') }}</p>
      </div>
      <div v-if="hasItems" class="space-y-4" :class="{ 'opacity-60': isInherited }">
        <div class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border bg-gray-50">
          <img
            v-if="mediaType === 'IMAGE' && imageSource"
            :src="imageSource"
            :alt="t('products.products.variations.media.preview.mainImageAlt')"
            class="h-full w-full object-cover"
          />
          <video
            v-else-if="mediaType === 'VIDEO' && videoSource"
            controls
            class="h-full w-full object-cover"
          >
            <source :src="videoSource" />
          </video>
          <div v-else class="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <Icon name="image" class="mb-2 h-8 w-8" />
            <span class="text-sm">{{ t('products.products.variations.media.preview.unsupported') }}</span>
          </div>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-1">
          <button
            v-for="(item, index) in orderedItems"
            :key="item.id"
            type="button"
            class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded border"
            :class="[
              index === activeIndex
                ? 'border-primary ring-2 ring-primary'
                : 'border-gray-200 hover:border-primary'
            ]"
            @click="setActiveIndex(index)"
          >
            <img
              v-if="item.media?.imageWebUrl || item.media?.onesilaThumbnailUrl"
              :src="item.media.imageWebUrl || item.media.onesilaThumbnailUrl"
              :alt="t('products.products.variations.media.preview.thumbnailAlt')"
              class="h-full w-full object-cover"
            />
            <Icon v-else-if="item.media?.type === 'VIDEO'" name="video" class="h-5 w-5 text-gray-500" />
            <Icon v-else name="file" class="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div v-else class="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center">
        <Icon :name="emptyStateIcon" class="mb-3 h-8 w-8 text-gray-400" />
        <p class="text-sm text-gray-500">{{ emptyStateMessage }}</p>
      </div>
    </div>
  </div>
</template>
