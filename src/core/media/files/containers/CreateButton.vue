<script lang="ts" setup>

import { ref } from "vue";
import { Icon } from '../../../../shared/components/atoms/icon';
import {useI18n} from "vue-i18n";
import { isWiderThan, injectScreen } from "../../../../shared/modules/screen";
import { CreateVideosModal } from "./create-modals/videos-modals";
import { CreateDocumentsModal} from "./create-modals/documents-modal";
import { CreateImagesModal } from "./create-modals/images-modal";
import { Button } from "../../../../shared/components/atoms/button";
import { TYPE_IMAGE, TYPE_VIDEO, TYPE_DOCUMENT } from "../media";

const screen = injectScreen();
const props = defineProps<{ activeTab: string; }>();
const emit = defineEmits(['trigger-refetch']);

const { t } = useI18n();

const imagesModalVisible = ref(false);
const videosModalVisible = ref(false);
const documentsModalVisible = ref(false);

const dropdownVisible = ref(false);

const isHomeTab = () => props.activeTab === 'HOME';

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleEntryAdded = () => {
  emit('trigger-refetch');
};


const openModal = (modalType: string) => {

  if (modalType === TYPE_IMAGE) {
    imagesModalVisible.value = true;
  } else if (modalType === TYPE_VIDEO) {
    videosModalVisible.value = true;
  } else if (modalType === TYPE_DOCUMENT) {
    documentsModalVisible.value = true;
  }
  dropdownVisible.value = false;
};

</script>

<template>
  <div class="relative">
    <template v-if="isHomeTab()">
      <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
        <Button v-if="isWiderThan(screen, 1024)"
          class="btn inline-flex justify-center items-center bg-primary text-white w-full"
          @click="toggleDropdown"
        >
          <i class="mgc_add_line text-lg me-2"></i> {{ t('shared.button.uploadNew') }}
        </Button>
        <Button v-else type="button" class="btn bg-primary text-white" @click="toggleDropdown" >
          <Icon name="circle-plus" />
        </Button>
        <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 w-[230px] dark:text-white-light/90 bg-white border border-gray-300 rounded-md">
            <li>
              <Button @click="openModal(TYPE_IMAGE); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="image" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.images.upload') }}
              </Button>
            </li>
            <li>
              <Button @click="openModal(TYPE_VIDEO); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="video" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.videos.upload') }}
              </Button>
            </li>
            <li>
              <Button @click="openModal(TYPE_DOCUMENT); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="file-text" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.documents.upload') }}
              </Button>
            </li>
          </ul>
        </template>
      </Popper>
    </template>
    <template v-else>
      <Button v-if="isWiderThan(screen, 1024)"
        type="button"
        class="btn inline-flex justify-center items-center bg-primary text-white w-full"
        @click="openModal(activeTab)"
      >
        <i class="mgc_add_line text-lg me-2"></i> {{ t('shared.button.uploadNew') }}
      </Button>
      <Button v-else type="button" class="btn bg-primary text-white" @click="openModal(activeTab)" >
        <Icon name="circle-plus" />
      </Button>
    </template>
    <CreateImagesModal v-model="imagesModalVisible" @entries-created="handleEntryAdded" />
    <CreateVideosModal v-model="videosModalVisible" @entries-created="handleEntryAdded"/>
    <CreateDocumentsModal v-model="documentsModalVisible" @entries-created="handleEntryAdded" />
  </div>
</template>
