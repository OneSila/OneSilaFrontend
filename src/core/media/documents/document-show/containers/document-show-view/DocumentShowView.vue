<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { Button } from "../../../../../../shared/components/atoms/button";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../../shared/components/atoms/image";
import { Link } from "../../../../../../shared/components/atoms/link";
import { humanFileSize, truncateText } from "../../../../files/media";
import { Toast } from "../../../../../../shared/modules/toast";
import PreviewDocument from "../../../../files/containers/PreviewDocument.vue";

const { t } = useI18n();

const props = defineProps<{
  document: {
    fileUrl: string;
    imageWebUrl?: string | null;
    isDocumentImage?: boolean | null;
    documentImageThumbnailUrl?: string | null;
    title?: string | null;
    description?: string | null;
    documentLanguage?: string | null;
    documentType?: { id: string; name: string; code?: string | null } | null;
    file?: { size?: number | string | null; name?: string | null } | null;
  }
}>();

const copyUrlToClipboard = async (value?: string | null) => {
  if (!value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(value);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const previewModalVisible = ref(false);
const previewDocumentUrl = ref<string | null>(null);
const previewDocumentName = ref<string>('');

const openPreview = () => {
  if (!props.document.fileUrl) {
    return;
  }
  previewDocumentUrl.value = props.document.fileUrl;
  previewDocumentName.value = props.document.file?.name || '';
  previewModalVisible.value = true;
};

const downloadDocument = () => {
  if (!props.document.fileUrl) {
    return;
  }
  const link = window.document.createElement('a');
  link.href = props.document.fileUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (props.document.file?.name) {
    link.download = props.document.file.name;
  }
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
};

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <div class="flex h-72 w-full max-w-[35rem] items-center justify-center rounded-md border border-gray-300 bg-gray-100">
        <Image
          v-if="document.documentImageThumbnailUrl"
          :source="document.documentImageThumbnailUrl"
          :alt="t('media.media.labels.fileThumbnail')"
          class="h-full w-full rounded-md object-contain"
        />
        <Icon v-else name="file-text" size="4xl" class="text-gray-500" />
      </div>
      <div class="mt-4 flex items-center gap-2">
        <Button class="btn btn-outline-primary" :disabled="!document.fileUrl" @click="openPreview">
          <Icon name="arrows-up-down-left-right" class="mr-2 h-4 w-4" />
          {{ t('shared.labels.preview') }}
        </Button>
        <Button class="btn btn-outline-dark" :disabled="!document.fileUrl" @click="downloadDocument">
          <Icon name="download" class="mr-2 h-4 w-4" />
          {{ t('shared.button.download') }}
        </Button>
      </div>
    </div>

    <Flex vertical>
      <FlexCell>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.name') }}</label>
        <span class="text-gray-900">{{ document.file?.name || '—' }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.media.labels.fileSize') }}</label>
        <span class="text-gray-900">{{ document.file?.size ? humanFileSize(document.file.size) : '—' }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.fileUrl') }}</label>
        <div class="flex items-center gap-2">
          <Link v-if="document.fileUrl" :path="document.fileUrl" external selectable class="min-w-0 flex-grow">
            <span class="block max-w-full truncate text-gray-900">{{ truncateText(document.fileUrl, 70) }}</span>
          </Link>
          <span v-else class="text-gray-900">—</span>
          <Button :disabled="!document.fileUrl" @click="copyUrlToClipboard(document.fileUrl)">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </div>
      </FlexCell>
      <FlexCell v-if="document.isDocumentImage">
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.images.labels.imageUrl') }}</label>
        <div class="flex items-center gap-2">
          <Link v-if="document.imageWebUrl" :path="document.imageWebUrl" external selectable class="min-w-0 flex-grow">
            <span class="block max-w-full truncate text-gray-900">{{ truncateText(document.imageWebUrl, 70) }}</span>
          </Link>
          <span v-else class="text-gray-900">—</span>
          <Button :disabled="!document.imageWebUrl" @click="copyUrlToClipboard(document.imageWebUrl)">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </div>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.title') }}</label>
        <span class="text-gray-900">{{ document.title || '—' }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.description') }}</label>
        <p class="text-gray-900 whitespace-pre-line">{{ document.description || '—' }}</p>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.filters.documentType') }}</label>
        <span class="text-gray-900">{{ document.documentType?.name || '—' }}</span>
      </FlexCell>
      <FlexCell>
        <label class="mt-2 font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.language') }}</label>
        <span class="text-gray-900">{{ document.documentLanguage || '—' }}</span>
      </FlexCell>
    </Flex>
  </div>
  <PreviewDocument
    v-model="previewModalVisible"
    :document-url="previewDocumentUrl"
    :document-name="previewDocumentName"
  />
</template>
