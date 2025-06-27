<script setup lang="ts">
import { Ref, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card } from "../../../../../../../../../shared/components/atoms/card";
import { Button } from "../../../../../../../../../shared/components/atoms/button";
import { Modal } from "../../../../../../../../../shared/components/atoms/modal";
import { Loader } from "../../../../../../../../../shared/components/atoms/loader";

export interface FormattedIssue {
  message?: string | null;
  severity?: string | null;
}

const props = defineProps<{ modelValue: boolean; issues?: FormattedIssue[] | null }>();
const emit = defineEmits(['modal-closed']);
const localShowModal = ref(props.modelValue);
const issues: Ref<FormattedIssue[]> = ref(props.issues ?? []);
const { t } = useI18n();

watch(() => props.modelValue, (newVal) => {
  localShowModal.value = newVal;
  if (newVal && props.issues) {
    issues.value = props.issues;
  }
});

const loading = ref(false);

const closeModal = () => {
  localShowModal.value = false;
  emit('modal-closed');
};
</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Loader :loading="loading" />
      <Card class="modal-content w-[90%]">
        <div class="mb-6">
          <h3 class="text-xl font-semibold leading-7 text-gray-900">
            {{ t('integrations.salesChannel.modal.issues.title') }}
          </h3>
        </div>
        <ul class="space-y-2 max-h-96 overflow-y-auto">
          <li v-for="(issue, index) in issues" :key="index" class="flex justify-between">
            <span class="break-words">{{ issue.message }}</span>
            <span class="font-semibold capitalize ml-4">{{ issue.severity }}</span>
          </li>
        </ul>
        <hr />
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>
