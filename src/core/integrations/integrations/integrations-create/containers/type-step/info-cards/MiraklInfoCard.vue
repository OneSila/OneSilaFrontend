<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../../../../../../shared/components/atoms/button';
import { Icon } from '../../../../../../../shared/components/atoms/icon';
import { Image } from '../../../../../../../shared/components/atoms/image';
import { Tabs } from '../../../../../../../shared/components/molecules/tabs';

const props = withDefaults(defineProps<{
  marketplace: string;
  icon: string;
  isDefaultMirakl?: boolean;
}>(), {
  isDefaultMirakl: false,
});

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();

const showGeneralTab = computed(() => !props.isDefaultMirakl);
const tabItems = computed(() => [
  { name: 'general', label: t('shared.tabs.general') },
  { name: 'mirakl', label: t('integrations.create.wizard.step1.miraklInfoModal.tabs.learnMirakl') },
]);

const modalTitle = computed(() => (showGeneralTab.value
  ? t('integrations.create.wizard.step1.miraklInfoModal.title', { marketplace: props.marketplace })
  : t('integrations.create.wizard.step1.miraklInfoModal.defaultTitle')));

const modalDescription = computed(() => (showGeneralTab.value
  ? t('integrations.create.wizard.step1.miraklInfoModal.description', { marketplace: props.marketplace })
  : t('integrations.create.wizard.step1.miraklInfoModal.credentials.description')));

const close = () => emit('close');
</script>

<template>
  <div class="w-[min(60rem,calc(100vw-2rem))] rounded-[2rem] bg-white p-8">
    <div class="flex items-start gap-4">
      <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <Image :source="props.icon" :alt="props.marketplace" class="h-8 w-8 object-contain" />
      </div>

      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          {{ t('integrations.integrationTypes.mirakl') }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">
          {{ modalTitle }}
        </h2>
        <p class="mt-4 text-base leading-7 text-slate-600">
          {{ modalDescription }}
        </p>
      </div>
    </div>

    <div v-if="showGeneralTab" class="mt-8">
      <Tabs :tabs="tabItems" tab-key="miraklInfoTab">
        <template #general>
          <div class="max-h-[65vh] space-y-5 overflow-y-auto pr-2">
            <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <p class="text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.description', { marketplace: props.marketplace }) }}
              </p>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.instructions', { marketplace: props.marketplace }) }}
              </p>
            </section>
          </div>
        </template>

        <template #mirakl>
          <div class="max-h-[65vh] space-y-5 overflow-y-auto pr-2">
            <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.title') }}
              </h3>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.description') }}
              </p>
            </section>

            <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeyTitle') }}
              </h3>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeyIntro') }}
              </p>
              <ol class="mt-4 space-y-3">
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
                  <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step1') }}</span>
                </li>
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
                  <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step2') }}</span>
                </li>
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
                  <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step3') }}</span>
                </li>
                <li class="flex gap-3 text-sm leading-6 text-slate-600">
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">4</span>
                  <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step4') }}</span>
                </li>
              </ol>
            </section>

            <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.shopIdTitle') }}
              </h3>
              <p class="mt-3 text-sm leading-6 text-slate-600">
                {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.shopIdDescription') }}
              </p>
            </section>
          </div>
        </template>
      </Tabs>
    </div>

    <div v-else class="mt-8 max-h-[65vh] space-y-5 overflow-y-auto pr-2">
      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeyTitle') }}
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeyIntro') }}
        </p>
        <ol class="mt-4 space-y-3">
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</span>
            <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step1') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</span>
            <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step2') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</span>
            <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step3') }}</span>
          </li>
          <li class="flex gap-3 text-sm leading-6 text-slate-600">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">4</span>
            <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.apiKeySteps.step4') }}</span>
          </li>
        </ol>
      </section>

      <section class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
        <h3 class="text-lg font-semibold text-slate-900">
          {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.shopIdTitle') }}
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ t('integrations.create.wizard.step1.miraklInfoModal.credentials.shopIdDescription') }}
        </p>
      </section>
    </div>

    <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button class="btn btn-outline-dark" @click="close">
        {{ t('shared.button.cancel') }}
      </Button>

      <a
        v-if="showGeneralTab"
        class="btn btn-primary inline-flex items-center justify-center gap-2"
        href="https://www.mirakl.com/lets-talk"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{{ t('integrations.create.wizard.step1.miraklInfoModal.cta') }}</span>
        <Icon name="arrow-up-right-from-square" size="sm" />
      </a>
    </div>
  </div>
</template>
