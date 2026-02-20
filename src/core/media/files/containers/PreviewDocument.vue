<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Modal } from "../../../../shared/components/atoms/modal";
import { Card } from "../../../../shared/components/atoms/card";

const props = defineProps<{
  modelValue: boolean;
  documentUrl?: string | null;
  documentName?: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const { t } = useI18n();

const localVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const closeModal = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <Modal v-model="localVisible" @closed="closeModal">
    <Card class="modal-content w-[90vw] max-w-6xl">
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-xl font-semibold leading-7 text-gray-900">
          {{ t('shared.labels.preview') }}<span v-if="documentName"> - {{ documentName }}</span>
        </h3>
      </div>
      <div class="h-[80vh]">
        <iframe
          v-if="documentUrl"
          :src="documentUrl"
          class="h-full w-full rounded-md border border-gray-300"
          frameborder="0"
        />
      </div>
    </Card>
  </Modal>
</template>
