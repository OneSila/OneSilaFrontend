<script setup lang="ts">
import {Ref, ref, watch} from 'vue';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../shared/components/atoms/icon';
import { DropZone } from "../../../../../../shared/components/molecules/drop-zone";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../shared/components/atoms/button";
import {Toast} from "../../../../../../shared/modules/toast";

const props = defineProps<{ modelValue: boolean; }>();
const emit = defineEmits(['update:modelValue', 'entry-created']);
const localShowModal = ref(props.modelValue);

const { t } = useI18n();

type UploadedFile = File;

type ShowFile = {
    file: any;
    name?: string;
};

const files: Ref<ShowFile[]> = ref([])
const dropZone: Ref<any> = ref(null)

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
});

const closeModal = () => {
  localShowModal.value = false;
  files.value = [];
  emit('update:modelValue', false);
};

const onUploaded = (uploadedFiles: UploadedFile[]) => {
  files.value = [];
  uploadedFiles.forEach(file => {
    files.value.push({ name: file.name, file });
  });
  dropZone.value?.clear();
};

const removeFile = (index) => {
  files.value.splice(index, 1);
};

const submitFiles = async () => {
  if (files.value.length > 0) {
    const fileToUpload = files.value[0].file;

    emit('entry-created', fileToUpload);
    closeModal();
  }
};

</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-2/3">
        <div class="mb-4">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">{{ t('media.documents.uploadDocument') }}</h3>
        </div>
        <DropZone
          ref="dropZone"
          class="mt-2"
          :formats="['.pdf', '.docx', '.xlsx', '.pptx', '.xlsm']"
          @uploaded="onUploaded"
          :multiple="false"
        />
        <div class="file-list mt-2 grid grid-cols-1 gap-4 p-4">
          <div v-for="(file, index) in files" :key="index" class="file-entry relative w-full h-full border border-gray-300 p-2 rounded-lg">
            <Flex center between class="w-full">
              <FlexCell grow>
                <div class="file-info flex items-center">
                  <Icon name="file-text" size="2xl" class="text-gray-600" />
                  <span class="ml-2">{{ file.name }}</span>
                </div>
              </FlexCell>
              <FlexCell center>
                <Button @click="removeFile(index)">
                  <Icon name="trash" />
                </Button>
              </FlexCell>
            </Flex>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
          <Button class="btn btn-primary" :disabled="files.length === 0" @click="submitFiles">{{ t('shared.button.submit') }}</Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>

<style scoped>
.file-list .file-entry:hover .overlay-info {
    display: block;
}

.file-list {
    display: grid;
    grid-gap: 4px;
    padding: 4px;
}

.file-entry {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>