<script setup lang="ts">
import { nextTick, computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { slugify } from '../../../utils';

import { Card } from '../../atoms/card';
import { Button } from '../../atoms/button';
import { Image } from '../../atoms/image';
import { Icon } from '../../atoms/icon';
import { Link } from '../../atoms/link';

import { DropZone } from '../drop-zone';
import { SecondaryButton } from '../secondary-button';

import { UploadedFile } from './UploadedFile';

const props = defineProps<{ files: any[]; selectedItemIndex?: number; formats?: string[] }>();

const emit = defineEmits<{
  (e: 'selected', file: UploadedFile, index: number): void;
  (e: 'file-upload-clicked', file: any, index: number): void;
  (e: 'changed', files: UploadedFile[]): void;
}>();

const { t } = useI18n();

const activeFileIndex = ref(-1);
const isAddingFiles = ref(false);

const activeFile = computed(() => props.files[activeFileIndex.value]);

const possibleExtensions = ['png', 'jpg', 'jpeg', 'xlsx'];

const removeExtensionFromFilename = (name: string) =>
  possibleExtensions.reduce((filename: string, extension) => {
    return filename.replace(`.${extension}`, '').replace(`,${extension}`, '');
  }, name);

const getExtensionFromMIME = (type: string) => {
  return type.replace('image/', '');
};

const sanitizeFilename = (type: string, name: string, fallbackName = 'unnamed') => {
  const extension = getExtensionFromMIME(type);

  const filenameWithoutExtension = removeExtensionFromFilename(name) || fallbackName;

  return `${filenameWithoutExtension}.${extension}`;
};

const generateFallbackName = (file: UploadedFile, altText = file.altText) => {
  return altText ? slugify(altText) : removeExtensionFromFilename(file.originalFile.name);
};

const onUploaded = async (uploadFiles: File[]) => {
  const newFiles: UploadedFile[] = [];

  isAddingFiles.value = true;

  for (const file of uploadFiles) {
    await new Promise<void>((resolve) => {
      const uploadedFile: UploadedFile = {
        altText: '',
        name: file.name,
        originalFile: file,
        aspectRatio: 1366 / 768,
        file,
        shouldCrop: true,
        preview: undefined,
        cropperFile: undefined,
        uploaded: false,
        uploading: false,
        uploadProgress: 0,
        uploadErrored: false,
        url: '',
      };

      const fileReader = new FileReader();

      fileReader.addEventListener('load', () => {
        uploadedFile.preview = fileReader.result;
        uploadedFile.cropperFile = fileReader.result;

        rename(uploadedFile);
        newFiles.push(uploadedFile);
        resolve();
      });

      fileReader.readAsDataURL(uploadedFile.file);
    });
  }

  isAddingFiles.value = false;

  if (activeFileIndex.value === -1) {
    activeFileIndex.value = 0;
  }

  emit('changed', props.files.concat(newFiles));

  nextTick(() => {
    emit('selected', activeFile.value, activeFileIndex.value);
  });
};

const duplicate = (fileForDuplication: UploadedFile, image: Blob) => {
  if (!image) {
    return;
  }

  const extension = getExtensionFromMIME(image.type);

  const filenameWithoutExtension = removeExtensionFromFilename(fileForDuplication.file.name);

  const filename = `${filenameWithoutExtension}_copy.${extension}`;

  const file = new File([fileForDuplication.file], filename, {
    type: fileForDuplication.file.type,
  });

  onUploaded([file]);

  nextTick(() => {
    onItemClicked(props.files.length);
  });
};

const rename = (fileForRenaming: UploadedFile, newName = fileForRenaming.name) => {
  const fallbackName = generateFallbackName(fileForRenaming);

  const sanitizedNewName = sanitizeFilename(fileForRenaming.file.type, newName, fallbackName);

  fileForRenaming.name = sanitizedNewName;

  fileForRenaming.file = new File([fileForRenaming.file], sanitizedNewName, {
    type: fileForRenaming.file.type,
    lastModified: fileForRenaming.file.lastModified,
  });
};

const reset = async (image: UploadedFile) => {
  return new Promise<void>((resolve) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      image.preview = fileReader.result;
      image.cropperFile = fileReader.result;
      image.file = image.originalFile;

      rename(image, image.file.name);

      resolve();
    });

    fileReader.readAsDataURL(image.originalFile);
  });
};

const replace = async (
  fileForReplacement: UploadedFile,
  image: Blob,
  newName = fileForReplacement.name,
  altText = fileForReplacement.altText,
) => {
  if (!image) {
    return;
  }

  fileForReplacement.altText = altText;

  const fallbackName = generateFallbackName(fileForReplacement, altText);

  const filename = sanitizeFilename(image.type, newName, fallbackName);

  fileForReplacement.name = filename;

  fileForReplacement.file = new File([image], filename, {
    type: image.type,
  });

  return new Promise<UploadedFile>((resolve) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('load', () => {
      // if (fileReader.result === lastCroppedImage.value) {
      //   return
      // }

      // lastCroppedImage.value = fileReader.result
      fileForReplacement.preview = fileReader.result;
      fileForReplacement.cropperFile = fileReader.result;

      resolve(fileForReplacement);
    });

    fileReader.readAsDataURL(fileForReplacement.file);
  });
};

const upload = async (
  item: UploadedFile,
  executeMutation: () => Promise<any>,
  fetching: Ref<boolean>,
) => {
  if (fetching.value) {
    return;
  }

  return new Promise<any>(async (resolve, reject) => {
    let submitting = true;

    item.uploading = true;
    item.uploadErrored = false;
    item.uploadProgress = 1;

    const loadBar = () => {
      if (item.uploadProgress >= 100) {
        item.uploaded = true;
        item.uploading = false;
        clearInterval(interval);
        return resolve(data);
      }

      item.uploadProgress += 5;

      if (item.uploadProgress > 100) {
        if (submitting) {
          item.uploadProgress = 96;
        } else {
          item.uploadProgress = 100;
        }
      }
    };

    const interval = setInterval(loadBar, 100);

    submitting = true;

    const data = await executeMutation();

    submitting = false;

    if (!data) {
      item.uploadErrored = true;
      item.uploaded = false;
      item.uploading = false;
      clearInterval(interval);
      return reject();
    }
  });
};

const onRemoveClicked = (index: number) => {
  const remainingFiles = [...props.files];

  remainingFiles.splice(index, 1);

  emit('changed', remainingFiles);

  if (index === activeFileIndex.value) {
    activeFileIndex.value = -1;
  }

  if (index < activeFileIndex.value) {
    activeFileIndex.value -= 1;
  }
};

const onItemClicked = (index: number) => {
  activeFileIndex.value = index;

  emit('selected', activeFile.value, index);
};

defineExpose({
  duplicate,
  rename,
  reset,
  replace,
  upload,
});
</script>

<template>
  <Flex class="upload-manager" gap="4" vertical>
    <FlexCell>
      <Card>
        <DropZone :formats="formats" multiple @uploaded="onUploaded" />
      </Card>
    </FlexCell>

    <FlexCell v-if="isAddingFiles && !files.length">
      <Card class="text-center">
        <Icon name="circle-notch" size="4x" spin />
      </Card>
    </FlexCell>

    <FlexCell v-if="files.length">
      <Card>
        <Flex gap="2" wrap>
          <FlexCell v-for="(item, index) in files" :key="index" class="max-w-56 min-w-44 mb-2">
            <div class="relative">
              <Button @click="onItemClicked(index)">
                <Image
                  class="border-2 border-gray-500"
                  :class="{ 'border-4 border-green-500': activeFileIndex === index }"
                  :source="item.preview"
                />
              </Button>

              <Button v-if="!item.uploaded" class="absolute -top-2 -right-2 rounded-full bg-white" style="padding-left: 2px; padding-right: 2px;" @click="onRemoveClicked(index)">
                <Icon class="text-red-500" name="circle-xmark" />
              </Button>

              <Button
                v-if="item.uploadErrored"
                class="absolute top-0 left-0 border-t-2 border-l-2 border-green-500 bg-white hover:bg-gray-100 px-2 py-2"
                title="Upload error. Please try again by clicking here."
                @click="$emit('file-upload-clicked', item, index)"
              >
                <Icon class="text-red-500" name="exclamation-triangle" />
              </Button>
            </div>

            <SecondaryButton class="w-full" v-if="!item.uploaded && !item.uploading && !item.uploadErrored" @click="$emit('file-upload-clicked', item, index)">
              <Flex gap="2" wrap center>
                <FlexCell>
                  <Icon name="cloud-arrow-up" />
                </FlexCell>

                <FlexCell>{{ t('shared.labels.upload') }}</FlexCell>
              </Flex>
            </SecondaryButton>

            <Link v-else-if="item.uploaded" :path="item.url" external>
              <SecondaryButton class="w-full">
                <Flex gap="2" wrap center>
                  <FlexCell>
                    <Icon name="image" />
                  </FlexCell>

                  <FlexCell>{{ t('shared.labels.viewImage') }}</FlexCell>
                </Flex>
              </SecondaryButton>
            </Link>

            <div class="bg-green-500 transition-all" v-if="item.uploading" :style="{ width: `${item.uploadProgress}%`, height: '5px' }"></div>
          </FlexCell>

          <FlexCell v-if="isAddingFiles" center>
            <Icon name="circle-notch" size="4x" spin />
          </FlexCell>
        </Flex>
      </Card>
    </FlexCell>
  </Flex>
</template>
