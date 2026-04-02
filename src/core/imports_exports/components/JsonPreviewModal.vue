<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal } from '../../../shared/components/atoms/modal';
import { Card } from '../../../shared/components/atoms/card';
import { SecondaryButton } from '../../../shared/components/atoms/button-secondary';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  value: unknown;
}>();

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const formattedValue = computed(() => {
  try {
    return JSON.stringify(props.value ?? {}, null, 2);
  } catch (_error) {
    return String(props.value ?? '');
  }
});
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <Card class="modal-content w-full max-w-4xl">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
          <p class="mt-1 text-sm text-slate-500">{{ t('importsExports.shared.jsonViewerHint') }}</p>
        </div>
        <SecondaryButton @click="emit('update:modelValue', false)">
          {{ t('shared.button.cancel') }}
        </SecondaryButton>
      </div>

      <pre class="mt-4 max-h-[65vh] overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{{ formattedValue }}</pre>
    </Card>
  </Modal>
</template>
