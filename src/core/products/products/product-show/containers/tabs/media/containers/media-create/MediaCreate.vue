<script setup lang="ts">

import { Product } from "../../../../../../configs";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../../../../shared/components/atoms/icon";
import { CreateImagesModal } from "../../../../../../../../media/files/containers/create-modals/images-modal";
import { CreateVideosModal } from "../../../../../../../../media/files/containers/create-modals/videos-modals";
import { CreateDocumentsModal } from "../../../../../../../../media/files/containers/create-modals/documents-modal";
import { TYPE_DOCUMENT, TYPE_IMAGE, TYPE_VIDEO } from "../../../../../../../../media/files/media";
import {UploadMediaModal} from "../upload-media-modal";

const { t } = useI18n();

const props = defineProps<{ product: Product; mediaIds: string[] }>();
const imagesModalVisible = ref(false);
const videosModalVisible = ref(false);
const documentsModalVisible = ref(false);
const uploadModalVisible = ref(false);

const emit = defineEmits(['media-added']);

const handleEntryAdded = () => {
  emit('media-added')
};

const openModal = (modalType: string, close: any) => {

  if (modalType === TYPE_IMAGE) {
    imagesModalVisible.value = true;
  } else if (modalType === TYPE_VIDEO) {
    videosModalVisible.value = true;
  } else if (modalType === TYPE_DOCUMENT) {
    documentsModalVisible.value = true;
  } else if (modalType === 'EXISTING') {
    uploadModalVisible.value = true;
  }

  close();
};

</script>

<template>
  <div>
    <Popper :placement="'bottom-end'" offsetDistance="8" class="!block">
        <Button class="btn btn-primary">
          <Icon class="mr-2" name="plus" />
          {{ t('shared.button.add') }}
        </Button>
        <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 w-[230px] dark:text-white-light/90 bg-white border border-gray-300 rounded-md">
            <li>
              <Button @click="openModal('EXISTING', close);" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="images" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.media.labels.addExistingFiles') }}
              </Button>
            </li>
            <li>
              <Button @click="openModal(TYPE_IMAGE, close);" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="image" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.images.labels.addImages') }}
              </Button>
            </li>
            <li>
              <Button @click="openModal(TYPE_VIDEO, close);"  class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="video" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.videos.upload') }}
              </Button>
            </li>
            <li>
              <Button @click="openModal(TYPE_DOCUMENT, close);"  class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="file-text" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.documents.labels.addDocuments') }}
              </Button>
            </li>
          </ul>
        </template>
      </Popper>

      <UploadMediaModal v-model="uploadModalVisible" :product-id="product.id" :ids="mediaIds" @entries-created="handleEntryAdded" />
      <CreateImagesModal v-model="imagesModalVisible" :product-id="product.id" @entries-created="handleEntryAdded" />
      <CreateVideosModal v-model="videosModalVisible" :product-id="product.id" @entries-created="handleEntryAdded"/>
      <CreateDocumentsModal v-model="documentsModalVisible" :product-id="product.id" @entries-created="handleEntryAdded" />
  </div>
</template>
