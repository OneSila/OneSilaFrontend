<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Modal } from '../../../../../shared/components/atoms/modal';
import { Card } from '../../../../../shared/components/atoms/card';
import { TextInput } from '../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../shared/components/atoms/button';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'duplicate', sku: string | null): void;
}>();

const { t } = useI18n();
const localShowModal = ref(props.modelValue);
const sku = ref('');

watch(() => props.modelValue, (val) => {
  localShowModal.value = val;
});

const closeModal = () => {
  localShowModal.value = false;
  emit('update:modelValue', false);
};

const submit = () => {
  emit('duplicate', sku.value.trim() === '' ? null : sku.value.trim());
  closeModal();
};
</script>

<template>
  <div>
    <Modal v-model="localShowModal" @closed="closeModal">
      <Card class="modal-content w-1/3">
        <h3 class="text-xl font-semibold text-center mb-4">{{ t('shared.button.duplicate') }}</h3>
        <p class="mb-4">{{ t('products.products.duplicateModal.description') }}</p>
        <TextInput v-model="sku" :placeholder="t('products.products.labels.sku')" class="w-full" />
        <div class="flex justify-end gap-4 mt-4">
          <Button class="btn btn-outline-dark" @click="closeModal">{{ t('shared.button.cancel') }}</Button>
          <Button class="btn btn-primary" @click="submit">{{ t('shared.button.duplicate') }}</Button>
        </div>
      </Card>
    </Modal>
  </div>
</template>
