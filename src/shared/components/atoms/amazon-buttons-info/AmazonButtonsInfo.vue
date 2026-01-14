<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../button';
import { Icon } from '../icon';
import { Modal } from '../modal';
import {Card} from "../card";

type AmazonActionKey = 'import' | 'fullUpdate' | 'resync' | 'validate' | 'fetchIssues';

const props = withDefaults(
  defineProps<{
    actions?: AmazonActionKey[];
    buttonClass?: string;
    iconClass?: string;
    titleKey?: string;
    subtitleKey?: string;
  }>(),
  {
    actions: () => ['import', 'fullUpdate', 'resync', 'validate', 'fetchIssues'],
    buttonClass: 'btn btn-sm btn-outline-primary',
    iconClass: 'text-gray-600',
    titleKey: 'integrations.amazon.actionsInfo.title',
    subtitleKey: 'integrations.amazon.actionsInfo.subtitle',
  }
);

const { t } = useI18n();
const showModal = ref(false);

const actionLabelKey = (action: AmazonActionKey) =>
  `integrations.amazon.actionsInfo.items.${action}.label`;
const actionDescriptionKey = (action: AmazonActionKey) =>
  `integrations.amazon.actionsInfo.items.${action}.description`;

const openModal = () => {
  showModal.value = true;
};
</script>

<template>
  <div>
    <Icon @click.stop.prevent="openModal" name="info-circle" size="lg" :class="iconClass" class="cursor-pointer" />

    <Modal v-model="showModal" @closed="showModal = false">
      <Card class="p-4 sm:p-6">
        <h4 class="text-lg font-semibold text-gray-900">
          {{ t(titleKey) }}
        </h4>
        <p class="mt-1 text-sm text-gray-500">
          {{ t(subtitleKey) }}
        </p>
        <ul class="mt-4 space-y-3 text-sm text-gray-600">
          <li v-for="action in actions" :key="action">
            <div class="font-semibold text-gray-900">
              {{ t(actionLabelKey(action)) }}
            </div>
            <div class="text-gray-600">
              {{ t(actionDescriptionKey(action)) }}
            </div>
          </li>
        </ul>
      </Card>
    </Modal>
  </div>
</template>
