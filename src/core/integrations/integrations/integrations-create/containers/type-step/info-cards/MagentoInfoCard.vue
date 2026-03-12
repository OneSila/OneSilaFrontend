<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import magentoIcon from '../../../../../../../assets/images/integration-types/icons/magento.svg';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Image } from '../../../../../../../shared/components/atoms/image';
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
  <div class="w-[min(60rem,calc(100vw-2rem))] rounded-[2rem] bg-white p-8">
    <div class="flex items-start gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Image :source="magentoIcon" :alt="t('integrations.integrationTypes.magento')" class="h-8 w-8 object-contain" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {{ t('integrations.create.wizard.step1.filters.storefronts') }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.title') }}
        </h2>
        <p class="mt-4 text-base leading-7 text-slate-600">
          {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationDescription') }}
        </p>
      </div>
    </div>

    <div class="mt-8">
      <Tabs :tabs="tabItems">
        <template #instructions>
          <div class="max-h-[65vh] space-y-5 overflow-y-auto pr-2">
            <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationTitle') }}
              </h3>
              <ul class="mt-4 space-y-3">
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationStep1') }}</span>
                </li>
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.integrationStep2') }}</span>
                </li>
              </ul>
            </section>

            <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSettingsTitle') }}
              </h3>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSettingsDescription') }}
              </p>
              <ul class="mt-4 space-y-3">
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSetting1') }}</span>
                </li>
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <span>{{ t('integrations.create.wizard.step1.magentoInfoModal.section.apiSetting2') }}</span>
                </li>
              </ul>
            </section>

            <section class="rounded-[1.5rem] border border-red-100 bg-red-50 p-5">
              <h3 class="text-lg font-semibold text-red-600">
                {{ t('integrations.create.wizard.step1.magentoInfoModal.section.legacyAuthTitle') }}
              </h3>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.magentoInfoModal.section.legacyAuthWarning') }}
              </p>
            </section>

            <div class="grid gap-5 lg:grid-cols-2">
              <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 class="text-lg font-semibold text-slate-900">
                  {{ t('integrations.create.wizard.step1.magentoInfoModal.section.importTitle') }}
                </h3>
                <p class="mt-3 text-sm leading-6 text-slate-600">
                  {{ t('integrations.create.wizard.step1.magentoInfoModal.section.importRecommendation') }}
                </p>
              </section>

              <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <h3 class="text-lg font-semibold text-slate-900">
                  {{ t('integrations.create.wizard.step1.magentoInfoModal.section.eanTitle') }}
                </h3>
                <p class="mt-3 text-sm leading-6 text-slate-600">
                  {{ t('integrations.create.wizard.step1.magentoInfoModal.section.eanDescription') }}
                </p>
              </section>
            </div>
          </div>
        </template>

        <template #video>
          <div class="max-h-[65vh] overflow-y-auto pr-2">
            <div class="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
              <div style="padding:56.25% 0 0 0;position:relative;">
                <iframe src="https://player.vimeo.com/video/1073931917?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="integrating OneSila with Magento"></iframe>
              </div>
            </div>
          </div>
        </template>
      </Tabs>
    </div>

    <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button class="btn btn-outline-dark" @click="close">
        {{ t('shared.button.cancel') }}
      </Button>
    </div>
  </div>
</template>
