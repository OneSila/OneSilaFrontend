<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { Wizard } from '../../../../../../../../../../../shared/components/molecules/wizard';
import { OptionSelector } from '../../../../../../../../../../../shared/components/molecules/option-selector';
import { Icon } from '../../../../../../../../../../../shared/components/atoms/icon';
import { Button } from '../../../../../../../../../../../shared/components/atoms/button';
import { DropZone } from '../../../../../../../../../../../shared/components/molecules/drop-zone';
import { ImportSettingsStep } from '../../general/import-settings';
import apolloClient from '../../../../../../../../../../../../apollo-client';
import { Toast } from '../../../../../../../../../../../shared/modules/toast';
import {
  createMiraklImportExportFileMutation,
  createMiraklImportProcessMutation,
} from '../../../../../../../../../../../shared/api/mutations/salesChannels';
import { getMiraklChannelQuery } from '../../../../../../../../../../../shared/api/queries/salesChannels';
import { processGraphQLErrors } from '../../../../../../../../../../../shared/utils';

const props = defineProps<{ integrationId: string; type: string }>();

const router = useRouter();
const { t } = useI18n();

const importType = ref('schema');
const hasFinishedSchema = ref(false);
const loading = ref(false);
const finishLoading = ref(false);
const step = ref(0);
const salesChannelId = ref<string | null>(null);
const exportFiles = ref<File[]>([]);
const dropZone = ref<any>(null);
const importSettings = ref({
  updateOnly: false,
  overrideOnly: true,
  skipBrokenRecords: true,
});

const typeChoices = computed(() => [
  { name: 'schema' },
  {
    name: 'products',
    disabled: !hasFinishedSchema.value,
    hideDisabledBanner: true,
  },
]);

const wizardSteps = computed(() => {
  const steps = [
    { title: t('integrations.imports.create.title'), name: 'selectType' },
  ];

  if (importType.value === 'products') {
    steps.push({ title: t('integrations.imports.create.wizard.generalSettings.title'), name: 'importSettings' });
    steps.push({ title: t('integrations.imports.create.mirakl.filesTitle'), name: 'uploadFiles' });
  }

  return steps;
});

watch(
  wizardSteps,
  (newSteps) => {
    if (step.value >= newSteps.length) {
      step.value = Math.max(newSteps.length - 1, 0);
    }
  },
  { immediate: true },
);

watch(importType, (value) => {
  if (value !== 'products') {
    exportFiles.value = [];
    dropZone.value?.clear?.();
  }
});

const currentStepName = computed(() => wizardSteps.value[step.value]?.name ?? null);

const allowNextStep = computed(() => {
  if (loading.value || finishLoading.value) {
    return false;
  }

  if (currentStepName.value === 'uploadFiles') {
    return exportFiles.value.length > 0;
  }

  return true;
});

const tutorialSteps = computed(() => [
  t('integrations.imports.create.mirakl.tutorial.steps.step1'),
  t('integrations.imports.create.mirakl.tutorial.steps.step2'),
  t('integrations.imports.create.mirakl.tutorial.steps.step3'),
  t('integrations.imports.create.mirakl.tutorial.steps.step4'),
]);

const exportFileCountLabel = computed(() =>
  t('integrations.imports.create.mirakl.filesCount', { count: exportFiles.value.length }),
);

const xlsxFormats = ['.xlsx'];

const buildFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const fetchIntegrationData = async () => {
  loading.value = true;

  try {
    const { data } = await apolloClient.query({
      query: getMiraklChannelQuery,
      variables: { id: props.integrationId },
      fetchPolicy: 'cache-first',
    });

    const channel = data?.miraklChannel;
    hasFinishedSchema.value = Boolean(channel?.firstImportComplete);
    salesChannelId.value = channel?.saleschannelPtr?.id ?? null;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchIntegrationData);

const updateStep = (value: number) => {
  step.value = value;
};

const onUploaded = (files: File[]) => {
  const existingKeys = new Set(exportFiles.value.map(buildFileKey));
  const nextFiles = files.filter((file) => !existingKeys.has(buildFileKey(file)));

  if (!nextFiles.length) {
    return;
  }

  exportFiles.value = [...exportFiles.value, ...nextFiles];
  dropZone.value?.clear?.();
};

const removeExportFile = (index: number) => {
  exportFiles.value.splice(index, 1);
};

const createImportProcess = async () => {
  const { data } = await apolloClient.mutate({
    mutation: createMiraklImportProcessMutation,
    variables: {
      data: {
        salesChannel: { id: salesChannelId.value },
        name: importType.value,
        type: importType.value,
        status: 'pending',
        updateOnly: importSettings.value.updateOnly,
        overrideOnly: importSettings.value.overrideOnly,
        skipBrokenRecords: importSettings.value.skipBrokenRecords,
      },
    },
  });

  return data?.createMiraklImportProcess?.id ?? null;
};

const createExportFiles = async (importProcessId: string) => {
  await Promise.all(
    exportFiles.value.map((file) =>
      apolloClient.mutate({
        mutation: createMiraklImportExportFileMutation,
        variables: {
          data: {
            importProcess: { id: importProcessId },
            file,
          },
        },
      }),
    ),
  );
};

const handleFinish = async () => {
  if (importType.value === 'products' && exportFiles.value.length === 0) {
    Toast.error(t('integrations.imports.create.mirakl.filesRequired'));
    return;
  }

  if (!salesChannelId.value) {
    Toast.error(t('shared.labels.error'));
    return;
  }

  finishLoading.value = true;

  try {
    const importProcessId = await createImportProcess();

    if (!importProcessId) {
      throw new Error('Mirakl import process was created without an id.');
    }

    if (importType.value === 'products') {
      await createExportFiles(importProcessId);
    }

    Toast.success(t('integrations.imports.create.success'));
    router.push({
      name: 'integrations.integrations.show',
      params: { id: props.integrationId, type: props.type },
      query: { tab: 'imports' },
    });
  } catch (err) {
    const validationErrors = processGraphQLErrors(err, t);

    if (validationErrors['__all__']) {
      Toast.error(validationErrors['__all__']);
    } else {
      Toast.error(t('integrations.imports.create.mirakl.uploadFailed'));
    }
  } finally {
    finishLoading.value = false;
  }
};
</script>

<template>
  <div>
    <div v-if="finishLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="rounded-2xl bg-white px-6 py-5 shadow-xl">
        <div class="flex items-center gap-3">
          <Icon name="circle-notch" spin class="text-primary" />
          <span class="text-sm font-medium text-slate-700">{{ t('shared.labels.loading') }}</span>
        </div>
      </div>
    </div>

    <Wizard
      :steps="wizardSteps"
      :allow-next-step="allowNextStep"
      :show-buttons="true"
      @on-finish="handleFinish"
      @update-current-step="updateStep"
    >
      <template #selectType>
        <div class="flex flex-col gap-6">
          <OptionSelector v-model="importType" :choices="typeChoices" :disabled="loading || finishLoading">
            <template #schema>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold">
                    {{ t('integrations.imports.types.schema') }}
                  </h3>
                </div>
                <p class="text-sm text-gray-500">
                  {{ t('integrations.imports.types.schemaDescription') }}
                </p>
              </div>
            </template>

            <template #products>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-bold">
                    {{ t('integrations.imports.types.products') }}
                  </h3>
                </div>
                <p class="text-sm text-gray-500">
                  {{ t('integrations.imports.types.productsDescription') }}
                </p>
                <div
                  v-if="!hasFinishedSchema"
                  class="flex items-center gap-1 text-sm text-gray-400"
                >
                  <Icon name="exclamation-circle" class="text-gray-400" />
                  <span>
                    {{ t('integrations.imports.types.schemaRequired') }}
                  </span>
                </div>
              </div>
            </template>
          </OptionSelector>
        </div>
      </template>

      <template #importSettings>
        <ImportSettingsStep v-model="importSettings" />
      </template>

      <template #uploadFiles>
        <div class="space-y-6">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900">
                    {{ t('integrations.imports.create.mirakl.filesTitle') }}
                  </h3>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ t('integrations.imports.create.mirakl.filesDescription') }}
                  </p>
                </div>
                <span class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {{ exportFileCountLabel }}
                </span>
              </div>

              <p class="text-sm font-medium text-amber-700">
                {{ t('integrations.imports.create.mirakl.filesRequired') }}
              </p>
            </div>

            <div class="mt-4">
              <DropZone
                ref="dropZone"
                :formats="xlsxFormats"
                :multiple="true"
                :loading="finishLoading"
                @uploaded="onUploaded"
              />
            </div>

            <div v-if="exportFiles.length" class="mt-4 grid gap-3">
              <div
                v-for="(file, index) in exportFiles"
                :key="buildFileKey(file)"
                class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="min-w-0">
                  <div class="truncate text-sm font-medium text-slate-900">{{ file.name }}</div>
                  <div class="mt-1 text-xs text-slate-500">{{ formatFileSize(file.size) }}</div>
                </div>
                <Button class="btn btn-outline-dark" @click="removeExportFile(index)">
                  <Icon name="trash" class="mr-2 h-4 w-4" />
                  {{ t('shared.button.delete') }}
                </Button>
              </div>
            </div>

            <div
              v-else
              class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500"
            >
              {{ t('integrations.imports.create.mirakl.filesEmpty') }}
            </div>
          </div>

          <div class="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ t('integrations.imports.create.mirakl.tutorial.title') }}
            </h3>
            <p class="mt-2 text-sm text-slate-600">
              {{ t('integrations.imports.create.mirakl.tutorial.description') }}
            </p>
            <ol class="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li v-for="tutorialStep in tutorialSteps" :key="tutorialStep">
                {{ tutorialStep }}
              </li>
            </ol>
          </div>
        </div>
      </template>
    </Wizard>
  </div>
</template>
