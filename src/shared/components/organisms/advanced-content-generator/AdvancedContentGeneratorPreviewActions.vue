<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../atoms/button';

const props = defineProps<{
  saving: boolean;
  hasPending: boolean;
  hasLimitIssues: boolean;
}>();

const emit = defineEmits<{
  (e: 'approve-next'): void;
  (e: 'reject-next'): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}>();

const { t } = useI18n();

const disableSave = computed(() => props.saving || props.hasPending || props.hasLimitIssues);
</script>

<template>
  <div class="space-y-3">
    <hr class="border-gray-200" />
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <Button class="btn btn-success" :disabled="props.saving" @click="emit('approve-next')">
          {{ t('shared.components.organisms.advancedContentGenerator.approveNext') }}
        </Button>
        <Button class="btn btn-outline-danger" :disabled="props.saving" @click="emit('reject-next')">
          {{ t('shared.components.organisms.advancedContentGenerator.rejectNext') }}
        </Button>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Button class="btn btn-outline-dark" :disabled="props.saving" @click="emit('cancel')">
          {{ t('shared.button.cancel') }}
        </Button>
        <Button class="btn btn-primary" :disabled="disableSave" @click="emit('save')">
          {{ t('shared.components.organisms.advancedContentGenerator.saveApproved') }}
        </Button>
      </div>
    </div>

    <div v-if="props.hasPending" class="text-xs text-orange-600">
      {{ t('shared.components.organisms.advancedContentGenerator.pendingWarning') }}
    </div>
    <div v-if="props.hasLimitIssues" class="text-xs text-red-500">
      {{ t('shared.components.organisms.advancedContentGenerator.limitWarning') }}
    </div>
  </div>
</template>
