<script setup lang="ts">
import { Icon } from "../../atoms/icon";
import { Button } from "../../atoms/button";
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { UploadNewFile } from "./containers/upload-new-image";
import {useI18n} from "vue-i18n";

const emit = defineEmits(['update:model-value']);
const { t } = useI18n();

const props = defineProps<{ modelValue?: File | null; formats?: string[] }>();
const file = ref(props.modelValue);
const uploadNewFileVisible = ref(false);
const objectUrl = ref<string | null>(null);

const normalizeExistingFile = (value: any) => {
  if (!value || value.notUpdated || value instanceof File) {
    return value;
  }

  return { ...value, notUpdated: true };
};

const fileName = computed(() => {
  if (!file.value) return t('media.documents.uploadDocument');
  return file.value.name.split(/(\\|\/)/g).pop();
});

const fileDownloadUrl = computed(() => {
  if (!file.value) {
    return null;
  }

  if (file.value instanceof File) {
    return objectUrl.value;
  }

  return (file.value as any).url || null;
});

const canDownload = computed(() => Boolean(fileDownloadUrl.value));

const updateObjectUrl = (currentFile: any) => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }

  if (currentFile instanceof File) {
    objectUrl.value = URL.createObjectURL(currentFile);
  }
};

const handleFileAdded = (addedFile) => {
  file.value = addedFile;
  updateObjectUrl(addedFile);
  emit('update:model-value', file.value);
}

const clearFile = () => {
  handleFileAdded(null)
};

const downloadFile = () => {
  if (!fileDownloadUrl.value) {
    return;
  }

  const link = document.createElement('a');
  link.href = fileDownloadUrl.value;
  link.download = fileName.value || 'download';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const openModal = () => {
  uploadNewFileVisible.value = true;
};

watch(
  () => props.modelValue,
  (nextValue) => {
    const normalizedValue = normalizeExistingFile(nextValue);
    file.value = normalizedValue;
    updateObjectUrl(normalizedValue);
    if (normalizedValue !== nextValue) {
      emit('update:model-value', normalizedValue);
    }
  },
);

if (file.value) {
  // we do that because strawberry django have a bug where if we use update mutation with initial data it will error so we need to exclude it
  const exitentFile = normalizeExistingFile(file.value);
  handleFileAdded(exitentFile)
}

onBeforeUnmount(() => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
  }
});

</script>

<template>
  <div>
    <div v-if="file === null" class="relative p-2 border border-gray-300 rounded-md bg-gray-100 cursor-pointer" @click="openModal">
      <Flex center between>
        <FlexCell grow>
          <div class="file-info flex items-center">
            <Icon name="plus" size="xl" class="text-gray-600" />
            <span class="ml-2 text-gray-600">{{ fileName }}</span>
          </div>
        </FlexCell>
      </Flex>
    </div>

    <div v-else class="relative p-2 border border-gray-300 rounded-md bg-gray-100">
      <Button @click="clearFile" class="absolute top-0 right-0 p-1">
        <Icon name="circle-xmark" class="text-gray-600" />
      </Button>

      <Flex center between>
        <FlexCell grow>
          <div class="file-info flex items-center">
            <Icon name="file-text" size="2xl" class="text-gray-600" />
            <span class="mx-2 text-gray-600">{{ fileName }}</span>

            <Button
              v-if="canDownload"
              type="button"
              :title="t('shared.button.download')"
              @click.stop="downloadFile"
            >
              <Icon name="download" class="mr-2" />
            </Button>

            <Button @click="openModal">
              <Icon name="arrows-rotate" class="mr-4" />
            </Button>
          </div>
        </FlexCell>
      </Flex>
    </div>

    <UploadNewFile v-model="uploadNewFileVisible" :formats="props.formats" @entry-created="handleFileAdded" />
  </div>
</template>

<style scoped>

.file-info {
  padding: 10px;
}

</style>
