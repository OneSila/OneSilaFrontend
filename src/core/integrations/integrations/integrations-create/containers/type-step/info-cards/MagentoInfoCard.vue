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
        {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationTitle') }}
      </h3>
    </div>
    <div class="space-y-6 pr-2 mb=4 overflow-y-auto max-h-96">
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationDescription') }}
        </p>
        <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
          <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationStep1') }}</li>
          <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationStep2') }}</li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSettingsTitle') }}</h4>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSettingsDescription') }}
        </p>
        <ul class="list-disc list-inside text-sm text-gray-700 mt-2">
          <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSetting1') }}</li>
          <li>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSetting2') }}</li>
        </ul>
      </div>

      <div>
        <h4 class="text-lg font-semibold text-red-500">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.legacyAuthTitle') }}</h4>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.section.legacyAuthWarning') }}
        </p>
      </div>

      <div>
        <h4 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.importTitle') }}</h4>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.section.importRecommendation') }}
        </p>
      </div>

      <div>
        <h4 class="text-lg font-semibold">{{ t('integrations.create.wizard.step1.magentoInfoModal.section.eanTitle') }}</h4>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.section.eanDescription') }}
        </p>
      </div>
    </div>

    <hr/>
    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="close">{{ t('shared.button.cancel') }}</Button>
    </div>
  </Card>
</template>
