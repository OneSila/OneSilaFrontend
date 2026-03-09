<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Modal } from "../../../../shared/components/atoms/modal";
import { Card } from "../../../../shared/components/atoms/card";
import { Button } from "../../../../shared/components/atoms/button";

const props = defineProps<{
  modelValue: boolean;
  documentUrl?: string | null;
  documentName?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const { t } = useI18n();
const previewBlobUrl = ref<string | null>(null);
const previewMimeType = ref<string | null>(null);
const previewError = ref(false);
const isLoading = ref(false);

const localVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const removeQueryAndHash = (value: string) => value.split('#')[0].split('?')[0];

const getExtension = (value?: string | null) => {
  if (!value) {
    return '';
  }
  const normalizedValue = removeQueryAndHash(value).toLowerCase();
  const lastDotIndex = normalizedValue.lastIndexOf('.');
  return lastDotIndex >= 0 ? normalizedValue.slice(lastDotIndex + 1) : '';
};

const resolvePreviewKind = (mimeType?: string | null, url?: string | null, name?: string | null) => {
  const normalizedMimeType = mimeType?.toLowerCase() || '';

  if (normalizedMimeType.startsWith('image/')) {
    return 'image';
  }

  if (normalizedMimeType.includes('pdf')) {
    return 'pdf';
  }

  if (normalizedMimeType.startsWith('text/html')) {
    return 'unsupported';
  }

  if (normalizedMimeType.startsWith('text/')) {
    return 'text';
  }

  const extension = getExtension(name) || getExtension(url);
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(extension)) {
    return 'image';
  }
  if (extension === 'pdf') {
    return 'pdf';
  }
  if (['txt', 'csv', 'json', 'xml'].includes(extension)) {
    return 'text';
  }

  return 'unsupported';
};

const previewKind = computed(() =>
  resolvePreviewKind(previewMimeType.value, props.documentUrl, props.documentName)
);

const canEmbedPreview = computed(() =>
  !!previewBlobUrl.value && ['image', 'pdf', 'text'].includes(previewKind.value)
);

const revokePreviewBlobUrl = () => {
  if (!previewBlobUrl.value) {
    return;
  }
  URL.revokeObjectURL(previewBlobUrl.value);
  previewBlobUrl.value = null;
};

const resetPreviewState = () => {
  isLoading.value = false;
  previewError.value = false;
  previewMimeType.value = null;
  revokePreviewBlobUrl();
};

const loadPreview = async () => {
  if (!props.modelValue || !props.documentUrl) {
    resetPreviewState();
    return;
  }

  resetPreviewState();
  isLoading.value = true;

  try {
    const response = await fetch(props.documentUrl, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Document preview request failed with status ${response.status}`);
    }

    const blob = await response.blob();
    previewMimeType.value = response.headers.get('content-type') || blob.type || null;

    if (!blob.size) {
      throw new Error('Document preview blob is empty');
    }

    previewBlobUrl.value = URL.createObjectURL(blob);
  } catch (error) {
    previewError.value = true;
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  resetPreviewState();
  emit('update:modelValue', false);
};

const openInNewTab = () => {
  if (!props.documentUrl) {
    return;
  }
  window.open(props.documentUrl, '_blank', 'noopener,noreferrer');
};

watch(
  () => [props.modelValue, props.documentUrl],
  () => {
    if (props.modelValue && props.documentUrl) {
      void loadPreview();
      return;
    }
    resetPreviewState();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  resetPreviewState();
});
</script>

<template>
  <Modal v-model="localVisible" @closed="closeModal">
    <Card class="modal-content w-[90vw] max-w-6xl">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-xl font-semibold leading-7 text-gray-900">
          {{ t('shared.labels.preview') }}<span v-if="documentName"> - {{ documentName }}</span>
        </h3>
        <Button :disabled="!documentUrl" class="btn btn-outline-dark" @click="openInNewTab">
          {{ t('media.documents.preview.openInNewTab') }}
        </Button>
      </div>
      <div class="h-[80vh]">
        <div v-if="isLoading" class="flex h-full items-center justify-center text-sm text-gray-600">
          {{ t('shared.labels.loading') }}
        </div>
        <div
          v-else-if="!canEmbedPreview || previewError"
          class="flex h-full flex-col items-center justify-center gap-4 rounded-md border border-dashed border-gray-300 px-6 text-center"
        >
          <p class="max-w-xl text-sm text-gray-600">
            {{ t('media.documents.preview.unavailable') }}
          </p>
          <Button :disabled="!documentUrl" class="btn btn-outline-primary" @click="openInNewTab">
            {{ t('media.documents.preview.openInNewTab') }}
          </Button>
        </div>
        <img
          v-else-if="previewKind === 'image' && previewBlobUrl"
          :src="previewBlobUrl"
          :alt="documentName || t('shared.labels.preview')"
          class="h-full w-full rounded-md border border-gray-300 object-contain"
        />
        <iframe
          v-else-if="previewBlobUrl"
          :src="previewBlobUrl"
          class="h-full w-full rounded-md border border-gray-300"
          frameborder="0"
        />
      </div>
    </Card>
  </Modal>
</template>
