<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Button } from '../../../../../../../shared/components/atoms/button';

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();
const close = () => emit('close');
</script>

<template>
  <Card class="modal-content w-[80%] px-10 pt-10">
    <div class="mb-6">
      <h3 class="text-xl font-semibold leading-7 text-gray-900">
        {{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationTitle') }}
      </h3>
    </div>
    <div class="space-y-6 pr-2 mb=4 overflow-y-auto max-h-96">
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationDescription') }}
        </p>
        <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep1') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep2') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep3') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep4') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep5') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep6') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep7') }}</li>
          <li>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep8') }}</li>
        </ul>
      </div>
    </div>

    <hr/>
    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="close">{{ t('shared.button.cancel') }}</Button>
    </div>
  </Card>
</template>
