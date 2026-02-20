<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { Product } from '../../../../../../configs';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../../../shared/components/atoms/icon';
import { CreateDocumentsModal } from '../../../../../../../../media/files/containers/create-modals/documents-modal';
import { CreateImagesModal } from '../../../../../../../../media/files/containers/create-modals/images-modal';
import { CreateVideosModal } from '../../../../../../../../media/files/containers/create-modals/videos-modals';
import { TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from '../../../../../../../../media/files/media';
import { UploadMediaModal } from '../upload-media-modal';

type MediaTypeFilter = 'ALL' | typeof TYPE_IMAGE | typeof TYPE_VIDEO | typeof TYPE_DOCUMENT;

const { t } = useI18n();

const props = defineProps<{
  product: Product;
  mediaIds: string[];
  mediaTypeFilter?: MediaTypeFilter;
  salesChannelId?: string | 'default';
  disabled?: boolean;
}>();
const imagesModalVisible = ref(false);
const videosModalVisible = ref(false);
const documentsModalVisible = ref(false);
const uploadModalVisible = ref(false);

const resolvedSalesChannelId = computed(() =>
  props.salesChannelId && props.salesChannelId !== 'default' ? props.salesChannelId : undefined
);
const resolvedMediaTypeFilter = computed(() => props.mediaTypeFilter ?? 'ALL');
const hasSpecificTypeFilter = computed(() => resolvedMediaTypeFilter.value !== 'ALL');
const existingMediaTypeFilter = computed(() =>
  resolvedMediaTypeFilter.value === 'ALL' ? undefined : resolvedMediaTypeFilter.value
);
const specificAddLabel = computed(() => {
  switch (resolvedMediaTypeFilter.value) {
    case TYPE_IMAGE:
      return t('media.images.labels.addImages');
    case TYPE_VIDEO:
      return t('media.videos.upload');
    case TYPE_DOCUMENT:
      return t('media.documents.labels.addDocuments');
    default:
      return t('shared.button.add');
  }
});
const specificAddIcon = computed(() => {
  switch (resolvedMediaTypeFilter.value) {
    case TYPE_IMAGE:
      return 'image';
    case TYPE_VIDEO:
      return 'video';
    case TYPE_DOCUMENT:
      return 'file-text';
    default:
      return 'plus';
  }
});

const emit = defineEmits(['media-added']);

const handleEntryAdded = () => {
  emit('media-added');
};

const openModal = (modalType: string, close?: () => void) => {
  if (props.disabled) {
    return;
  }

  if (modalType === TYPE_IMAGE) {
    imagesModalVisible.value = true;
  } else if (modalType === TYPE_VIDEO) {
    videosModalVisible.value = true;
  } else if (modalType === TYPE_DOCUMENT) {
    documentsModalVisible.value = true;
  } else if (modalType === 'EXISTING') {
    uploadModalVisible.value = true;
  }

  close?.();
};

const openFilteredExistingModal = () => {
  openModal('EXISTING');
};
</script>

<template>
  <div class="flex items-center gap-2">
    <Popper v-if="!hasSpecificTypeFilter" :placement="'bottom-end'" offsetDistance="8" class="!block">
      <Button class="btn btn-primary" :disabled="disabled">
        <Icon class="mr-2" name="plus" />
        {{ t('shared.button.add') }}
      </Button>
      <template #content="{ close }">
        <ul class="text-dark dark:text-white-dark !py-0 w-[230px] dark:text-white-light/90 bg-white border border-gray-300 rounded-md">
          <li>
            <Button @click="openModal('EXISTING', close)" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
              <Icon name="images" class="w-4.5 h-4.5 mr-2 shrink-0" />
              {{ t('media.media.labels.addExistingFiles') }}
            </Button>
          </li>
          <li>
            <Button @click="openModal(TYPE_IMAGE, close)" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
              <Icon name="image" class="w-4.5 h-4.5 mr-2 shrink-0" />
              {{ t('media.images.labels.addImages') }}
            </Button>
          </li>
          <li>
            <Button @click="openModal(TYPE_VIDEO, close)" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
              <Icon name="video" class="w-4.5 h-4.5 mr-2 shrink-0" />
              {{ t('media.videos.upload') }}
            </Button>
          </li>
          <li>
            <Button @click="openModal(TYPE_DOCUMENT, close)" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
              <Icon name="file-text" class="w-4.5 h-4.5 mr-2 shrink-0" />
              {{ t('media.documents.labels.addDocuments') }}
            </Button>
          </li>
        </ul>
      </template>
    </Popper>

    <Button
      v-else
      class="btn btn-primary"
      :disabled="disabled"
      @click="openModal(resolvedMediaTypeFilter)"
    >
      <Icon class="mr-2" :name="specificAddIcon" />
      {{ specificAddLabel }}
    </Button>

    <Button
      v-if="hasSpecificTypeFilter"
      class="btn btn-outline-primary"
      :disabled="disabled"
      @click="openFilteredExistingModal"
    >
      <Icon class="mr-2" name="images" />
      {{ t('media.media.labels.addExistingFiles') }}
    </Button>

    <UploadMediaModal
      v-model="uploadModalVisible"
      :product-id="product.id"
      :ids="mediaIds"
      :media-type="existingMediaTypeFilter"
      :sales-channel-id="resolvedSalesChannelId"
      @entries-created="handleEntryAdded"
    />
    <CreateImagesModal
      v-model="imagesModalVisible"
      :product-id="product.id"
      :sales-channel-id="resolvedSalesChannelId"
      @entries-created="handleEntryAdded"
    />
    <CreateVideosModal
      v-model="videosModalVisible"
      :product-id="product.id"
      :sales-channel-id="resolvedSalesChannelId"
      @entries-created="handleEntryAdded"
    />
    <CreateDocumentsModal
      v-model="documentsModalVisible"
      :product-id="product.id"
      :sales-channel-id="resolvedSalesChannelId"
      @entries-created="handleEntryAdded"
    />
  </div>
</template>
