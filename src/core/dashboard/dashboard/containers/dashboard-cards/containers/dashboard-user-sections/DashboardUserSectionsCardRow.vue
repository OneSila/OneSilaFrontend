<script setup lang="ts">
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { TextInput } from '../../../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import type { EditableDashboardCard } from './types';

type ColorOption = {
  value: 'red' | 'orange' | 'yellow';
  label: string;
  swatchClass: string;
};

const props = defineProps({
  card: {
    type: Object as PropType<EditableDashboardCard>,
    required: true
  },
  cardIndex: {
    type: Number,
    required: true
  },
  totalCards: {
    type: Number,
    required: true
  },
  colorOptions: {
    type: Array as PropType<ColorOption[]>,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'move-up'): void;
  (e: 'move-down'): void;
  (e: 'update:title', value: string): void;
  (e: 'update:description', value: string): void;
  (e: 'update:color', value: 'red' | 'orange' | 'yellow'): void;
  (e: 'delete'): void;
}>();

const { t } = useI18n();

const handleDescriptionInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement | null;
  emit('update:description', target?.value || '');
};
</script>

<template>
  <div class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="h-3 w-3 rounded-full" :class="colorOptions.find((opt) => opt.value === card.color)?.swatchClass"></span>
        <p class="text-sm font-semibold text-gray-800">
          {{ card.title || t('dashboard.cards.userSections.edit.cards.titlePlaceholder', { index: cardIndex + 1 }) }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Button :customClass="'btn btn-outline-primary p-2 rounded-full card-drag-handle flex items-center justify-center'">
          <span class="sr-only">{{ t('dashboard.cards.userSections.edit.cards.dragHandle') }}</span>
          <Icon name="arrows-up-down-left-right" class="h-4 w-4" />
        </Button>
        <Button
          :disabled="cardIndex === 0"
          :customClass="'btn btn-outline-primary p-2 rounded-full'"
          @click="$emit('move-up')"
        >
          <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveUp') }}</span>
          <Icon name="arrow-up" class="h-4 w-4" />
        </Button>
        <Button
          :disabled="cardIndex === totalCards - 1"
          :customClass="'btn btn-outline-primary p-2 rounded-full'"
          @click="$emit('move-down')"
        >
          <span class="sr-only">{{ t('dashboard.cards.userSections.edit.moveDown') }}</span>
          <Icon name="arrow-down" class="h-4 w-4" />
        </Button>
        <Button :customClass="'btn btn-danger p-2 rounded-full'" @click="$emit('delete')">
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
          @update:modelValue="(value) => $emit('update:title', value)"
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
          @input="handleDescriptionInput"
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
          @click="$emit('update:color', option.value)"
        >
          <span :class="['h-3 w-3 rounded-full', option.swatchClass]"></span>
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
