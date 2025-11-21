<script setup lang="ts">
import { computed, PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueDraggableNext } from 'vue-draggable-next';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../shared/modules/toast';
import apolloClient from '../../../../../../../../apollo-client';
import {
  deleteDashboardCardMutation,
  updateDashboardCardMutation
} from '../../../../../../../shared/api/mutations/dashboard.js';
import type { EditableDashboardSection, EditableDashboardCard } from './types';

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

const handleDescriptionInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null;
  emit('update:description', target?.value || '');
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
    <template v-if="!cardEditorActive">
      <div class="flex flex-wrap items-start justify-between gap-3 rounded-md px-3 py-2">
        <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
          <span>{{ t('dashboard.cards.userSections.edit.sectionLabel', { position: index + 1 }) }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <button
            type="button"
            class="btn btn-outline-primary p-2 rounded-full section-drag-handle cursor-move flex items-center justify-center"
          >
            <span class="sr-only">{{ t('dashboard.cards.userSections.edit.dragHandle') }}</span>
            <Icon name="arrows-up-down-left-right" class="h-4 w-4" />
          </button>
          <Button
            :disabled="!canMoveUp"
            :customClass="'btn btn-outline-primary p-2 rounded-full'"
            @click="handleMoveUp"
          >
            <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveUp') }}</span>
            <Icon name="arrow-up" class="h-4 w-4" />
          </Button>
          <Button
            :disabled="!canMoveDown"
            :customClass="'btn btn-outline-primary p-2 rounded-full'"
            @click="handleMoveDown"
          >
            <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveDown') }}</span>
            <Icon name="arrow-down" class="h-4 w-4" />
          </Button>
          <Button :customClass="'btn btn-outline-primary p-2 rounded-full'" @click="openCardEditor">
            <span class="sr-only">{{ t('dashboard.cards.userSections.edit.configure') }}</span>
            <Icon name="cog" class="h-4 w-4" />
          </Button>
          <Button :customClass="'btn btn-danger p-2 rounded-full'" @click="handleDelete">
            <span class="sr-only">{{ t('dashboard.cards.userSections.edit.deleteButton') }}</span>
            <Icon name="trash" class="h-4 w-4" />
          </Button>
        </div>
      </div>
      <hr class="mt-3 border-gray-200" />

      <div class="mt-4 grid gap-4 md:grid-cols-4">
        <div class="w-full md:col-span-2">
          <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('dashboard.cards.userSections.edit.titleLabel') }}
          </label>
          <TextInput
            class="w-full mt-4"
            :model-value="section.title"
            :error="Boolean(error)"
            :placeholder="t('dashboard.cards.userSections.edit.titlePlaceholder')"
            @update:modelValue="handleTitleInput"
          />
          <p v-if="error" class="mt-1 text-xs text-red-500">
            {{ error }}
          </p>
        </div>
        <div class="w-full md:col-span-2">
          <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {{ t('dashboard.cards.userSections.edit.descriptionLabel') }}
          </label>
          <textarea
            :value="section.description || ''"
            rows="3"
            class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            :placeholder="t('dashboard.cards.userSections.edit.descriptionPlaceholder')"
            @input="handleDescriptionInput"
          ></textarea>
        </div>
      </div>
    </template>

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
        <div
          v-for="(card, cardIndex) in cardDrafts"
          :key="card.clientId"
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span
                class="h-3 w-3 rounded-full"
                :class="colorOptions.find((opt) => opt.value === card.color)?.swatchClass"
              ></span>
              <p class="text-sm font-semibold text-gray-800">
                {{ card.title || t('dashboard.cards.userSections.edit.cards.titlePlaceholder', { index: cardIndex + 1 }) }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <Button
                :customClass="'btn btn-outline-primary p-2 rounded-full card-drag-handle flex items-center justify-center'"
              >
                <span class="sr-only">{{ t('dashboard.cards.userSections.edit.cards.dragHandle') }}</span>
                <Icon name="arrows-up-down-left-right" class="h-4 w-4" />
              </Button>
              <Button
                :disabled="cardIndex === 0"
                :customClass="'btn btn-outline-primary p-2 rounded-full'"
                @click="moveCardPosition(card.clientId, -1)"
              >
                <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveUp') }}</span>
                <Icon name="arrow-up" class="h-4 w-4" />
              </Button>
              <Button
                :disabled="cardIndex === cardDrafts.length - 1"
                :customClass="'btn btn-outline-primary p-2 rounded-full'"
                @click="moveCardPosition(card.clientId, 1)"
              >
                <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveDown') }}</span>
                <Icon name="arrow-down" class="h-4 w-4" />
              </Button>
              <Button :customClass="'btn btn-danger p-2 rounded-full'" @click="handleCardDelete(card)">
                <span class="sr-only">{{ t('dashboard.cards.userSections.edit.cards.deleteButton') }}</span>
                <Icon name="trash" class="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {{ t('dashboard.cards.userSections.edit.cards.titleLabel') }}
              </label>
              <TextInput
                class="w-full mt-4"
                :model-value="card.title"
                :placeholder="t('dashboard.cards.userSections.edit.cards.titlePlaceholder', { index: cardIndex + 1 })"
                @update:modelValue="(value) => updateCardField(card.clientId, 'title', value)"
              />
            </div>
            <div>
              <label class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {{ t('dashboard.cards.userSections.edit.cards.descriptionLabel') }}
              </label>
              <textarea
                :value="card.description || ''"
                rows="3"
                class="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                :placeholder="t('dashboard.cards.userSections.edit.cards.descriptionPlaceholder')"
                @input="(event) => updateCardField(card.clientId, 'description', (event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </div>
          </div>

          <div class="mt-4">
            <span class="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {{ t('dashboard.cards.userSections.edit.cards.colorLabel') }}
            </span>
            <div class="mt-2 flex flex-wrap gap-3">
              <button
                v-for="option in colorOptions"
                :key="option.value"
                type="button"
                class="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                :class="card.color === option.value ? 'border-primary text-primary' : 'border-gray-200 text-gray-500'"
                @click="updateCardColor(card.clientId, option.value)"
              >
                <span :class="['h-3 w-3 rounded-full', option.swatchClass]"></span>
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </VueDraggableNext>

      <div v-else class="mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-center text-sm text-gray-500">
        {{ t('dashboard.cards.userSections.edit.cards.emptyState') }}
      </div>
    </template>
  </div>
</template>
