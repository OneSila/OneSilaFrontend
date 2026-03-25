<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import shopifyIcon from '../../../../../../../assets/images/integration-types/icons/shopify.svg';
import step2Image from '../../../../../../../assets/images/integrations/info/shopify/step2.png';
import step3Image from '../../../../../../../assets/images/integrations/info/shopify/step3.png';
import step4Image from '../../../../../../../assets/images/integrations/info/shopify/step4.png';
import step5Image1 from '../../../../../../../assets/images/integrations/info/shopify/step5-1.png';
import step5Image2 from '../../../../../../../assets/images/integrations/info/shopify/step5-2.png';
import step6Image from '../../../../../../../assets/images/integrations/info/shopify/step-6.png';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Image } from '../../../../../../../shared/components/atoms/image';

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();

const close = () => emit('close');
</script>

<template>
  <div class="w-[min(64rem,calc(100vw-2rem))] rounded-[2rem] bg-white p-8">
    <div class="flex items-start gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Image :source="shopifyIcon" :alt="t('integrations.integrationTypes.shopify')" class="h-8 w-8 object-contain" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {{ t('integrations.create.wizard.step1.filters.storefronts') }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.title') }}
        </h2>
        <p class="mt-4 text-base leading-7 text-slate-600">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationDescription') }}
        </p>
      </div>
    </div>

    <div class="mt-8 max-h-[65vh] space-y-5 overflow-y-auto pr-2">
      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.customAppTitle') }}
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep1') }}
        </p>

        <div class="mt-4 space-y-3">
          <p class="text-sm leading-6 text-slate-600">
            {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep2') }}
          </p>
          <Image :source="step2Image" alt="step 2" class="w-full rounded-xl border border-slate-200 bg-white object-contain" />
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <div class="space-y-3">
            <p class="text-sm leading-6 text-slate-600">
              {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep3') }}
            </p>
            <p class="text-sm leading-6 text-slate-600">
              {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep4') }}
            </p>
          </div>

          <Image
            :source="step3Image"
            alt="step 3"
            class="w-full rounded-xl border border-slate-200 bg-white object-contain"
          />
        </div>
      </section>

      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.configureDistributionTitle') }}
        </h3>

        <div class="mt-4 grid gap-4 lg:grid-cols-2 lg:items-start">
          <p class="text-sm leading-6 text-slate-600">
            {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5Part1') }}
          </p>
          <Image
            :source="step5Image1"
            alt="step 5-1"
            class="w-full rounded-xl border border-slate-200 bg-white object-contain"
          />
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-2 lg:items-start">
          <Image
            :source="step5Image2"
            alt="step 5-2"
            class="order-2 w-full rounded-xl border border-slate-200 bg-white object-contain lg:order-1"
          />

          <div class="order-1 space-y-3 lg:order-2">
            <p class="text-sm leading-6 text-slate-600">
              {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5Part2') }}
            </p>
            <ul class="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <li>write_products</li>
              <li>read_products</li>
              <li>write_publications</li>
              <li>read_publications</li>
              <li>read_locales</li>
              <li>read_orders</li>
            </ul>
            <p class="text-sm font-semibold leading-6 text-slate-700">
              {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep5Part3') }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.configureUrlsTitle') }}
        </h3>

        <div class="mt-4 grid gap-4 lg:grid-cols-12 lg:items-start">
          <Image
            :source="step6Image"
            alt="step 6"
            class="w-full rounded-xl border border-slate-200 bg-white object-contain lg:col-span-6"
          />
          <div class="space-y-4 lg:col-span-6">
            <p class="text-sm leading-6 text-slate-600">
              {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep6Part1') }}
            </p>
            <p class="text-sm leading-6 text-slate-600">
              {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep6Part2') }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.detectWebsiteUrlTitle') }}
        </h3>
        <div class="mt-4 grid gap-4 lg:grid-cols-12 lg:items-start">
          <p class="text-sm leading-6 text-slate-600 lg:col-span-8">
            {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep7') }}
          </p>
          <Image
            :source="step4Image"
            alt="step 7"
            class="w-full rounded-xl border border-slate-200 bg-white object-contain lg:col-span-4"
          />
        </div>
      </section>

      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.finishWizardTitle') }}
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ t('integrations.create.wizard.step1.shopifyInfoModal.section.integrationStep8') }}
        </p>
      </section>
    </div>

    <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button class="btn btn-outline-dark" @click="close">
        {{ t('shared.button.cancel') }}
      </Button>
    </div>
  </div>
</template>
