<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../shared/modules/toast';
import apolloClient from '../../../../../../../../apollo-client';
import {
  deleteDashboardCardMutation,
  updateDashboardCardMutation
} from '../../../../../../../shared/api/mutations/dashboard.js';
import type { EditableDashboardSection, EditableDashboardCard } from './types';
import DashboardUserSectionsSectionRow from './DashboardUserSectionsSectionRow.vue';
import DashboardUserSectionsCardRow from './DashboardUserSectionsCardRow.vue';

const props = defineProps({
  section: {
    type: Object as PropType<EditableDashboardSection>,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  canMoveUp: {
    type: Boolean,
    default: true
  },
  canMoveDown: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits<{
  (e: 'update:title', value: string): void;
  (e: 'update:description', value: string): void;
  (e: 'delete'): void;
  (e: 'move-up'): void;
  (e: 'move-down'): void;
}>();

const { t } = useI18n();

const cardEditorActive = ref(false);
const cardDrafts = ref<EditableDashboardCard[]>([]);
const initialCardSnapshot = ref<EditableDashboardCard[]>([]);
const cardDeletionIds = ref<string[]>([]);
const cardSaving = ref(false);

const colorOptions = computed(() => [
  { value: 'red' as const, label: t('generalListing.modal.colors.red'), swatchClass: 'bg-red-500' },
  { value: 'orange' as const, label: t('generalListing.modal.colors.orange'), swatchClass: 'bg-orange-500' },
  { value: 'yellow' as const, label: t('generalListing.modal.colors.yellow'), swatchClass: 'bg-yellow-400' }
]);

const colorToGraphqlMap: Record<'red' | 'orange' | 'yellow', string> = {
  red: 'RED',
  orange: 'ORANGE',
  yellow: 'YELLOW'
};

const dragHandleOptions: SweetAlertOptions = {
  title: t('dashboard.cards.userSections.edit.cards.deleteTitle'),
  text: t('dashboard.cards.userSections.edit.cards.deleteText'),
  confirmButtonText: t('dashboard.cards.userSections.edit.deleteConfirmConfirm'),
  cancelButtonText: t('dashboard.cards.userSections.edit.deleteConfirmCancel'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em'
};

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    popup: 'sweet-alerts',
    confirmButton: 'btn btn-danger',
    cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3'
  },
  buttonsStyling: false
});

const sanitize = (value: string | null | undefined) => value?.trim() || '';

const syncCardDrafts = () => {
  const snapshot = (props.section.cards ?? []).map((card, index) => ({
    ...card,
    description: card.description ?? '',
    sortOrder: typeof card.sortOrder === 'number' ? card.sortOrder : index,
    clientId: card.clientId ?? card.id,
    persistedId: card.persistedId ?? card.id
  }));
  cardDrafts.value = snapshot.map((card) => ({ ...card }));
  initialCardSnapshot.value = snapshot.map((card) => ({ ...card }));
  cardDeletionIds.value = [];
};

syncCardDrafts();

watch(
  () => props.section.cards,
  () => {
    if (!cardEditorActive.value) {
      syncCardDrafts();
    }
  },
  { deep: true }
);

const handleTitleInput = (value: string) => {
  emit('update:title', value);
};

const handleDescriptionInput = (value: string) => {
  emit('update:description', value);
};

const handleDelete = () => {
  emit('delete');
};

const handleMoveUp = () => {
  emit('move-up');
};

const handleMoveDown = () => {
  emit('move-down');
};

const openCardEditor = () => {
  syncCardDrafts();
  cardEditorActive.value = true;
};

const closeCardEditor = () => {
  if (hasCardChanges.value) {
    void confirmLeaveCards();
  } else {
    cardEditorActive.value = false;
    syncCardDrafts();
  }
};

const updateCardField = (clientId: string, field: 'title' | 'description', value: string) => {
  const target = cardDrafts.value.find((card) => card.clientId === clientId);
  if (!target) {
    return;
  }
  if (field === 'title') {
    target.title = value;
  } else {
    target.description = value;
  }
};

const updateCardColor = (clientId: string, color: 'red' | 'orange' | 'yellow') => {
  const target = cardDrafts.value.find((card) => card.clientId === clientId);
  if (!target) {
    return;
  }
  target.color = color;
};

const moveCardPosition = (clientId: string, offset: number) => {
  const index = cardDrafts.value.findIndex((card) => card.clientId === clientId);
  if (index === -1) {
    return;
  }
  const newIndex = index + offset;
  if (newIndex < 0 || newIndex >= cardDrafts.value.length) {
    return;
  }
  const [card] = cardDrafts.value.splice(index, 1);
  cardDrafts.value.splice(newIndex, 0, card);
  cardDrafts.value.forEach((entry, position) => {
    entry.sortOrder = position;
  });
};

const handleCardDragEnd = () => {
  cardDrafts.value.forEach((card, index) => {
    card.sortOrder = index;
  });
};

const handleCardDelete = async (card: EditableDashboardCard) => {
  const result = await swalWithBootstrapButtons.fire(dragHandleOptions);
  if (!result.isConfirmed) {
    return;
  }
  if (card.persistedId) {
    cardDeletionIds.value = [...cardDeletionIds.value, card.persistedId];
  }
  cardDrafts.value = cardDrafts.value.filter((entry) => entry.clientId !== card.clientId);
  cardDrafts.value.forEach((entry, index) => {
    entry.sortOrder = index;
  });
};

const initialCardIndexMap = computed(() => {
  const map = new Map<string | null, number>();
  initialCardSnapshot.value.forEach((card, index) => {
    map.set(card.persistedId, index);
  });
  return map;
});

const hasCardChanges = computed(() => {
  if (cardDeletionIds.value.length > 0) {
    return true;
  }
  if (cardDrafts.value.length !== initialCardSnapshot.value.length - cardDeletionIds.value.length) {
    return true;
  }
  const initialMap = new Map(
    initialCardSnapshot.value.map((card) => [card.persistedId, card])
  );
  return cardDrafts.value.some((card, index) => {
    const original = card.persistedId ? initialMap.get(card.persistedId) : null;
    if (!original) {
      return true;
    }
    return (
      sanitize(card.title) !== sanitize(original.title) ||
      sanitize(card.description) !== sanitize(original.description) ||
      card.color !== original.color ||
      index !== (initialCardIndexMap.value.get(card.persistedId) ?? index)
    );
  });
});

const handleSaveCards = async () => {
  if (!hasCardChanges.value || cardSaving.value) {
    return;
  }
  cardSaving.value = true;
  try {
    const initialMap = new Map(
      initialCardSnapshot.value.map((card) => [card.persistedId, card])
    );
    const updates = cardDrafts.value
      .filter((card) => card.persistedId)
      .map((card, index) => ({
        id: card.persistedId as string,
        title: sanitize(card.title),
        description: sanitize(card.description) || null,
        color: colorToGraphqlMap[card.color],
        sortOrder: index
      }))
      .filter((payload, index) => {
        const original = initialMap.get(payload.id);
        if (!original) {
          return true;
        }
        return (
          payload.title !== sanitize(original.title) ||
          (payload.description || '') !== sanitize(original.description) ||
          payload.color !== colorToGraphqlMap[original.color] ||
          index !== (initialCardIndexMap.value.get(original.persistedId) ?? index)
        );
      });

    const mutations: Promise<unknown>[] = [];
    updates.forEach((payload) => {
      mutations.push(
        apolloClient.mutate({
          mutation: updateDashboardCardMutation,
          variables: { data: payload }
        })
      );
    });
    cardDeletionIds.value.forEach((id) => {
      mutations.push(
        apolloClient.mutate({
          mutation: deleteDashboardCardMutation,
          variables: { id }
        })
      );
    });

    await Promise.all(mutations);

    props.section.cards.splice(
      0,
      props.section.cards.length,
      ...cardDrafts.value.map((card, index) => ({
        ...card,
        sortOrder: index,
        id: card.persistedId || card.id
      }))
    );
    initialCardSnapshot.value = cardDrafts.value.map((card) => ({ ...card }));
    cardDeletionIds.value = [];
    Toast.success(t('dashboard.cards.userSections.edit.cards.saveSuccess'));
  } catch (error) {
    Toast.error(t('dashboard.cards.userSections.edit.cards.saveError'));
    console.error(error);
  } finally {
    cardSaving.value = false;
    cardEditorActive.value = false;
  }
};

const unsavedCardsSwalOptions: SweetAlertOptions = {
  title: t('dashboard.cards.userSections.edit.cards.unsavedTitle'),
  text: t('dashboard.cards.userSections.edit.cards.unsavedText'),
  confirmButtonText: t('dashboard.cards.userSections.edit.cards.unsavedConfirm'),
  cancelButtonText: t('dashboard.cards.userSections.edit.cards.unsavedCancel'),
  icon: 'warning',
  showCancelButton: true,
  reverseButtons: true,
  padding: '2em'
};

const confirmLeaveCards = async () => {
  const result = await swalWithBootstrapButtons.fire(unsavedCardsSwalOptions);
  if (!result.isConfirmed) {
    return;
  }
  cardEditorActive.value = false;
  syncCardDrafts();
};
</script>

<template>
  <div class="px-4 py-5 border border-gray-200 bg-white rounded-lg shadow-sm">
    <DashboardUserSectionsSectionRow
      v-if="!cardEditorActive"
      :section="section"
      :index="index"
      :error="error"
      :can-move-up="canMoveUp"
      :can-move-down="canMoveDown"
      @update:title="handleTitleInput"
      @update:description="handleDescriptionInput"
      @delete="handleDelete"
      @move-up="handleMoveUp"
      @move-down="handleMoveDown"
      @open-card-editor="openCardEditor"
    />

    <template v-else>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-gray-600">
            {{ t('dashboard.cards.userSections.edit.sectionLabel', { position: index + 1 }) }}
          </p>
          <p class="text-xs text-gray-500">
            {{ t('dashboard.cards.userSections.edit.cards.subtitle', { count: cardDrafts.length }) }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <Button :customClass="'btn btn-outline-primary flex items-center gap-2 px-3 py-2'" @click="closeCardEditor">
            <Icon name="arrow-left" class="h-4 w-4" />
            <span>{{ t('dashboard.cards.userSections.edit.cards.backButton') }}</span>
          </Button>
          <Button
            :disabled="!hasCardChanges || cardSaving"
            :customClass="'btn btn-primary flex items-center gap-2 px-3 py-2'"
            @click="handleSaveCards"
          >
            <Icon name="floppy-disk" class="h-4 w-4" />
            <span>{{ t('dashboard.cards.userSections.edit.cards.saveButton') }}</span>
          </Button>
        </div>
      </div>

      <VueDraggableNext
        v-if="cardDrafts.length"
        tag="div"
        :list="cardDrafts"
        class="mt-4 space-y-4"
        handle=".card-drag-handle"
        ghost-class="opacity-50"
        @end="handleCardDragEnd"
      >
        <DashboardUserSectionsCardRow
          v-for="(card, cardIndex) in cardDrafts"
          :key="card.clientId"
          :card="card"
          :card-index="cardIndex"
          :total-cards="cardDrafts.length"
          :color-options="colorOptions"
          @move-up="moveCardPosition(card.clientId, -1)"
          @move-down="moveCardPosition(card.clientId, 1)"
          @update:title="(value) => updateCardField(card.clientId, 'title', value)"
          @update:description="(value) => updateCardField(card.clientId, 'description', value)"
          @update:color="(value) => updateCardColor(card.clientId, value)"
          @delete="handleCardDelete(card)"
        />
      </VueDraggableNext>

      <div v-else class="mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
        {{ t('dashboard.cards.userSections.edit.cards.emptyState') }}
      </div>
    </template>
  </div>
</template>
