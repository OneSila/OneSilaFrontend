<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../../apollo-client';
import { Selector } from '../../../../../../shared/components/atoms/selector';
import { Button } from '../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../shared/components/atoms/icon';
import { InfoModal } from '../../../../../../shared/components/molecules/info-modal';
import { Label } from '../../../../../../shared/components/atoms/label';
import { Toggle } from '../../../../../../shared/components/atoms/toggle';
import { Toast } from '../../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../../shared/utils';
import { translationLanguagesQuery } from '../../../../../../shared/api/queries/languages.js';
import { salesChannelContentTemplateQuery } from '../../../../../../shared/api/queries/salesChannelContentTemplates.js';
import {
  checkSalesChannelContentTemplateMutation,
  createSalesChannelContentTemplateMutation,
  deleteSalesChannelContentTemplateMutation,
  updateSalesChannelContentTemplateMutation,
} from '../../../../../../shared/api/mutations/salesChannelContentTemplates.js';
import ProductPickerModal from './containers/ProductPickerModal.vue';
import TemplateDocumentationContent from './containers/TemplateDocumentationContent.vue';

const props = defineProps<{ salesChannelId: string }>();

const { t } = useI18n();

const languages = ref<any[]>([]);
const selectedLanguage = ref<string | null>(null);
const previousLanguage = ref<string | null>(null);
const templateId = ref<string | null>(null);
const templateContent = ref('');
const initialTemplate = ref('');
const addAsIframe = ref(false);
const initialAddAsIframe = ref(false);
const isLoading = ref(false);
const isSaving = ref(false);
const isClearing = ref(false);
const isValidating = ref(false);
const showProductPicker = ref(false);
const previewResult = ref<any | null>(null);
const previewProduct = ref<
  { id: string; name: string; sku: string | null; thumbnailUrl: string | null } | null
>(null);
const lastValidatedTemplate = ref('');
const lastValidatedLanguage = ref<string | null>(null);

const languageOptions = computed(() =>
  languages.value.map((lang: any) => ({ id: lang.code, name: lang.name || lang.code })),
);

const hasUnsavedChanges = computed(
  () =>
    templateContent.value !== initialTemplate.value ||
    addAsIframe.value !== initialAddAsIframe.value,
);

const isPreviewStale = computed(
  () =>
    !!previewResult.value &&
    (templateContent.value !== lastValidatedTemplate.value ||
      selectedLanguage.value !== lastValidatedLanguage.value),
);

const fetchLanguages = async () => {
  try {
    const { data } = await apolloClient.query({
      query: translationLanguagesQuery,
      fetchPolicy: 'cache-first',
    });

    const available = data?.translationLanguages?.languages ?? [];
    languages.value = available;
    if (!selectedLanguage.value) {
      const defaultCode = data?.translationLanguages?.defaultLanguage?.code;
      const fallbackCode = available[0]?.code ?? null;
      selectedLanguage.value = defaultCode || fallbackCode || null;
      previousLanguage.value = selectedLanguage.value;
      if (selectedLanguage.value) {
        await fetchTemplate(selectedLanguage.value);
      }
    }
  } catch (error) {
    console.error('Failed to load languages', error);
    Toast.error(t('integrations.show.template.messages.languageLoadError'));
  }
};

const fetchTemplate = async (languageCode: string) => {
  if (!languageCode) return;
  isLoading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: salesChannelContentTemplateQuery,
      variables: {
        salesChannelId: props.salesChannelId,
        languageCode,
      },
      fetchPolicy: 'network-only',
    });

    const node = data?.salesChannelContentTemplates?.edges?.[0]?.node ?? null;
    templateId.value = node?.id ?? null;
    templateContent.value = node?.template ?? '';
    initialTemplate.value = templateContent.value;
    addAsIframe.value = node?.addAsIframe ?? false;
    initialAddAsIframe.value = addAsIframe.value;
    previewResult.value = null;
    previewProduct.value = null;
    lastValidatedTemplate.value = '';
    lastValidatedLanguage.value = null;
  } catch (error) {
    console.error('Failed to load template', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchLanguages);

watch(selectedLanguage, async (newLang, oldLang) => {
  if (!newLang) return;
  if (oldLang === null && previousLanguage.value === null) {
    previousLanguage.value = newLang;
    return;
  }
  if (newLang === previousLanguage.value) {
    return;
  }

  if (hasUnsavedChanges.value) {
    const confirmed = confirm(t('integrations.show.template.messages.confirmLanguageChange'));
    if (!confirmed) {
      selectedLanguage.value = previousLanguage.value;
      return;
    }
  }

  previousLanguage.value = newLang;
  await fetchTemplate(newLang);
});

const handleSave = async () => {
  if (!selectedLanguage.value) {
    Toast.error(t('integrations.show.template.messages.selectLanguage'));
    return;
  }

  isSaving.value = true;
  const isUpdate = !!templateId.value;

  try {
    const variables = isUpdate
      ? {
          data: {
            id: templateId.value,
            template: templateContent.value,
            addAsIframe: addAsIframe.value,
          },
        }
      : {
          data: {
            language: selectedLanguage.value,
            template: templateContent.value,
            addAsIframe: addAsIframe.value,
            salesChannel: { id: props.salesChannelId },
          },
        };

    const { data } = await apolloClient.mutate({
      mutation: isUpdate
        ? updateSalesChannelContentTemplateMutation
        : createSalesChannelContentTemplateMutation,
      variables,
    });

    const payload =
      data?.updateSalesChannelContentTemplate ??
      data?.createSalesChannelContentTemplate ??
      null;

    if (payload) {
      templateId.value = payload.id;
      initialTemplate.value = payload.template ?? '';
      templateContent.value = payload.template ?? '';
      initialAddAsIframe.value = payload.addAsIframe ?? false;
      addAsIframe.value = payload.addAsIframe ?? false;
      Toast.success(t('integrations.show.template.messages.saveSuccess'));
    } else {
      Toast.success(t('integrations.show.template.messages.saveSuccess'));
      initialTemplate.value = templateContent.value;
      initialAddAsIframe.value = addAsIframe.value;
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const message =
      validationErrors['__all__'] ||
      t('integrations.show.template.messages.saveError');
    Toast.error(message);
  } finally {
    isSaving.value = false;
  }
};

const handleClear = async () => {
  if (!templateContent.value && !templateId.value) return;
  const confirmed = confirm(t('integrations.show.template.messages.confirmClear'));
  if (!confirmed) return;

  if (!templateId.value) {
    templateContent.value = '';
    initialTemplate.value = '';
    addAsIframe.value = false;
    initialAddAsIframe.value = false;
    previewResult.value = null;
    previewProduct.value = null;
    lastValidatedTemplate.value = '';
    lastValidatedLanguage.value = null;
    Toast.success(t('integrations.show.template.messages.clearSuccess'));
    return;
  }

  isClearing.value = true;
  try {
    await apolloClient.mutate({
      mutation: deleteSalesChannelContentTemplateMutation,
      variables: { data: { id: templateId.value } },
    });
    templateId.value = null;
    templateContent.value = '';
    initialTemplate.value = '';
    addAsIframe.value = false;
    initialAddAsIframe.value = false;
    previewResult.value = null;
    previewProduct.value = null;
    lastValidatedTemplate.value = '';
    lastValidatedLanguage.value = null;
    Toast.success(t('integrations.show.template.messages.clearSuccess'));
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const message =
      validationErrors['__all__'] ||
      t('integrations.show.template.messages.clearError');
    Toast.error(message);
  } finally {
    isClearing.value = false;
  }
};

const openProductPicker = () => {
  if (!selectedLanguage.value) {
    Toast.error(t('integrations.show.template.messages.selectLanguage'));
    return;
  }
  showProductPicker.value = true;
};

const handleProductSelected = async (
  product: { id: string; name: string; sku: string | null; thumbnailUrl: string | null },
) => {
  showProductPicker.value = false;
  if (!selectedLanguage.value) return;

  isValidating.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: checkSalesChannelContentTemplateMutation,
      variables: {
        salesChannel: { id: props.salesChannelId },
        product: { id: product.id },
        language: selectedLanguage.value,
        template: templateContent.value,
      },
      fetchPolicy: 'no-cache',
    });

    previewResult.value = data?.checkSalesChannelContentTemplate ?? null;
    previewProduct.value = product;
    lastValidatedTemplate.value = templateContent.value;
    lastValidatedLanguage.value = selectedLanguage.value;

    if (previewResult.value?.isValid) {
      Toast.success(t('integrations.show.template.messages.validationSuccess'));
    } else if (previewResult.value) {
      Toast.error(t('integrations.show.template.messages.validationFailed'));
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const message =
      validationErrors['__all__'] ||
      t('integrations.show.template.messages.validationError');
    Toast.error(message);
  } finally {
    isValidating.value = false;
  }
};

const availableVariables = computed(() => previewResult.value?.availableVariables ?? []);
</script>

<template>
  <div class="space-y-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div class="flex items-center gap-2">
          <Icon name="language" class="text-gray-500" />
          <span class="text-sm font-medium text-gray-700">
            {{ t('integrations.show.template.labels.language') }}
          </span>
        </div>
        <Selector
          v-model="selectedLanguage"
          :options="languageOptions"
          :label-by="'name'"
          :value-by="'id'"
          :placeholder="t('integrations.show.template.languagePlaceholder')"
          :removable="false"
          class="w-56"
        />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <InfoModal
          :button-class="'inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 focus:outline-none'"
          :icon="'book-open'"
          :label="t('integrations.show.template.documentation.learn')"
        >
          <template #content>
            <TemplateDocumentationContent />
          </template>
        </InfoModal>
        <Button
          :customClass="'btn btn-secondary px-4'"
          :disabled="isValidating || isLoading"
          @click="openProductPicker"
        >
          {{ t('integrations.show.template.buttons.validate') }}
        </Button>
        <Button
          :customClass="'btn btn-danger px-4'"
          :disabled="isClearing || isLoading"
          @click="handleClear"
        >
          {{ t('integrations.show.template.buttons.clear') }}
        </Button>
        <Button
          :customClass="'btn btn-primary px-4'"
          :disabled="isSaving || isLoading"
          @click="handleSave"
        >
          {{ t('shared.button.save') }}
        </Button>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <Toggle v-model="addAsIframe" />
        <div class="space-y-1">
          <Label class="block text-sm font-semibold leading-6 text-gray-900">
            {{ t('integrations.show.template.labels.addAsIframe') }}
          </Label>
          <p class="text-xs text-gray-600">
            {{ t('integrations.show.template.helpTexts.addAsIframe') }}
          </p>
        </div>
      </div>
      <Label class="block text-sm font-semibold leading-6 text-gray-900">
        {{ t('integrations.show.template.labels.templateEditor') }}
      </Label>
      <textarea
        v-model="templateContent"
        class="h-96 w-full rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        :placeholder="t('integrations.show.template.placeholders.template')"
      ></textarea>
      <p v-if="hasUnsavedChanges" class="text-xs text-amber-600">
        {{ t('integrations.show.template.messages.unsavedChanges') }}
      </p>
    </div>

    <section class="space-y-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-1 items-start gap-3">
          <div
            v-if="previewProduct?.thumbnailUrl"
            class="h-12 w-12 overflow-hidden rounded border border-gray-200"
          >
            <img
              :alt="
                t('integrations.show.template.preview.thumbnailAlt', {
                  product: previewProduct?.name || t('integrations.show.template.productPicker.fallbackName'),
                })
              "
              :src="previewProduct.thumbnailUrl"
              class="h-full w-full object-cover"
            />
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ t('integrations.show.template.preview.title') }}
            </h3>
            <p v-if="previewProduct" class="text-sm text-gray-600">
              {{
                t('integrations.show.template.preview.subtitle', {
                  product: previewProduct?.name || t('integrations.show.template.productPicker.fallbackName'),
                  sku: previewProduct?.sku || t('integrations.show.template.preview.noSku'),
                })
              }}
            </p>
          </div>
        </div>
        <div v-if="isPreviewStale" class="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
          {{ t('integrations.show.template.preview.stale') }}
        </div>
      </div>

      <div v-if="!previewResult" class="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
        {{ t('integrations.show.template.preview.empty') }}
      </div>

      <div v-else class="space-y-6">
        <div v-if="previewResult.errors?.length" class="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 class="text-sm font-semibold text-red-700">
            {{ t('integrations.show.template.preview.errorsTitle') }}
          </h4>
          <ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
            <li v-for="error in previewResult.errors" :key="error.message">
              {{ error.message }}
            </li>
          </ul>
        </div>

        <div v-if="availableVariables.length" class="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 class="text-sm font-semibold text-gray-900">
            {{ t('integrations.show.template.preview.availableVariables') }}
          </h4>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="variable in availableVariables"
              :key="variable"
              class="rounded bg-white px-2 py-1 font-mono text-xs text-primary"
            >
              {{ variable }}
            </span>
          </div>
        </div>

        <div class="rounded-lg border border-gray-200 p-4">
          <h4 class="text-sm font-semibold text-gray-900">
            {{ t('integrations.show.template.preview.rendered') }}
          </h4>
          <div
            v-if="previewResult.renderedContent"
            class="prose prose-sm mt-3 max-w-none"
            v-html="previewResult.renderedContent"
          ></div>
          <p v-else class="mt-3 text-sm text-gray-600">
            {{ t('integrations.show.template.preview.noContent') }}
          </p>
        </div>
      </div>
    </section>
    <ProductPickerModal v-model="showProductPicker" @selected="handleProductSelected" />
  </div>
</template>
