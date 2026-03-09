<script setup lang="ts">
import { computed, onBeforeUnmount, Ref, ref, watch, withDefaults } from 'vue';
import { Modal } from '../../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../../shared/components/atoms/card';
import { Icon } from '../../../../../../shared/components/atoms/icon';
import { Toggle } from "../../../../../../shared/components/atoms/toggle";
import { Selector } from '../../../../../../shared/components/atoms/selector';
import { TextInput } from '../../../../../../shared/components/atoms/input-text';
import { Image } from "../../../../../../shared/components/atoms/image";
import { DropZone } from "../../../../../../shared/components/molecules/drop-zone";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../shared/components/atoms/button";
import apolloClient from "../../../../../../../apollo-client";
import { createFilesMutation, createMediaProductThroughMutation } from "../../../../../../shared/api/mutations/media.js";
import { documentTypesQuerySelector } from "../../../../../../shared/api/queries/documentTypes.js";
import { companyLanguagesQuery } from "../../../../../../shared/api/queries/languages.js";
import { injectAuth } from "../../../../../../shared/modules/auth";
import { Toast } from "../../../../../../shared/modules/toast";
import { processGraphQLErrors } from "../../../../../../shared/utils";

const props = withDefaults(
  defineProps<{ modelValue: boolean; productId?: string; salesChannelId?: string; singleUpload?: boolean }>(),
  {
    singleUpload: false,
  }
);
const emit = defineEmits(['update:modelValue', 'entries-created']);
const localShowModal = ref(props.modelValue);
const { t } = useI18n();
const auth = injectAuth();

type DocumentEntry = {
  file: File;
  title: string;
  documentType: string | null;
  documentLanguage: string | null;
  isDocumentImage: boolean;
  previewUrl: string | null;
};

const documents: Ref<DocumentEntry[]> = ref([]);
const dropZone: Ref<any> = ref(null);
const isSubmitting = ref(false);
const documentTypeOptions = ref<{ label: string; value: string; code?: string }[]>([]);
const documentLanguageOptions = ref<{ label: string; value: string }[]>([]);
const defaultDocumentTypeId = ref<string | null>(null);
const defaultDocumentLanguage = ref<string | null>(null);

const stripExtension = (value: string) => value.replace(/\.[^/.]+$/, '');
const IMAGE_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tif', 'tiff'];
const DOCUMENT_UPLOAD_FORMATS = ['.pdf', '.xlsx', '.xls', '.docx', '.doc', '.xlsm', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tif', '.tiff'];

const getDefaultTitleFromFile = (file: File) => {
  const stripped = stripExtension(file.name || '');
  return stripped || file.name || '';
};

const isImageFile = (file: File) => {
  if (file.type?.startsWith('image/')) {
    return true;
  }
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  return IMAGE_FILE_EXTENSIONS.includes(extension);
};

const canSubmit = computed(() =>
  documents.value.length > 0 &&
  documents.value.every((document) =>
    Boolean(document.title?.trim()) &&
    Boolean(document.documentType) &&
    Boolean(document.documentLanguage)
  )
);

const singleUpload = computed(() => props.singleUpload ?? false);

const applyDefaultsToPendingDocuments = () => {
  documents.value = documents.value.map((document) => ({
    ...document,
    documentType: document.documentType || defaultDocumentTypeId.value,
    documentLanguage: document.documentLanguage || defaultDocumentLanguage.value,
  }));
};

const loadDefaults = async () => {
  try {
    const [{ data: documentTypesData }, { data: languagesData }] = await Promise.all([
      apolloClient.query({
        query: documentTypesQuerySelector,
        variables: { first: 100 },
        fetchPolicy: 'cache-first',
      }),
      apolloClient.query({
        query: companyLanguagesQuery,
        fetchPolicy: 'cache-first',
      }),
    ]);

    const resolvedDocumentTypes =
      documentTypesData?.documentTypes?.edges?.map((edge: any) => ({
        label: edge.node.name,
        value: edge.node.id,
        code: edge.node.code,
      })) || [];
    documentTypeOptions.value = resolvedDocumentTypes;

    const internalType = resolvedDocumentTypes.find((option) => option.code === 'INTERNAL');
    defaultDocumentTypeId.value = internalType?.value || resolvedDocumentTypes[0]?.value || null;

    const resolvedLanguages =
      languagesData?.companyLanguages?.map((language: any) => ({
        label: language.name,
        value: language.code,
      })) || [];
    documentLanguageOptions.value = resolvedLanguages;

    const companyLanguageCode = auth.user.company?.language || auth.user.language || null;
    defaultDocumentLanguage.value =
      resolvedLanguages.find((language) => language.value === companyLanguageCode)?.value ||
      resolvedLanguages[0]?.value ||
      null;

    applyDefaultsToPendingDocuments();
  } catch (error) {
    documentTypeOptions.value = [];
    documentLanguageOptions.value = [];
    defaultDocumentTypeId.value = null;
    defaultDocumentLanguage.value = null;
  }
};

watch(() => props.modelValue, async (newVal) => {
  localShowModal.value = newVal;
  if (newVal) {
    await loadDefaults();
  }
});

watch(defaultDocumentTypeId, applyDefaultsToPendingDocuments);
watch(defaultDocumentLanguage, applyDefaultsToPendingDocuments);

const closeModal = () => {
  documents.value.forEach((document) => {
    if (document.previewUrl) {
      URL.revokeObjectURL(document.previewUrl);
    }
  });
  localShowModal.value = false;
  documents.value = [];
  emit('update:modelValue', false);
};

const onUploaded = (files: File[]) => {
  if (!files.length) {
    return;
  }

  if (singleUpload.value) {
    documents.value.forEach((document) => {
      if (document.previewUrl) {
        URL.revokeObjectURL(document.previewUrl);
      }
    });
    documents.value = [];
  }

  files.forEach((file) => {
    const detectedAsImage = isImageFile(file);
    documents.value.push({
      file,
      title: getDefaultTitleFromFile(file),
      documentType: defaultDocumentTypeId.value,
      documentLanguage: defaultDocumentLanguage.value,
      isDocumentImage: detectedAsImage,
      previewUrl: detectedAsImage ? URL.createObjectURL(file) : null,
    });
  });
  dropZone.value?.clear();
};

const removeDocument = (index: number) => {
  const previewUrl = documents.value[index]?.previewUrl;
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  documents.value.splice(index, 1);
};

const submitDocuments = async () => {
  if (!canSubmit.value || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;
  try {
    const variables = documents.value.map((document) => {
      const basePayload = {
        title: document.title.trim() || null,
        documentType: document.documentType ? { id: document.documentType } : null,
        documentLanguage: document.documentLanguage || null,
        isDocumentImage: document.isDocumentImage,
      };

      if (document.isDocumentImage) {
        return {
          ...basePayload,
          image: document.file,
          file: null,
        };
      }

      return {
        ...basePayload,
        file: document.file,
        image: null,
      };
    });

    const { data } = await apolloClient.mutate({
      mutation: createFilesMutation,
      variables: { data: variables }
    });

    if (!data?.createFiles) {
      return;
    }

    if (props.productId) {
      for (const file of data.createFiles) {
        const relationVariables: any = {
          product: { id: props.productId },
          media: { id: file.id },
        };
        if (props.salesChannelId) {
          relationVariables.salesChannel = { id: props.salesChannelId };
        }
        try {
          await apolloClient.mutate({
            mutation: createMediaProductThroughMutation,
            variables: { data: relationVariables }
          });
        } catch (error) {
          const validationErrors = processGraphQLErrors(error, t);
          if (validationErrors['__all__']) {
            Toast.error(validationErrors['__all__']);
          }
          console.error('Failed to link file and product:', error);
        }
      }
    }

    emit('entries-created', data.createFiles);
    Toast.success(t('media.documents.create.successfullyCreated'));
    closeModal();
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    for (const key in validationErrors) {
      if (Object.prototype.hasOwnProperty.call(validationErrors, key)) {
        Toast.error(validationErrors[key]);
      }
    }
  } finally {
    isSubmitting.value = false;
  }
};

onBeforeUnmount(() => {
  documents.value.forEach((document) => {
    if (document.previewUrl) {
      URL.revokeObjectURL(document.previewUrl);
    }
  });
});
</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-[90vw] max-w-6xl">
        <div class="mb-4">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">{{ t('media.documents.upload') }}</h3>
        </div>
        <DropZone
          ref="dropZone"
          class="mt-2"
          :formats="DOCUMENT_UPLOAD_FORMATS"
          :multiple="!singleUpload"
          @uploaded="onUploaded"
        />
        <div class="gallery mt-2 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
          <div v-for="(document, index) in documents" :key="index" class="file-entry relative w-full h-full border border-gray-300 p-2 rounded-lg">
            <Flex vertical class="w-full">
              <FlexCell>
                <div class="flex justify-center items-center h-48">
                  <Image
                    v-if="document.previewUrl"
                    :source="document.previewUrl"
                    :alt="t('media.media.labels.fileThumbnail')"
                    class="h-full w-full rounded-md object-contain"
                  />
                  <Icon v-else :name="'file-text'" size="2xl" class="text-gray-600"/>
                </div>
              </FlexCell>
              <FlexCell class="mt-2">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.title') }}</label>
                <TextInput
                  v-model="document.title"
                  class="w-full"
                  :placeholder="t('media.documents.placeholders.title')"
                />
              </FlexCell>
              <FlexCell class="mt-2">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.filters.documentType') }}</label>
                <Selector
                  v-model="document.documentType"
                  class="w-full"
                  :options="documentTypeOptions"
                  label-by="label"
                  value-by="value"
                  :placeholder="t('media.documents.placeholders.documentType')"
                  :filterable="true"
                  :removable="false"
                />
              </FlexCell>
              <FlexCell class="mt-2">
                <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.language') }}</label>
                <Selector
                  v-model="document.documentLanguage"
                  class="w-full"
                  :options="documentLanguageOptions"
                  label-by="label"
                  value-by="value"
                  :placeholder="t('media.documents.placeholders.documentLanguage')"
                  :filterable="true"
                  :removable="false"
                />
              </FlexCell>
              <FlexCell class="mt-3">
                <div class="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                  <label class="font-semibold text-sm leading-6 text-gray-900">{{ t('media.documents.labels.isImage') }}</label>
                  <div class="pointer-events-none opacity-60">
                    <Toggle v-model="document.isDocumentImage" :disabled="true" />
                  </div>
                </div>
              </FlexCell>
              <FlexCell>
                <Flex between class="mt-2">
                  <FlexCell grow class="min-w-0 pr-2">
                    <div class="block max-w-full truncate text-xs text-gray-500" :title="document.file.name">
                      {{ document.file.name }}
                    </div>
                  </FlexCell>
                  <FlexCell center>
                    <Button class="btn btn-outline-danger" @click="removeDocument(index)">
                      <Icon name="trash" />
                    </Button>
                  </FlexCell>
                </Flex>
              </FlexCell>
            </Flex>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
          <Button class="btn btn-primary" :disabled="!canSubmit || isSubmitting" :loading="isSubmitting" @click="submitDocuments">
            {{ t('shared.button.submit') }}
          </Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>

<style scoped>
.gallery .file-entry:hover .overlay-info {
    display: block;
}

.gallery {
    display: grid;
    grid-gap: 4px;
    padding: 4px;
}

.file-entry {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
