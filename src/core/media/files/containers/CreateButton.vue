<script lang="ts" setup>

import { ref } from "vue";
import { Icon } from '../../../../shared/components/atoms/icon';
import {useI18n} from "vue-i18n";
import { isWiderThan, injectScreen } from "../../../../shared/modules/screen";
import { CreateVideosModal } from "./create-modals/videos-modals";
import { CreateDocumentsModal} from "./create-modals/documents-modal";
import { CreateImagesModal } from "./create-modals/images-modal";

const screen = injectScreen();
const props = defineProps<{ activeTab: string; }>();
const emit = defineEmits(['trigger-refetch']);

const { t } = useI18n();

const imagesModalVisible = ref(false);
const videosModalVisible = ref(false);
const documentsModalVisible = ref(false);

const dropdownVisible = ref(false);

const isHomeTab = () => props.activeTab === 'home';

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value;
};

const handleEntryAdded = () => {
  emit('trigger-refetch');
};


const openModal = (modalType: string) => {

  if (modalType === 'images') {
    imagesModalVisible.value = true;
  } else if (modalType === 'videos') {
    videosModalVisible.value = true;
  } else if (modalType === 'documents') {
    documentsModalVisible.value = true;
  }
  dropdownVisible.value = false; // Close the dropdown if it's open
};

</script>

<template>
  <div class="relative">
    <template v-if="isHomeTab()">
      <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
        <button v-if="isWiderThan(screen, 1024)"
          type="button"
          class="btn inline-flex justify-center items-center bg-primary text-white w-full"
          @click="toggleDropdown"
        >
          <i class="mgc_add_line text-lg me-2"></i> {{ t('shared.button.uploadNew') }}
        </button>
        <button v-else type="button" class="btn bg-primary text-white" @click="toggleDropdown" >
          <Icon name="circle-plus" />
        </button>
        <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 w-[230px] dark:text-white-light/90 bg-white border border-gray-300 rounded-md">
            <li>
              <button @click="openModal('images'); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="image" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.images.upload') }}
              </button>
            </li>
            <li>
              <button @click="openModal('videos'); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="video" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.videos.upload') }}
              </button>
            </li>
            <li>
              <button @click="openModal('documents'); close()" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="file-text" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('media.documents.upload') }}
              </button>
            </li>
          </ul>
        </template>
      </Popper>
    </template>
    <template v-else>
      <button v-if="isWiderThan(screen, 1024)"
        type="button"
        class="btn inline-flex justify-center items-center bg-primary text-white w-full"
        @click="openModal(activeTab)"
      >
        <i class="mgc_add_line text-lg me-2"></i> {{ t('shared.button.uploadNew') }}
      </button>
      <button v-else type="button" class="btn bg-primary text-white" @click="openModal(activeTab)" >
        <Icon name="circle-plus" />
      </button>
    </template>
    <CreateImagesModal v-model="imagesModalVisible" @entries-created="handleEntryAdded" />
    <CreateVideosModal v-model="videosModalVisible" @entries-created="handleEntryAdded"/>
    <CreateDocumentsModal v-model="documentsModalVisible" @entries-created="handleEntryAdded" />
  </div>
</template>
