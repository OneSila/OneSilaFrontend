<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal } from '../../../atoms/modal';
import { Card } from '../../../atoms/card';
import { TextInput } from '../../../atoms/input-text';
import { PrimaryButton } from '../../../atoms/button-primary';
import { CancelButton } from '../../../atoms/button-cancel';
import { Button } from '../../../atoms/button';
import { Icon } from '../../../atoms/icon';
import { FieldQuery } from '../../general-form/containers/form-fields/field-query';
import { QueryFormField } from '../../general-form/formConfig';
import { FieldType } from '../../../../utils/constants';
import { Toast } from '../../../../modules/toast';
import { processGraphQLErrors } from '../../../../utils';
import { createDashboardCardMutation, createDashboardSectionMutation } from '../../../../api/mutations/dashboard.js';
import { dashboardSectionsQuery } from '../../../../api/queries/dashboardCards.js';
import { meQuery } from '../../../../api/queries/me.js';
import apolloClient from '../../../../../../apollo-client';
import { parse, print, visit } from 'graphql';

type DashboardCardColor = 'red' | 'orange' | 'yellow';

const props = defineProps<{
  modelValue: boolean;
  queryText?: string;
  variables?: Record<string, any> | null;
  queryKey?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const modalVisible = ref(props.modelValue);
const title = ref('');
const description = ref('');
const color = ref<DashboardCardColor>('red');
const selectedSectionId = ref<string | null>(null);
const saving = ref(false);
const currentUserId = ref<string | null>(null);
const currentUserLoading = ref(false);
const showNewSectionForm = ref(false);
const newSectionTitle = ref('');
const newSectionDescription = ref('');
const creatingSection = ref(false);
const sectionInitialOptions = ref<any[]>([]);
const colorToGraphqlMap: Record<DashboardCardColor, string> = {
  red: 'RED',
  orange: 'ORANGE',
  yellow: 'YELLOW'
};

const { t } = useI18n();

const resetForm = () => {
  title.value = '';
  description.value = '';
  color.value = 'red';
  selectedSectionId.value = null;
  saving.value = false;
  showNewSectionForm.value = false;
  resetNewSectionForm();
  sectionInitialOptions.value = [];
};

const fetchCurrentUser = async () => {
  if (currentUserLoading.value || currentUserId.value) {
    return;
  }

  currentUserLoading.value = true;
  try {
    const { data } = await apolloClient.query({
      query: meQuery,
      fetchPolicy: 'cache-first'
    });
    currentUserId.value = data?.me?.id ?? null;
  } catch (error) {
    console.error('Failed to load current user', error);
  } finally {
    currentUserLoading.value = false;
  }
};

watch(() => props.modelValue, (value) => {
  modalVisible.value = value;
});

watch(
  modalVisible,
  (value, oldValue) => {
    if (value === oldValue) {
      return;
    }
    emit('update:modelValue', value);
    if (value) {
      fetchCurrentUser();
    }
    if (!value) {
      resetForm();
    }
  },
  { immediate: false }
);

const colorOptions = computed(() => [
  { value: 'red' as DashboardCardColor, label: t('generalListing.modal.colors.red'), swatchClass: 'bg-red-500' },
  { value: 'orange' as DashboardCardColor, label: t('generalListing.modal.colors.orange'), swatchClass: 'bg-orange-500' },
  { value: 'yellow' as DashboardCardColor, label: t('generalListing.modal.colors.yellow'), swatchClass: 'bg-yellow-400' }
]);

const sectionField = computed<QueryFormField>(() => ({
  type: FieldType.Query,
  name: 'dashboardSection',
  label: t('generalListing.modal.fields.section'),
  labelBy: 'title',
  valueBy: 'id',
  placeholder: t('generalListing.modal.fields.sectionPlaceholder'),
  query: dashboardSectionsQuery,
  dataKey: 'dashboardSections',
  isEdge: true,
  multiple: false,
  filterable: true,
  removable: false,
  queryVariables: {
    filter: {
      currentUser: true
    }
  }
}));

const colorStyles: Record<DashboardCardColor, { front: string; back: string; accent: string }> = {
  red: { front: 'bg-red-300 border-red-500', back: 'bg-red-100 border-red-200', accent: 'text-red-500' },
  orange: { front: 'bg-orange-300 border-orange-500', back: 'bg-orange-100 border-orange-200', accent: 'text-orange-500' },
  yellow: { front: 'bg-yellow-200 border-yellow-500', back: 'bg-yellow-100 border-yellow-200', accent: 'text-yellow-500' }
};

const previewFrontClass = computed(() => colorStyles[color.value].front);
const previewBackClass = computed(() => colorStyles[color.value].back);
const previewAccentClass = computed(() => colorStyles[color.value].accent);
const previewTitle = computed(() =>
  title.value.trim() || t('generalListing.modal.preview.titlePlaceholder')
);
const previewDescription = computed(() =>
  description.value.trim() || t('generalListing.modal.preview.descriptionPlaceholder')
);

const isCreateDisabled = computed(() => {
  return (
    saving.value ||
    !title.value.trim() ||
    !selectedSectionId.value ||
    !props.queryKey ||
    !props.queryText ||
    !currentUserId.value
  );
});

const buildCountQuery = (text: string) => {
  if (!text) {
    return '';
  }
  try {
    const ast = parse(text);
    const strippedAst = visit(ast, {
      Field(node) {
        if (node.name.value === 'edges' || node.name.value === 'pageInfo') {
          return null;
        }
      }
    });
    return print(strippedAst);
  } catch (error) {
    console.warn('Failed to build count query', error);
    return text;
  }
};

const toggleNewSectionForm = () => {
  showNewSectionForm.value = !showNewSectionForm.value;
  if (showNewSectionForm.value && !currentUserId.value) {
    fetchCurrentUser();
  }
};

const resetNewSectionForm = () => {
  newSectionTitle.value = '';
  newSectionDescription.value = '';
};

const handleCreateSection = async () => {
  if (creatingSection.value) {
    return;
  }

  const trimmedTitle = newSectionTitle.value.trim();
  if (!trimmedTitle) {
    Toast.error(t('generalListing.modal.sectionCreate.validation.titleRequired'));
    return;
  }

  if (!currentUserId.value) {
    await fetchCurrentUser();
  }

  if (!currentUserId.value) {
    Toast.error(t('generalListing.modal.errors.userUnavailable'));
    return;
  }

  creatingSection.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: createDashboardSectionMutation,
      variables: {
        data: {
          title: trimmedTitle,
          description: newSectionDescription.value.trim() || null,
          user: {
            id: currentUserId.value
          }
        }
      }
    });

    const createdSection = data?.createDashboardSection;
    if (!createdSection?.id) {
      throw new Error('Missing section id');
    }

    sectionInitialOptions.value = [
      createdSection,
      ...sectionInitialOptions.value.filter((section) => section.id !== createdSection.id)
    ];
    selectedSectionId.value = createdSection.id;

    Toast.success(t('generalListing.modal.sectionCreate.alerts.createSuccess'));
    showNewSectionForm.value = false;
    resetNewSectionForm();
  } catch (error) {
    console.error('Failed to create dashboard section', error);
    Toast.error(t('generalListing.modal.sectionCreate.alerts.createError'));
  } finally {
    creatingSection.value = false;
  }
};

const handleCancel = () => {
  modalVisible.value = false;
};

const handleCreate = async () => {
  if (saving.value) {
    return;
  }

  const trimmedTitle = title.value.trim();

  if (!trimmedTitle) {
    Toast.error(t('generalListing.modal.errors.titleRequired'));
    return;
  }

  if (!selectedSectionId.value) {
    Toast.error(t('generalListing.modal.errors.sectionRequired'));
    return;
  }

  if (!props.queryKey) {
    Toast.error(t('generalListing.modal.errors.queryUnavailable'));
    return;
  }

  const countQuery = buildCountQuery(props.queryText || '');

  if (!countQuery) {
    Toast.error(t('generalListing.modal.errors.queryUnavailable'));
    return;
  }

  if (!currentUserId.value) {
    Toast.error(t('generalListing.modal.errors.userUnavailable'));
    return;
  }

  const variablesPayload = props.variables ?? {};
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  saving.value = true;
  try {
    await apolloClient.mutate({
      mutation: createDashboardCardMutation,
      variables: {
        data: {
          title: trimmedTitle,
          description: description.value.trim(),
          color: colorToGraphqlMap[color.value],
          query: countQuery,
          variables: variablesPayload,
          queryKey: props.queryKey,
          url: currentUrl,
          user: {
            id: currentUserId.value
          },
          section: {
            id: selectedSectionId.value
          }
        }
      }
    });

    Toast.success(t('generalListing.modal.alerts.createSuccess'));
    modalVisible.value = false;
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);
    const [firstError] = Object.keys(validationErrors);

    if (firstError) {
      Toast.error(validationErrors[firstError]);
    } else {
      Toast.error(t('generalListing.modal.alerts.createError'));
    }
  } finally {
    saving.value = false;
  }
};

const handleClosed = () => {
  modalVisible.value = false;
};
</script>

<template>
  <Modal v-model="modalVisible" @closed="handleClosed">
    <Card class="modal-content w-full max-w-4xl">
      <div class="flex flex-col space-y-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">
            {{ t('generalListing.modal.title') }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ t('generalListing.modal.subtitle') }}
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              {{ t('generalListing.modal.fields.title') }}
            </label>
            <TextInput
              v-model="title"
              class="mt-1 w-full"
              :placeholder="t('generalListing.modal.preview.titlePlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">
              {{ t('generalListing.modal.fields.description') }}
            </label>
            <textarea
              v-model="description"
              rows="4"
              class="mt-1 block w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              :placeholder="t('generalListing.modal.preview.descriptionPlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('generalListing.modal.fields.color') }}
            </label>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="option in colorOptions"
                :key="option.value"
                type="button"
                class="flex items-center rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                :class="color === option.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'"
                @click="color = option.value"
              >
                <span class="mr-2 h-3 w-3 rounded-full" :class="option.swatchClass" />
                <span>{{ option.label }}</span>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('generalListing.modal.fields.section') }}
            </label>
            <FieldQuery
              class="mt-1"
              v-model="selectedSectionId"
              :field="sectionField"
              :initial-options="sectionInitialOptions"
            />
            <div class="mt-3 space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-700">
                  {{ t('generalListing.modal.sectionCreate.helper') }}
                </p>
                <Button
                  :customClass="'btn btn-outline-primary flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide'"
                  @click="toggleNewSectionForm"
                >
                  <Icon :name="showNewSectionForm ? 'minus' : 'plus'" class="h-4 w-4" />
                  <span>
                    {{
                      showNewSectionForm
                        ? t('generalListing.modal.sectionCreate.closeButton')
                        : t('generalListing.modal.sectionCreate.openButton')
                    }}
                  </span>
                </Button>
              </div>

              <div v-if="showNewSectionForm" class="space-y-4">
                <div>
                  <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ t('generalListing.modal.sectionCreate.fields.title') }}
                  </label>
                  <TextInput
                    class="mt-2 w-full"
                    :placeholder="t('generalListing.modal.sectionCreate.fields.titlePlaceholder')"
                    v-model="newSectionTitle"
                  />
                </div>
                <div>
                  <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {{ t('generalListing.modal.sectionCreate.fields.description') }}
                  </label>
                  <textarea
                    v-model="newSectionDescription"
                    rows="3"
                    class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  ></textarea>
                </div>
                <div class="flex justify-end gap-2">
                  <Button
                    :customClass="'btn btn-outline-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide'"
                    @click="
                      () => {
                        showNewSectionForm = false;
                        resetNewSectionForm();
                      }
                    "
                  >
                    {{ t('generalListing.modal.sectionCreate.cancelButton') }}
                  </Button>
                  <Button
                    :customClass="'btn btn-primary px-4 py-2 text-sm font-semibold uppercase tracking-wide flex items-center gap-2'"
                    :disabled="creatingSection"
                    @click="handleCreateSection"
                  >
                    <Icon v-if="creatingSection" name="circle-notch" spin class="h-4 w-4" />
                    <span>{{ t('generalListing.modal.sectionCreate.createButton') }}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <span class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('shared.labels.preview') }}
          </span>

          <div class="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <div
                  class="rounded-2xl border-2 p-6 text-center text-white shadow-lg"
                  :class="previewFrontClass"
                >
                  <Icon name="exclamation-circle" class="mx-auto mb-3 h-12 w-12 text-white" />
                  <h3 class="text-lg font-semibold">{{ previewTitle }}</h3>
                  <div class="mt-4">
                    <span
                      class="inline-block rounded-md bg-white px-4 py-2 text-2xl font-bold"
                      :class="previewAccentClass"
                    >
                      24
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div
                  class="h-full rounded-2xl border p-6 shadow-sm"
                  :class="previewBackClass"
                >
                  <p class="text-lg font-semibold text-gray-800">
                    {{ previewTitle }}
                  </p>
                  <p class="mt-3 text-sm text-gray-700">
                    {{ previewDescription }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <CancelButton @click="handleCancel">
            {{ t('shared.button.cancel') }}
          </CancelButton>
          <PrimaryButton :disabled="isCreateDisabled" @click="handleCreate">
            {{ t('shared.button.create') }}
          </PrimaryButton>
        </div>
      </div>
    </Card>
  </Modal>
</template>
