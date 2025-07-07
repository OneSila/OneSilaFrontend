<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Toast } from '../../../../../../../shared/modules/toast';

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();
const close = () => emit('close');

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    Toast.success(t('shared.alert.toast.clipboardSuccess'));
  } catch (err) {
    console.error('Failed to copy:', err);
    Toast.error(t('shared.alert.toast.clipboardFail'));
  }
};
</script>

<template>
  <Card class="modal-content w-[80%] px-10 pt-10">
    <div class="mb-6">
      <h3 class="text-xl font-semibold leading-7 text-gray-900">
        {{ t('integrations.create.wizard.step1.shopifyInfoModal.title') }}
      </h3>
    </div>
    <div class="space-y-8 pr-2 mb-4 overflow-y-auto max-h-96">
      <!-- Step 1 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep1') }}
        </p>
      </div>

      <!-- Step 2 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep2') }}
        </p>
      </div>

      <!-- Step 3 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep3') }}
        </p>
      </div>

      <!-- Step 4 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep4') }}
        </p>
      </div>

      <!-- Step 5 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5') }}
        </p>
      </div>

      <!-- Step 6 with URLs -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep6') }}
        </p>
        <div class="mt-2 space-y-2">
          <label class="text-sm font-semibold block text-gray-900">
            {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.appUrlLabel') }}
          </label>
          <div class="relative mt-1 rounded-lg shadow-sm">
            <input disabled type="text" value="https://onesila.app/integrations/shopify/entry" class="w-full rounded-lg border-0 py-1.5 pl-2 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <Button @click="copyToClipboard('https://onesila.app/integrations/shopify/entry')" class="ml-4 flex-shrink-0">
                <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <label class="text-sm font-semibold block text-gray-900">
            {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.allowedRedirectUrlLabel') }}
          </label>
          <div class="relative mt-1 rounded-lg shadow-sm">
            <input disabled type="text" value="https://onesila.app/integrations/shopify/installed" class="w-full rounded-lg border-0 py-1.5 pl-2 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <Button @click="copyToClipboard('https://onesila.app/integrations/shopify/installed')" class="ml-4 flex-shrink-0">
                <Icon name="clipboard" class="h-5 w-5 text-gray-500" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 7 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep7') }}
        </p>
      </div>

      <!-- Step 8 -->
      <div>
        <p class="text-sm text-gray-700">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep8') }}
        </p>
      </div>
    </div>

    <hr />
    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="close">{{ t('shared.button.cancel') }}</Button>
    </div>
  </Card>
</template>
