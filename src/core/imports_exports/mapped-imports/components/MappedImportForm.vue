<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../shared/components/atoms/input-text';
import { Toggle } from '../../../../shared/components/atoms/toggle';
import { PrimaryButton } from '../../../../shared/components/atoms/button-primary';
import { SecondaryButton } from '../../../../shared/components/atoms/button-secondary';
import { Selector } from '../../../../shared/components/atoms/selector';
import { Card } from '../../../../shared/components/atoms/card';
import { Button } from '../../../../shared/components/atoms/button';
import FileUploader from '../../../../shared/components/organisms/file-uploader/FileUploader.vue';
import FormFieldShell from '../../components/FormFieldShell.vue';
import MappedImportTutorialPanel from './MappedImportTutorialPanel.vue';
import { getLanguageOptions, getMappedImportTypeOptions } from '../../configs';

type SourceMode = 'jsonFile' | 'tabularFile' | 'url';
type SubmitAction = 'save' | 'continue';
type UploadedJsonFile = File | { name?: string; url?: string; notUpdated?: boolean } | null;

type MappedImportFormValue = {
  name: string;
  type: string;
  language: string | null;
  createOnly: boolean;
  updateOnly: boolean;
  overrideOnly: boolean;
  skipBrokenRecords: boolean;
  isPeriodic: boolean;
  intervalHours: number | null;
  jsonUrl: string;
  jsonFile: UploadedJsonFile;
};

const props = withDefaults(defineProps<{
  mode: 'create' | 'edit';
  initialValue?: Partial<MappedImportFormValue> | null;
  languageOptions: Array<{ code: string; name?: string; nameLocal?: string; nameTranslated?: string }>;
  submitting?: boolean;
}>(), {
  initialValue: null,
  submitting: false,
});

const emit = defineEmits<{
  (e: 'submit', value: MappedImportFormValue & { sourceMode: SourceMode; action: SubmitAction }): void;
  (e: 'cancel'): void;
  (e: 'details'): void;
}>();

const { t } = useI18n();
const typeOptions = computed(() => getMappedImportTypeOptions(t));
const languageSelectorOptions = computed(() => getLanguageOptions(props.languageOptions, true, t('importsExports.shared.none')));
const jsonFileFormats = ['.json'];
const tabularFileFormats = ['.csv', '.xlsx', '.xlsm'];

const defaultFormState = (): MappedImportFormValue => ({
  name: '',
  type: 'product',
  language: null,
  createOnly: false,
  updateOnly: false,
  overrideOnly: false,
  skipBrokenRecords: true,
  isPeriodic: false,
  intervalHours: null,
  jsonUrl: '',
  jsonFile: null,
});

const form = reactive<MappedImportFormValue>(defaultFormState());
const sourceMode = ref<SourceMode>('jsonFile');
const fieldErrors = reactive<Record<string, string | null>>({
  type: null,
  source: null,
  jsonUrl: null,
  intervalHours: null,
});

const selectedType = computed(() => form.type || null);
const isEdit = computed(() => props.mode === 'edit');
const isProductImport = computed(() => form.type === 'product');
const acceptedFileFormats = computed(() => sourceMode.value === 'tabularFile' ? tabularFileFormats : jsonFileFormats);
const fileUploaderKey = computed(() => `${sourceMode.value}:${acceptedFileFormats.value.join('|')}`);
const fileSourceLabel = computed(() => sourceMode.value === 'tabularFile' ? t('importsExports.fields.tabularFile') : t('importsExports.fields.jsonFile'));
const sourceHint = computed(() => isProductImport.value ? t('importsExports.mappedImports.form.productSourceHint') : t('importsExports.mappedImports.form.sourceHint'));
const fileHint = computed(() => sourceMode.value === 'tabularFile' ? t('importsExports.mappedImports.form.tabularFileHint') : t('importsExports.mappedImports.form.fileHint'));
const canUsePeriodic = computed(() => sourceMode.value === 'url');

const getUploadedFileName = (value: UploadedJsonFile) => {
  if (!value) {
    return null;
  }

  return value instanceof File ? value.name : value.name || value.url || null;
};

const getFileExtension = (value: UploadedJsonFile) => {
  const fileName = getUploadedFileName(value);
  const extension = fileName?.split('?')[0].split('.').pop();
  return extension ? `.${extension.toLowerCase()}` : null;
};

const isFileCompatibleWithType = (value: UploadedJsonFile) => {
  const extension = getFileExtension(value);
  return !extension || acceptedFileFormats.value.includes(extension);
};

const getInitialSourceMode = (): SourceMode => {
  if (form.jsonUrl) {
    return 'url';
  }

  const extension = getFileExtension(form.jsonFile);
  if (isProductImport.value && extension && tabularFileFormats.includes(extension)) {
    return 'tabularFile';
  }

  return 'jsonFile';
};

const resetPeriodic = () => {
  form.isPeriodic = false;
  form.intervalHours = null;
  fieldErrors.intervalHours = null;
};

const applyInitialValue = () => {
  const next = defaultFormState();
  Object.assign(next, props.initialValue || {});
  Object.assign(form, next);

  sourceMode.value = getInitialSourceMode();

  if (!canUsePeriodic.value) {
    resetPeriodic();
  } else if (!form.isPeriodic) {
    form.intervalHours = null;
  }
};

watch(
  () => props.initialValue,
  () => applyInitialValue(),
  { immediate: true, deep: true },
);

watch(sourceMode, (nextMode) => {
  fieldErrors.source = null;
  fieldErrors.jsonUrl = null;

  if (nextMode !== 'url') {
    form.jsonUrl = '';
    resetPeriodic();
    if (!isFileCompatibleWithType(form.jsonFile)) {
      form.jsonFile = null;
    }
    return;
  }

  form.jsonFile = null;
});

watch(
  () => form.type,
  () => {
    if (!isProductImport.value && sourceMode.value === 'tabularFile') {
      sourceMode.value = 'jsonFile';
      form.jsonFile = null;
      fieldErrors.source = null;
      return;
    }

    if (sourceMode.value !== 'url' && !isFileCompatibleWithType(form.jsonFile)) {
      form.jsonFile = null;
      fieldErrors.source = null;
    }
  },
);

watch(
  () => form.isPeriodic,
  (enabled) => {
    if (!enabled) {
      form.intervalHours = null;
      fieldErrors.intervalHours = null;
    }
  },
);

const validateUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
};

const resetErrors = () => {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = null;
  });
};

const selectSource = (nextMode: SourceMode) => {
  sourceMode.value = nextMode;
};

const handleSubmit = (action: SubmitAction) => {
  resetErrors();

  if (!canUsePeriodic.value) {
    resetPeriodic();
  }

  if (!form.type) {
    fieldErrors.type = t('importsExports.validation.required');
  }

  if (sourceMode.value !== 'url') {
    if (!form.jsonFile) {
      fieldErrors.source = t(sourceMode.value === 'tabularFile' ? 'importsExports.validation.tabularFileRequired' : 'importsExports.validation.fileRequired');
    }
  } else if (!form.jsonUrl) {
    fieldErrors.jsonUrl = t('importsExports.validation.urlRequired');
  } else if (!validateUrl(form.jsonUrl)) {
    fieldErrors.jsonUrl = t('importsExports.validation.invalidUrl');
  }

  if (canUsePeriodic.value && form.isPeriodic && (!form.intervalHours || form.intervalHours <= 0)) {
    fieldErrors.intervalHours = t('importsExports.validation.intervalHoursPositive');
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return;
  }

  emit('submit', {
    ...form,
    sourceMode: sourceMode.value,
    action,
  });
};
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-2 xl:items-start">
    <Card class="border border-slate-200 p-6 shadow-sm">
      <div class="space-y-8">
        <div>
          <h2 class="text-xl font-semibold text-slate-900">{{ t(`importsExports.mappedImports.${mode}.title`) }}</h2>
          <p class="mt-2 text-sm leading-6 text-slate-500">{{ t('importsExports.mappedImports.form.subtitle') }}</p>
        </div>

        <div class="grid items-start gap-6 md:grid-cols-2">
          <div class="md:col-span-2">
            <FormFieldShell :label="t('shared.labels.name')">
              <TextInput v-model:model-value="form.name" class="w-full" :placeholder="t('shared.placeholders.name')" />
            </FormFieldShell>
          </div>

          <FormFieldShell :label="t('shared.labels.type')" required :hint="isEdit ? t('importsExports.mappedImports.form.typeLocked') : null" :error="fieldErrors.type">
            <Selector
              v-model="form.type"
              :options="typeOptions"
              label-by="label"
              value-by="value"
              :disabled="isEdit"
            />
          </FormFieldShell>

          <FormFieldShell :label="t('shared.labels.language')">
            <Selector
              v-model="form.language"
              :options="languageSelectorOptions"
              label-by="label"
              value-by="value"
              filterable
              :placeholder="t('importsExports.shared.none')"
            />
          </FormFieldShell>
        </div>

        <div class="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <FormFieldShell :label="t('importsExports.shared.source')" required :hint="sourceHint" :error="fieldErrors.source">
            <div :class="isProductImport ? 'grid gap-3 sm:grid-cols-3' : 'grid gap-3 sm:grid-cols-2'">
              <button
                type="button"
                class="rounded-xl border px-4 py-3 text-left text-sm font-semibold transition"
                :class="sourceMode === 'jsonFile' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
                @click="selectSource('jsonFile')"
              >
                {{ t('importsExports.fields.jsonFile') }}
              </button>
              <button
                v-if="isProductImport"
                type="button"
                class="rounded-xl border px-4 py-3 text-left text-sm font-semibold transition"
                :class="sourceMode === 'tabularFile' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
                @click="selectSource('tabularFile')"
              >
                {{ t('importsExports.fields.tabularFile') }}
              </button>
              <button
                type="button"
                class="rounded-xl border px-4 py-3 text-left text-sm font-semibold transition"
                :class="sourceMode === 'url' ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'"
                @click="selectSource('url')"
              >
                {{ t('importsExports.fields.jsonUrl') }}
              </button>
            </div>
          </FormFieldShell>

          <FormFieldShell
            v-if="sourceMode !== 'url'"
            :label="fileSourceLabel"
            required
            :hint="fileHint"
          >
            <FileUploader
              :key="fileUploaderKey"
              :model-value="form.jsonFile"
              :formats="acceptedFileFormats"
              @update:model-value="form.jsonFile = $event; fieldErrors.source = null"
            />
          </FormFieldShell>

          <FormFieldShell
            v-else
            :label="t('importsExports.fields.jsonUrl')"
            required
            :hint="t('importsExports.mappedImports.form.urlHint')"
            :error="fieldErrors.jsonUrl"
          >
            <TextInput v-model:model-value="form.jsonUrl" class="w-full" :placeholder="t('importsExports.placeholders.url')" />
          </FormFieldShell>

          <div v-if="canUsePeriodic" class="grid items-start gap-6 md:grid-cols-2">
            <FormFieldShell :label="t('importsExports.fields.isPeriodic')" :hint="t('importsExports.mappedImports.form.isPeriodicHint')">
              <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span class="text-sm text-slate-700">{{ t('importsExports.fields.isPeriodic') }}</span>
                <Toggle v-model="form.isPeriodic" />
              </div>
            </FormFieldShell>

            <FormFieldShell v-if="form.isPeriodic" :label="t('importsExports.fields.intervalHours')" required :error="fieldErrors.intervalHours">
              <TextInput
                v-model:model-value="form.intervalHours"
                class="w-full"
                number
                :min-number="1"
                :placeholder="t('importsExports.placeholders.intervalHours')"
              />
            </FormFieldShell>
          </div>
        </div>

        <div class="grid items-start gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ t('importsExports.fields.createOnly') }}</h3>
                <p class="mt-1 text-xs leading-5 text-slate-500">{{ t('importsExports.helpers.createOnly') }}</p>
              </div>
              <Toggle :model-value="form.createOnly" @update:model-value="form.createOnly = Boolean($event)" />
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ t('importsExports.fields.updateOnly') }}</h3>
                <p class="mt-1 text-xs leading-5 text-slate-500">{{ t('importsExports.helpers.updateOnly') }}</p>
              </div>
              <Toggle :model-value="form.updateOnly" @update:model-value="form.updateOnly = Boolean($event)" />
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ t('importsExports.fields.overrideOnly') }}</h3>
                <p class="mt-1 text-xs leading-5 text-slate-500">{{ t('importsExports.helpers.overrideOnly') }}</p>
              </div>
              <Toggle :model-value="form.overrideOnly" @update:model-value="form.overrideOnly = Boolean($event)" />
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ t('importsExports.fields.skipBrokenRecords') }}</h3>
                <p class="mt-1 text-xs leading-5 text-slate-500">{{ t('importsExports.helpers.skipBrokenRecords') }}</p>
              </div>
              <Toggle :model-value="form.skipBrokenRecords" @update:model-value="form.skipBrokenRecords = Boolean($event)" />
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <SecondaryButton :disabled="submitting" @click="emit('cancel')">
            {{ t('shared.button.cancel') }}
          </SecondaryButton>
          <Button
            v-if="isEdit"
            type="button"
            class="button rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm btn-info"
            :disabled="submitting"
            @click="emit('details')"
          >
            {{ t('shared.button.show') }}
          </Button>
          <SecondaryButton :disabled="submitting" @click="handleSubmit('continue')">
            {{ t(mode === 'create' ? 'shared.button.createAndContinue' : 'shared.button.saveAndContinue') }}
          </SecondaryButton>
          <PrimaryButton :loading="submitting" :disabled="submitting" @click="handleSubmit('save')">
            {{ t(mode === 'create' ? 'shared.button.create' : 'shared.button.save') }}
          </PrimaryButton>
        </div>
      </div>
    </Card>

    <MappedImportTutorialPanel :selected-type="selectedType" />
  </div>
</template>
