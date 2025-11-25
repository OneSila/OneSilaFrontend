<script setup lang="ts">
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import type { EditableDashboardSection } from './types';

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
  (e: 'open-card-editor'): void;
}>();

const { t } = useI18n();

const handleDescriptionInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null;
  emit('update:description', target?.value || '');
};
</script>

<template>
  <div>
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
          @click="$emit('move-up')"
        >
          <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveUp') }}</span>
          <Icon name="arrow-up" class="h-4 w-4" />
        </Button>
        <Button
          :disabled="!canMoveDown"
          :customClass="'btn btn-outline-primary p-2 rounded-full'"
          @click="$emit('move-down')"
        >
          <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveDown') }}</span>
          <Icon name="arrow-down" class="h-4 w-4" />
        </Button>
        <Button :customClass="'btn btn-outline-primary p-2 rounded-full'" @click="$emit('open-card-editor')">
          <span class="sr-only">{{ t('dashboard.cards.userSections.edit.configure') }}</span>
          <Icon name="cog" class="h-4 w-4" />
        </Button>
        <Button :customClass="'btn btn-danger p-2 rounded-full'" @click="$emit('delete')">
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
          @update:modelValue="(value) => $emit('update:title', value)"
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
  </div>
</template>
