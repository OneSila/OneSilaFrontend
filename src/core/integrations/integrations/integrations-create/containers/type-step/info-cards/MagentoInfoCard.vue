<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Card } from '../../../../../../../shared/components/atoms/card';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Tabs } from '../../../../../../../shared/components/molecules/tabs';

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();
const tabItems = ref([
  { name: 'instructions', label: t('integrations.create.wizard.step1.magentoInfoModal.tabs.instructions') },
  { name: 'video', label: t('integrations.create.wizard.step1.magentoInfoModal.tabs.video') },
]);
const close = () => emit('close');

</script>

<template>
  <Card class="modal-content w-[80%] px-10 pt-10">
    <div class="mb-6">
      <h3 class="text-xl font-semibold leading-7 text-gray-900">
        {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationTitle') }}
      </h3>
    </div>
    <Tabs :tabs="tabItems">
      <template #instructions>
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
      </template>
      <template #video>
        <div class="pr-2 mb=4 overflow-y-auto max-h-96">
          <div style="padding:56.25% 0 0 0;position:relative;">
            <iframe src="https://player.vimeo.com/video/1073931917?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="integrating OneSila with Magento"></iframe>
          </div>
        </div>
      </template>
    </Tabs>

    <hr/>
    <div class="flex justify-end gap-4 mt-4">
      <Button class="btn btn-outline-dark" @click="close">{{ t('shared.button.cancel') }}</Button>
    </div>
  </Card>
</template>
