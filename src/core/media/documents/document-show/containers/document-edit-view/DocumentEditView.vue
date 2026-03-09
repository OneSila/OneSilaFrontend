<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Icon } from "../../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../../shared/components/atoms/image";
import { Button } from "../../../../../../shared/components/atoms/button";
import { TextInput } from "../../../../../../shared/components/atoms/input-text";
import { TextEditor } from "../../../../../../shared/components/atoms/input-text-editor";
import { Selector } from "../../../../../../shared/components/atoms/selector";
import { PrimaryButton } from "../../../../../../shared/components/atoms/button-primary";
import { updateFileMutation } from "../../../../../../shared/api/mutations/media.js";
import { documentTypesQuerySelector } from "../../../../../../shared/api/queries/documentTypes.js";
import { companyLanguagesQuery } from "../../../../../../shared/api/queries/languages.js";
import { Toast } from "../../../../../../shared/modules/toast";
import apolloClient from "../../../../../../../apollo-client";

const { t } = useI18n();
const props = defineProps<{
  document: {
    id: string;
    fileUrl: string;
    documentImageThumbnailUrl?: string | null;
    title?: string | null;
    description?: string | null;
    documentLanguage?: string | null;
    documentType?: { id: string; name: string; code?: string | null } | null;
    file?: { size?: number | string | null; name?: string | null; url?: string | null } | null;
  }
}>();
const emit = defineEmits(['show-view']);

const localTitle = ref(props.document.title ?? '');
const localDescription = ref(props.document.description ?? '');
const localDocumentType = ref<string | null>(props.document.documentType?.id || null);
const localDocumentLanguage = ref<string | null>(props.document.documentLanguage || null);
const documentTypeOptions = ref<{ label: string; value: string }[]>([]);
const documentLanguageOptions = ref<{ label: string; value: string }[]>([]);
const isSaving = ref(false);

const copyUrlToClipboard = async () => {
  if (!props.document.fileUrl) {
    return;
  }
  try {
    await navigator.clipboard.writeText(props.document.fileUrl);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};

const loadSelectorOptions = async () => {
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

    documentTypeOptions.value =
      documentTypesData?.documentTypes?.edges?.map((edge: any) => ({
        label: edge.node.name,
        value: edge.node.id,
      })) || [];

    documentLanguageOptions.value =
      languagesData?.companyLanguages?.map((language: any) => ({
        label: language.name,
        value: language.code,
      })) || [];
  } catch (error) {
    documentTypeOptions.value = [];
    documentLanguageOptions.value = [];
  }
};

const saveChanges = async () => {
  if (isSaving.value) {
    return;
  }
  isSaving.value = true;
  try {
    const variables = {
      data: {
        id: props.document.id,
        title: localTitle.value.trim() || null,
        description: localDescription.value.trim() || null,
        documentType: localDocumentType.value ? { id: localDocumentType.value } : null,
        documentLanguage: localDocumentLanguage.value || null,
      }
    };
    const { data } = await apolloClient.mutate({
      mutation: updateFileMutation,
      variables
    });
    if (data?.updateFile) {
      Toast.success(t('media.documents.show.successfullyUpdated'));
      emit('show-view');
    }
  } catch (error) {
    Toast.error(t('media.documents.show.updateFailed'));
  } finally {
    isSaving.value = false;
  }
};

watch(() => props.document, (newDocument) => {
  localTitle.value = newDocument.title ?? '';
  localDescription.value = newDocument.description ?? '';
  localDocumentType.value = newDocument.documentType?.id || null;
  localDocumentLanguage.value = newDocument.documentLanguage || null;
});

onMounted(() => {
  loadSelectorOptions();
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="border border-gray-300 rounded-md p-6">
      <div class="flex justify-center items-center h-56 bg-gray-100 rounded-md">
        <Image
          v-if="document.documentImageThumbnailUrl"
          :source="document.documentImageThumbnailUrl"
          :alt="t('media.media.labels.fileThumbnail')"
          class="h-full w-full rounded-md object-contain"
        />
        <Icon v-else name="file-text" size="4xl" class="text-gray-500" />
      </div>
      <div class="mt-4">
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.fileUrl') }}</label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-900 truncate">{{ document.fileUrl || '—' }}</span>
          <Button @click="copyUrlToClipboard">
            <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.title') }}</label>
        <TextInput class="mt-1 w-full" v-model="localTitle" :placeholder="t('media.documents.placeholders.title')" />
      </div>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.labels.description') }}</label>
        <TextEditor v-model="localDescription" class="h-32" :placeholder="t('media.documents.placeholders.description')" />
      </div>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('media.documents.filters.documentType') }}</label>
        <Selector
          v-model="localDocumentType"
          :options="documentTypeOptions"
          label-by="label"
          value-by="value"
          :filterable="true"
          :removable="false"
          :placeholder="t('media.documents.placeholders.documentType')"
        />
      </div>
      <div>
        <label class="font-semibold block text-sm leading-6 text-gray-900">{{ t('shared.labels.language') }}</label>
        <Selector
          v-model="localDocumentLanguage"
          :options="documentLanguageOptions"
          label-by="label"
          value-by="value"
          :filterable="true"
          :removable="false"
          :placeholder="t('media.documents.placeholders.documentLanguage')"
        />
      </div>
      <div class="flex justify-end">
        <PrimaryButton :disabled="isSaving" @click="saveChanges">{{ t('shared.button.save') }}</PrimaryButton>
      </div>
    </div>
  </div>
</template>
