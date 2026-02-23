<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import apolloClient from '../../../../../../../../../../apollo-client';
import GeneralTemplate from '../../../../../../../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../../../../../../../shared/components/molecules/breadcrumbs';
import { Label } from '../../../../../../../../../shared/components/atoms/label';
import { TextInput } from '../../../../../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../../../../../shared/components/atoms/button';
import { SecondaryButton } from '../../../../../../../../../shared/components/atoms/button-secondary';
import { FieldQuery } from '../../../../../../../../../shared/components/organisms/general-form/containers/form-fields/field-query';
import type { QueryFormField } from '../../../../../../../../../shared/components/organisms/general-form/formConfig';
import { FieldType } from '../../../../../../../../../shared/utils/constants';
import { Toast } from '../../../../../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../../../../../shared/utils';
import { documentTypesQuerySelector } from '../../../../../../../../../shared/api/queries/documentTypes.js';
import { getRemoteDocumentTypeQuery } from '../../../../../../../../../shared/api/queries/salesChannels.js';
import {
  updateEbayDocumentTypeMutation,
  updateRemoteDocumentTypeMutation,
} from '../../../../../../../../../shared/api/mutations/salesChannels.js';
import RemoteDocumentTypeCategoriesList from './categories-lists/RemoteDocumentTypeCategoriesList.vue';

type CategoryId = string | number;

interface RemoteDocumentTypeFormState {
  id: string;
  name: string;
  remoteId: string;
  translatedName: string;
  description: string;
  localInstance: string | null;
  localInstanceName: string;
  requiredCategories: CategoryId[];
  optionalCategories: CategoryId[];
}

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const queryParamToString = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return value.length ? String(value[0]) : null;
  }
  return value ? String(value) : null;
};

const documentTypeId = computed(() => String(route.params.id || ''));
const type = computed(() => String(route.params.type || ''));
const integrationId = computed(() => queryParamToString(route.query.integrationId) || '');
const salesChannelId = computed(
  () => queryParamToString(route.query.salesChannelId) || queryParamToString(route.query.integrationId),
);
const updateMutation = computed(() =>
  type.value === 'ebay' ? updateEbayDocumentTypeMutation : updateRemoteDocumentTypeMutation,
);

const loading = ref(true);
const saving = ref(false);
const fieldErrors = ref<Record<string, string>>({});

const form = ref<RemoteDocumentTypeFormState>({
  id: '',
  name: '',
  remoteId: '',
  translatedName: '',
  description: '',
  localInstance: null,
  localInstanceName: '',
  requiredCategories: [],
  optionalCategories: [],
});

const backRoute = computed(() => ({
  name: 'integrations.integrations.show',
  params: { type: type.value, id: integrationId.value },
  query: { tab: 'documentTypes' },
}));

const breadcrumbsLinks = computed(() => [
  { path: { name: 'integrations.integrations.list' }, name: t('integrations.title') },
  { path: backRoute.value, name: t(`integrations.show.${type.value}.title`) },
  { name: t('integrations.show.documentTypes.editTitle') },
]);

const localInstanceField = computed<QueryFormField>(() => ({
  type: FieldType.Query,
  name: 'localInstance',
  label: t('integrations.show.documentTypes.labels.localInstance'),
  help: t('integrations.show.documentTypes.help.localInstance'),
  labelBy: 'name',
  valueBy: 'id',
  query: documentTypesQuerySelector,
  dataKey: 'documentTypes',
  isEdge: true,
  multiple: false,
  filterable: true,
}));

const localInstanceInitialOptions = computed(() =>
  form.value.localInstance && form.value.localInstanceName
    ? [{ id: form.value.localInstance, name: form.value.localInstanceName }]
    : [],
);

const toSnakeCase = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const getFieldError = (field: string): string => {
  const snakeCase = toSnakeCase(field);
  const keys = [
    field,
    snakeCase,
    `data.${field}`,
    `data.${snakeCase}`,
    `input.${field}`,
    `input.${snakeCase}`,
    `${field}.id`,
    `${snakeCase}.id`,
  ];
  for (const key of keys) {
    if (fieldErrors.value[key]) {
      return fieldErrors.value[key];
    }
  }
  return '';
};

const loadRemoteDocumentType = async () => {
  loading.value = true;
  fieldErrors.value = {};
  try {
    const { data } = await apolloClient.query({
      query: getRemoteDocumentTypeQuery,
      variables: { id: documentTypeId.value },
      fetchPolicy: 'network-only',
    });

    const remoteDocumentType = data?.remoteDocumentType;
    if (!remoteDocumentType) {
      Toast.error(t('shared.alert.toast.unexpectedResult'));
      return;
    }

    form.value = {
      id: remoteDocumentType.id || documentTypeId.value,
      name: remoteDocumentType.name || '',
      remoteId: remoteDocumentType.remoteId || '',
      translatedName: remoteDocumentType.translatedName || '',
      description: remoteDocumentType.description || '',
      localInstance: remoteDocumentType.localInstance?.id || null,
      localInstanceName: remoteDocumentType.localInstance?.name || '',
      requiredCategories: Array.isArray(remoteDocumentType.requiredCategories) ? remoteDocumentType.requiredCategories : [],
      optionalCategories: Array.isArray(remoteDocumentType.optionalCategories) ? remoteDocumentType.optionalCategories : [],
    };
  } catch (error) {
    Toast.error(t('shared.alert.toast.unexpectedResult'));
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push(backRoute.value);
};

const save = async (continueEditing = false) => {
  if (!form.value.id || saving.value) {
    return;
  }

  saving.value = true;
  fieldErrors.value = {};

  try {
    await apolloClient.mutate({
      mutation: updateMutation.value,
      variables: {
        data: {
          id: form.value.id,
          translatedName: form.value.translatedName || null,
          description: form.value.description || null,
          localInstance: form.value.localInstance ? { id: form.value.localInstance } : null,
          requiredCategories: form.value.requiredCategories,
          optionalCategories: form.value.optionalCategories,
        },
      },
    });

    Toast.success(t('shared.alert.toast.submitSuccessUpdate'));
    if (!continueEditing) {
      goBack();
    }
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    fieldErrors.value = validationErrors;
    const generalError =
      validationErrors['__all__'] ||
      validationErrors['nonFieldErrors'] ||
      validationErrors['non_field_errors'];
    if (generalError) {
      Toast.error(generalError);
    }
  } finally {
    saving.value = false;
  }
};

onMounted(loadRemoteDocumentType);
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs :links="breadcrumbsLinks" />
    </template>

    <template #content>
      <div v-if="loading" class="flex justify-center py-10">
        <span class="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-black !border-l-transparent dark:border-white"></span>
      </div>

      <div v-else class="space-y-10 divide-y divide-gray-900/10 mt-4">
        <div class="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-3">
          <div class="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-2">
            <div class="space-y-6 px-4 py-6 sm:p-8">
              <div>
                <Label class="mb-1 block text-sm font-semibold leading-6 text-gray-900">
                  {{ t('shared.labels.name') }}
                </Label>
                <TextInput v-model="form.name" class="w-full" :disabled="true" />
              </div>

              <div>
                <Label class="mb-1 block text-sm font-semibold leading-6 text-gray-900">
                  {{ t('integrations.show.documentTypes.labels.remoteId') }}
                </Label>
                <TextInput v-model="form.remoteId" class="w-full" :disabled="true" />
              </div>

              <div>
                <Label class="mb-1 block text-sm font-semibold leading-6 text-gray-900">
                  {{ t('integrations.show.documentTypes.labels.translatedName') }}
                </Label>
                <TextInput v-model="form.translatedName" class="w-full" />
                <p class="mt-1 text-sm text-gray-500">{{ t('integrations.show.documentTypes.help.translatedName') }}</p>
                <p v-if="getFieldError('translatedName')" class="mt-1 text-sm text-red-500">{{ getFieldError('translatedName') }}</p>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-semibold leading-6 text-gray-900">
                  {{ t('integrations.show.documentTypes.labels.localInstance') }}
                </Label>
                <FieldQuery
                  v-model="form.localInstance"
                  :field="localInstanceField"
                  :initial-options="localInstanceInitialOptions"
                />
                <p class="mt-1 text-sm text-gray-500">{{ t('integrations.show.documentTypes.help.localInstance') }}</p>
                <p v-if="getFieldError('localInstance')" class="mt-1 text-sm text-red-500">{{ getFieldError('localInstance') }}</p>
              </div>

              <div>
                <Label class="mb-1 block text-sm font-semibold leading-6 text-gray-900">
                  {{ t('integrations.show.documentTypes.labels.description') }}
                </Label>
                <textarea
                  v-model="form.description"
                  class="focus:outline-none focus:border-sky-500 focus:ring-sky-500 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:italic placeholder:text-gray-400 focus:ring-1"
                  rows="4"
                />
                <p class="mt-1 text-sm text-gray-500">{{ t('integrations.show.documentTypes.help.description') }}</p>
                <p v-if="getFieldError('description')" class="mt-1 text-sm text-red-500">{{ getFieldError('description') }}</p>
              </div>

              <RemoteDocumentTypeCategoriesList
                v-model="form.requiredCategories"
                :type="type"
                category-kind="required"
                :sales-channel-id="salesChannelId"
                :error-message="getFieldError('requiredCategories')"
              />

              <RemoteDocumentTypeCategoriesList
                v-model="form.optionalCategories"
                :type="type"
                category-kind="optional"
                :sales-channel-id="salesChannelId"
                :error-message="getFieldError('optionalCategories')"
              />
            </div>

            <div class="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-4 sm:px-8">
              <Button type="button" class="btn btn-secondary" :disabled="saving" @click="goBack">
                {{ t('shared.button.back') }}
              </Button>
              <SecondaryButton type="button" :disabled="saving" :loading="saving" @click="save(true)">
                {{ t('shared.button.saveAndContinue') }}
              </SecondaryButton>
              <Button type="button" class="btn btn-primary" :loading="saving" :disabled="saving" @click="save">
                {{ t('shared.button.save') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </GeneralTemplate>
</template>
