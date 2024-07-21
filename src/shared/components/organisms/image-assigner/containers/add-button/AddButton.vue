<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {ref} from 'vue';
import { Button } from '../../../../../components/atoms/button';
import {Icon} from "../../../../atoms/icon";
import {PrimaryButton} from "../../../../atoms/button-primary";
import {SecondaryButton} from "../../../../atoms/button-secondary";
import {UploadNewImage} from "../upload-new-image";
import AssignExistentImage from "../assign-existent-image/AssignExistentImage.vue";

const { t } = useI18n();

enum ModalType {
  New = "New",
  Existent = "Existent",
}

const props = defineProps<{ hasImageAssigned: boolean }>();
const emit = defineEmits(['imaged-added']);
const uploadNewImageVisible = ref(false);
const assignExistingImageVisible = ref(false);

const openModal = (modalType: string, close: any) => {

  if (modalType ===  ModalType.New) {
    uploadNewImageVisible.value = true;
  } else if (modalType === ModalType.Existent) {
    assignExistingImageVisible.value = true;
  }

  close();
};

const handleEntryAdded = (image) => {
  emit('imaged-added', image)
}

</script>

<template>
    <div>
    <Popper :placement="'top-start'" offsetDistance="8" class="!block">
        <SecondaryButton v-if="hasImageAssigned">
          <Icon class="mr-2" name="arrows-rotate" />
          {{ t('shared.button.change') }}
        </SecondaryButton>
        <PrimaryButton v-else>
          <Icon class="mr-2" name="plus" />
          {{ t('shared.button.add') }}
        </PrimaryButton>
        <template #content="{ close }">
          <ul class="text-dark dark:text-white-dark !py-0 w-[230px] dark:text-white-light/90 bg-white border border-gray-300 rounded-md">
            <li>
              <Button @click="openModal(ModalType.New, close);" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="upload" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('shared.components.organisms.imageAssigner.addButton.uploadNew') }}
              </Button>
            </li>
            <li>
              <Button @click="openModal(ModalType.Existent, close);" class="flex items-center w-full px-4 py-2 hover:bg-gray-100">
                <Icon name="images" class="w-4.5 h-4.5 mr-2 shrink-0" />
                {{ t('shared.components.organisms.imageAssigner.addButton.addExisting') }}
              </Button>
            </li>
          </ul>
        </template>
      </Popper>

      <UploadNewImage v-model="uploadNewImageVisible" @entry-created="handleEntryAdded" />
      <AssignExistentImage v-model="assignExistingImageVisible" @entry-created="handleEntryAdded" />
  </div>
</template>