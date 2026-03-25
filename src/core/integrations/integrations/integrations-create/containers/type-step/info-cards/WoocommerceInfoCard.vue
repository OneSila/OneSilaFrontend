<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import woocommerceIcon from '../../../../../../../assets/images/integration-types/icons/woocommerce.svg';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Image } from '../../../../../../../shared/components/atoms/image';

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();

const close = () => emit('close');
</script>

<template>
  <div class="w-[min(56rem,calc(100vw-2rem))] rounded-[2rem] bg-white p-8">
    <div class="flex items-start gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Image :source="woocommerceIcon" :alt="t('integrations.integrationTypes.woocommerce')" class="h-8 w-8 object-contain scale-125" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {{ t('integrations.create.wizard.step1.filters.storefronts') }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.woocommerceInfoModal.title') }}
        </h2>
        <p class="mt-4 text-base leading-7 text-slate-600">
          {{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationDescription') }}
        </p>
      </div>
    </div>

    <div class="mt-8 max-h-[65vh] space-y-5 overflow-y-auto pr-2">
      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationTitle') }}
        </h3>

        <ol class="mt-4 space-y-3">
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">1</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep1') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">2</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep2') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">3</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep3') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">4</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep4') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">5</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep5') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">6</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep6') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">7</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep7') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-900 shadow-sm">8</span>
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.integrationStep8') }}</span>
          </li>
        </ol>
      </section>

      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSettingsTitle') }}
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSettingsDescription') }}
        </p>
        <ul class="mt-4 space-y-3">
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSetting1') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span>{{ t('integrations.create.wizard.step1.woocommerceInfoModal.apiSetting2') }}</span>
          </li>
        </ul>
      </section>

      <div class="grid gap-5 lg:grid-cols-2">
        <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <h3 class="text-lg font-semibold text-slate-900">
            {{ t('integrations.create.wizard.step1.woocommerceInfoModal.importTitle') }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            {{ t('integrations.create.wizard.step1.woocommerceInfoModal.importRecommendation') }}
          </p>
        </section>

        <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
          <h3 class="text-lg font-semibold text-slate-900">
            {{ t('integrations.create.wizard.step1.woocommerceInfoModal.eanTitle') }}
          </h3>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            {{ t('integrations.create.wizard.step1.woocommerceInfoModal.eanDescription') }}
          </p>
        </section>
      </div>
    </div>

    <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button class="btn btn-outline-dark" @click="close">
        {{ t('shared.button.cancel') }}
      </Button>
    </div>
  </div>
</template>
