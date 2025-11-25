<script setup lang="ts">
import { computed, nextTick, PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../../../shared/utils';
import { meQuery } from '../../../../../../../shared/api/queries/me.js';
import {
  createDashboardSectionMutation,
  updateDashboardSectionMutation,
  deleteDashboardSectionMutation
} from '../../../../../../../shared/api/mutations/dashboard.js';
import apolloClient from '../../../../../../../../apollo-client';
import type { EditableDashboardSection, DashboardSectionState, EditableDashboardCard } from './types';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import DashboardUserSectionsEditorRow from './DashboardUserSectionsEditorRow.vue';

const props = defineProps({
  sections: {
    type: Array as PropType<EditableDashboardSection[]>,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'saved'): void;
}>();

const { t } = useI18n();

const editableSections = ref<EditableDashboardSection[]>([]);
const initialSnapshot = ref<DashboardSectionState[]>([]);
const initialOrder = ref<string[]>([]);
const pendingDeletionIds = ref<string[]>([]);
const validationErrors = ref<Record<string, string>>({});
const currentUserId = ref<string | null>(null);
const fetchingUser = ref(false);
const isSaving = ref(false);

const randomId = () => `dashboard-section-${Math.random().toString(36).slice(2)}-${Date.now()}`;

const sanitizeText = (value: string | null | undefined) => value?.trim() || '';

const normalizeCard = (card: EditableDashboardCard, index: number): EditableDashboardCard => ({
  ...card,
  description: card.description ?? '',
  sortOrder: typeof card.sortOrder === 'number' ? card.sortOrder : index,
  clientId: card.clientId ?? card.id,
  persistedId: card.persistedId ?? card.id,
  loading: card.loading ?? false,
  count: card.count ?? 0,
  error: card.error ?? false
});

const resetFromProps = () => {
  const snapshot = props.sections.map((section, index) => {
    const normalizedCards = (section.cards ?? []).map((card, cardIndex) =>
      normalizeCard(card as EditableDashboardCard, cardIndex)
    );
    return {
      ...section,
      description: section.description ?? '',
      sortOrder: typeof section.sortOrder === 'number' ? section.sortOrder : index,
      cards: normalizedCards
    };
  });
  initialSnapshot.value = snapshot;
  initialOrder.value = snapshot.map((section) => section.id);
  editableSections.value = snapshot.map((section, index) => ({
    ...section,
    clientId: section.id,
    persistedId: section.id,
    isNew: false,
    sortOrder: index,
    cards: section.cards.map((card) => ({ ...card }))
  }));
  pendingDeletionIds.value = [];
  validationErrors.value = {};
};

watch(
  () => props.sections,
  () => {
    resetFromProps();
  },
  { immediate: true, deep: true }
);

const fetchCurrentUser = async () => {
  if (fetchingUser.value || currentUserId.value) {
    return;
  }
  fetchingUser.value = true;
  try {
    const { data } = await apolloClient.query({
      query: meQuery,
      fetchPolicy: 'cache-first'
    });
    currentUserId.value = data?.me?.id ?? null;
  } catch (error) {
    console.error('Failed to load current user', error);
  } finally {
    fetchingUser.value = false;
  }
};

const ensureCurrentUser = async () => {
  if (!currentUserId.value) {
    await fetchCurrentUser();
  }
};

const sequentiallyAssignSort = () => {
  editableSections.value.forEach((section, index) => {
    section.sortOrder = index;
  });
};

const handleAddSection = async () => {
  const tempId = randomId();
  editableSections.value = [
    {
      id: tempId,
      persistedId: null,
      clientId: tempId,
      title: '',
      description: '',
      cards: [],
      sortOrder: 0,
      isNew: true
    },
    ...editableSections.value
  ];
  sequentiallyAssignSort();
  await nextTick();
};

const updateSectionField = (clientId: string, field: 'title' | 'description', value: string) => {
  const section = editableSections.value.find((entry) => entry.clientId === clientId);
  if (!section) {
    return;
  }
  if (field === 'title') {
    section.title = value;
    if (validationErrors.value[clientId]) {
      delete validationErrors.value[clientId];
    }
  } else {
    section.description = value;
  }
};

const defaultSwalOptions = computed<SweetAlertOptions>(() => ({
  title: t('dashboard.cards.userSections.edit.deleteConfirmTitle'),
  text: t('dashboard.cards.userSections.edit.deleteConfirmText'),
  confirmButtonText: t('dashboard.cards.userSections.edit.deleteConfirmConfirm'),
  cancelButtonText: t('dashboard.cards.userSections.edit.deleteConfirmCancel'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em'
}));

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3'
  },
  buttonsStyling: false
});

const handleDeleteSection = async (section: EditableDashboardSection) => {
  const result = await swalWithBootstrapButtons.fire(defaultSwalOptions.value);
  if (!result.isConfirmed) {
    return;
  }
  if (section.persistedId && !pendingDeletionIds.value.includes(section.persistedId)) {
    pendingDeletionIds.value = [...pendingDeletionIds.value, section.persistedId];
  }
  editableSections.value = editableSections.value.filter((entry) => entry.clientId !== section.clientId);
  delete validationErrors.value[section.clientId];
  sequentiallyAssignSort();
};

const hasChanges = computed(() => {
  if (pendingDeletionIds.value.length > 0) {
    return true;
  }

  const snapshotMap = new Map(initialSnapshot.value.map((section) => [section.id, section]));

  const currentOrder = editableSections.value
    .filter((section) => section.persistedId)
    .map((section) => section.persistedId as string);

  if (currentOrder.length !== initialOrder.value.length) {
    return true;
  }

  for (let index = 0; index < currentOrder.length; index += 1) {
    if (currentOrder[index] !== initialOrder.value[index]) {
      return true;
    }
  }

  return editableSections.value.some((section) => {
    if (!section.persistedId) {
      return section.title.trim().length > 0 || sanitizeText(section.description).length > 0;
    }
    const original = snapshotMap.get(section.persistedId);
    if (!original) {
      return true;
    }
    const initialPosition = initialOrder.value.indexOf(section.persistedId);
    return (
      sanitizeText(section.title) !== sanitizeText(original.title) ||
      sanitizeText(section.description) !== sanitizeText(original.description) ||
      initialPosition !== section.sortOrder
    );
  });
});

const canSave = computed(() => hasChanges.value && !isSaving.value);

const handleReorder = () => {
  sequentiallyAssignSort();
};

const moveSectionPosition = (clientId: string, offset: number) => {
  const index = editableSections.value.findIndex((section) => section.clientId === clientId);
  if (index === -1) {
    return;
  }
  const newIndex = index + offset;
  if (newIndex < 0 || newIndex >= editableSections.value.length) {
    return;
  }
  const [section] = editableSections.value.splice(index, 1);
  editableSections.value.splice(newIndex, 0, section);
  sequentiallyAssignSort();
};

const buildValidationMap = (prepared: EditableDashboardSection[]) => {
  const nextErrors: Record<string, string> = {};
  prepared.forEach((section) => {
    if (!section.title) {
      nextErrors[section.clientId] = t('dashboard.cards.userSections.edit.validation.titleRequired');
    }
  });
  return nextErrors;
};

const handleGraphqlError = (error: unknown) => {
  const errors = processGraphQLErrors(error, t) as Record<string, string>;
  const message = errors.__all__ || Object.values(errors)[0];
  if (message) {
    Toast.error(message);
  } else {
    Toast.error(t('dashboard.cards.userSections.edit.saveError'));
  }
};

const handleSave = async () => {
  if (isSaving.value) {
    return;
  }

  const prepared = editableSections.value.map((section, index) => ({
    ...section,
    clientId: section.clientId,
    persistedId: section.persistedId,
    title: sanitizeText(section.title),
    description: sanitizeText(section.description),
    sortOrder: index
  }));

  const nextErrors = buildValidationMap(prepared);
  validationErrors.value = nextErrors;
  if (Object.keys(nextErrors).length) {
    Toast.error(t('dashboard.cards.userSections.edit.validation.titleRequired'));
    return;
  }

  const createPayloads = prepared
    .filter((section) => !section.persistedId)
    .map((section) => ({
      title: section.title,
      description: section.description || null,
      sortOrder: section.sortOrder ?? 0
    }));

  const snapshotMap = new Map(initialSnapshot.value.map((section) => [section.id, section]));

  const updatePayloads = prepared
    .filter((section) => section.persistedId)
    .filter((section) => {
      const original = snapshotMap.get(section.persistedId as string);
      if (!original) {
        return true;
      }
      return (
        section.title !== sanitizeText(original.title) ||
        section.description !== sanitizeText(original.description) ||
        initialOrder.value.indexOf(section.persistedId as string) !== section.sortOrder
      );
    })
    .map((section) => ({
      id: section.persistedId as string,
      title: section.title,
      description: section.description || null,
      sortOrder: section.sortOrder ?? 0
    }));

  const deletions = [...pendingDeletionIds.value];

  if (!createPayloads.length && !updatePayloads.length && !deletions.length) {
    Toast.info(t('dashboard.cards.userSections.edit.noChanges'));
    return;
  }

  if (createPayloads.length) {
    await ensureCurrentUser();
    if (!currentUserId.value) {
      Toast.error(t('dashboard.cards.userSections.edit.saveError'));
      return;
    }
  }

  isSaving.value = true;
  try {
    const mutations: Promise<unknown>[] = [];
    createPayloads.forEach((payload) => {
      mutations.push(
        apolloClient.mutate({
          mutation: createDashboardSectionMutation,
          variables: {
            data: {
              ...payload,
              user: {
                id: currentUserId.value
              }
            }
          }
        })
      );
    });
    updatePayloads.forEach((payload) => {
      mutations.push(
        apolloClient.mutate({
          mutation: updateDashboardSectionMutation,
          variables: { data: payload }
        })
      );
    });
    deletions.forEach((id) => {
      mutations.push(
        apolloClient.mutate({
          mutation: deleteDashboardSectionMutation,
          variables: { id }
        })
      );
    });
    await Promise.all(mutations);
    Toast.success(t('dashboard.cards.userSections.edit.saveSuccess'));
    emit('saved');
  } catch (error) {
    handleGraphqlError(error);
  } finally {
    isSaving.value = false;
  }
};

defineExpose({
  saveSections: handleSave,
  resetSections: resetFromProps,
  isSaving,
  canSave,
  hasChanges
});
</script>

<template>
  <div class="mt-6 space-y-6 px-4">
    <div class="rounded-lg border border-primary/20 bg-primary/5 p-5">
      <h4 class="text-lg font-semibold text-gray-900">
        {{ t('dashboard.cards.userSections.edit.title') }}
      </h4>
      <p class="mt-1 text-sm text-gray-600">
        {{ t('dashboard.cards.userSections.edit.description') }}
      </p>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>{{ t('dashboard.cards.userSections.edit.hint') }}</span>
        <Button :customClass="'btn btn-primary flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide'" @click="handleAddSection">
          <Icon name="plus" class="h-4 w-4" />
          <span>{{ t('dashboard.cards.userSections.edit.addButton') }}</span>
        </Button>
      </div>
    </div>

    <VueDraggableNext
      v-if="editableSections.length"
      tag="div"
      :list="editableSections"
      class="space-y-4"
      handle=".section-drag-handle"
      ghost-class="opacity-50"
      @end="handleReorder"
    >
      <DashboardUserSectionsEditorRow
        v-for="(section, index) in editableSections"
        :key="section.clientId"
        :section="section"
        :index="index"
        :error="validationErrors[section.clientId]"
        :can-move-up="index > 0"
        :can-move-down="index < editableSections.length - 1"
        @update:title="(value) => updateSectionField(section.clientId, 'title', value)"
        @update:description="(value) => updateSectionField(section.clientId, 'description', value)"
        @delete="handleDeleteSection(section)"
        @move-up="moveSectionPosition(section.clientId, -1)"
        @move-down="moveSectionPosition(section.clientId, 1)"
      />
    </VueDraggableNext>

    <div v-else class="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
      {{ t('dashboard.cards.userSections.edit.emptyHint') }}
    </div>
  </div>
</template>
