<script setup lang="ts">
import { PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { Toggle } from '../../../../../../../shared/components/atoms/toggle';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { DashboardCard } from '../dashboard-card';
import type { DashboardSectionState } from './types';

const props = defineProps({
  sections: {
    type: Array as PropType<DashboardSectionState[]>,
    required: true
  },
  showCompleted: {
    type: Object as PropType<Record<string, boolean>>,
    required: true
  },
  hasSections: {
    type: Boolean,
    required: true
  },
  resolveCardLink: {
    type: Function as PropType<(rawUrl?: string | null) => { path: string | null; external: boolean }>,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'update-show-completed', payload: { sectionId: string; value: boolean }): void;
}>();

const { t } = useI18n();

const handleToggle = (sectionId: string, value: boolean) => {
  emit('update-show-completed', { sectionId, value });
};
</script>

<template>
  <div v-if="hasSections" class="mt-6 flex flex-col gap-4">
    <div
      v-for="section in sections"
      :key="section.id"
      class="border border-gray-200 bg-white px-6 py-5"
      style="border-radius: 0"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 class="text-lg font-semibold text-gray-900">{{ section.title }}</h4>
          <p v-if="section.description" class="text-sm text-gray-500">{{ section.description }}</p>
        </div>
        <div
          v-if="section.cards.length"
          class="flex items-center space-x-2 text-sm text-gray-500"
        >
          <span>{{ t('dashboard.cards.help.showCompletedItems') }}</span>
          <Toggle
            :model-value="showCompleted[section.id]"
            @update:modelValue="(value) => handleToggle(section.id, Boolean(value))"
          />
        </div>
      </div>

      <div
        v-if="section.cards.length"
        class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      >
        <template v-for="card in section.cards" :key="card.id">
          <div v-if="showCompleted[section.id] || card.loading || card.count !== 0">
            <DashboardCard
              :title="card.title"
              :description="card.description || ''"
              :color="card.color"
              :icon="card.icon"
              :counter="card.count"
              :hide-on-complete="!showCompleted[section.id]"
              :loading="card.loading"
              :show-loader="true"
              :url="props.resolveCardLink(card.url).path || undefined"
              :external-link="props.resolveCardLink(card.url).external"
            />
            <p v-if="card.error" class="mt-2 text-sm text-red-600">
              {{ t('dashboard.cards.userSections.cardError') }}
            </p>
          </div>
        </template>
      </div>

      <p v-else class="mt-4 text-sm text-gray-500">
        {{ t('dashboard.cards.userSections.emptySection') }}
      </p>
    </div>
  </div>

  <div v-else class="flex flex-col items-center gap-2 py-10 text-center text-gray-500">
    <Icon name="sparkles" class="h-10 w-10 text-primary" />
    <p class="text-base font-semibold text-gray-900">
      {{ t('dashboard.cards.userSections.emptyTitle') }}
    </p>
    <p class="text-sm">
      {{ t('dashboard.cards.userSections.emptySubtitle') }}
    </p>
  </div>
</template>
