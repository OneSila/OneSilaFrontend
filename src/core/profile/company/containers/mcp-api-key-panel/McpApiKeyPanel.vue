<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import apolloClient from '../../../../../../apollo-client';
import { MeCompanyData } from '../../meCompanyData';
import { Icon } from '../../../../../shared/components/atoms/icon';
import { TextInput } from '../../../../../shared/components/atoms/input-text';
import { Button } from '../../../../../shared/components/atoms/button';
import { Toast } from '../../../../../shared/modules/toast';
import { processGraphQLErrors } from '../../../../../shared/utils';
import {
  activateMcpApiKeyMutation,
  createMcpApiKeyMutation,
  deactivateMcpApiKeyMutation,
  regenerateMcpApiKeyMutation,
} from '../../../../../shared/api/mutations/mcpApiKeys.js';

interface McpApiKeyMutationResponse {
  id: string;
  key?: string;
  maskedKey?: string;
  isActive: boolean;
}

const props = defineProps<{ companyData: MeCompanyData }>();

const emit = defineEmits<{
  (e: 'refreshRequested'): void;
}>();

const { t } = useI18n();

const isSubmitting = ref(false);
const rawKey = ref<string | null>(null);
const localApiKey = ref(props.companyData.mcpApiKey ? { ...props.companyData.mcpApiKey } : null);

watch(
  () => props.companyData.mcpApiKey,
  (nextValue) => {
    localApiKey.value = nextValue ? { ...nextValue } : null;
  },
  { deep: true }
);

const displayKey = computed(() => rawKey.value || localApiKey.value?.maskedKey || '');
const hasKey = computed(() => Boolean(localApiKey.value));
const hasRawKey = computed(() => Boolean(rawKey.value));
const isActive = computed(() => Boolean(localApiKey.value?.isActive));
const keyStatusLabel = computed(() => (
  isActive.value
    ? t('companyProfile.mcpApiKey.status.active')
    : t('companyProfile.mcpApiKey.status.inactive')
));
const neutralActionClass = 'inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white-light dark:hover:bg-slate-800';
const primaryActionClass = 'inline-flex items-center justify-center rounded-2xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200';
const dangerActionClass = 'inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/20';

const syncLocalState = (response?: McpApiKeyMutationResponse | null) => {
  if (!response) {
    return;
  }

  localApiKey.value = {
    id: response.id,
    maskedKey: response.maskedKey || localApiKey.value?.maskedKey || '',
    isActive: response.isActive,
  };
  rawKey.value = response.key || rawKey.value;
};

const copyKey = async () => {
  if (!rawKey.value) {
    Toast.error(t('companyProfile.mcpApiKey.messages.copyUnavailable'));
    return;
  }

  try {
    await navigator.clipboard.writeText(rawKey.value);
    Toast.success(t('companyProfile.mcpApiKey.messages.copySuccess'));
  } catch {
    Toast.error(t('companyProfile.mcpApiKey.messages.copyError'));
  }
};

const runMutation = async (mutation, responseKey: string, successMessage: string) => {
  isSubmitting.value = true;

  try {
    const { data } = await apolloClient.mutate({ mutation });
    syncLocalState(data?.[responseKey]);
    Toast.success(successMessage);
    emit('refreshRequested');
  } catch (error) {
    const validationErrors = processGraphQLErrors(error, t);

    Object.values(validationErrors).forEach((message) => {
      Toast.error(message);
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div class="border-b border-slate-200 bg-gradient-to-r from-emerald-50 via-white to-cyan-50 px-5 py-4 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900">
            <Icon name="lock" class="h-4 w-4" />
          </div>
          <div class="max-w-2xl">
            <div class="flex flex-wrap items-center gap-3">
              <h5 class="text-lg font-semibold text-slate-900 dark:text-white-light">
                {{ t('companyProfile.mcpApiKey.title') }}
              </h5>
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                :class="isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'"
              >
                {{ hasKey ? keyStatusLabel : t('companyProfile.mcpApiKey.status.notCreated') }}
              </span>
            </div>
            <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
              {{ t('companyProfile.mcpApiKey.description') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4 px-5 py-4">
      <template v-if="hasKey">
        <div class="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-slate-900 dark:text-white-light">
                  {{ t('companyProfile.mcpApiKey.labels.apiKey') }}
                </p>
                <span class="text-xs font-medium text-slate-400">
                  {{ keyStatusLabel }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-500 dark:text-slate-300">
                {{ hasRawKey ? t('companyProfile.mcpApiKey.help.rawKeyAvailable') : t('companyProfile.mcpApiKey.help.rawKeyUnavailable') }}
              </p>
              <div class="mt-3">
                <TextInput
                  :model-value="displayKey"
                  :secret="hasRawKey"
                  disabled
                  class="w-full"
                  :placeholder="t('companyProfile.mcpApiKey.placeholders.key')"
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 xl:justify-end">
              <Button
                :disabled="isSubmitting || !hasRawKey"
                :custom-class="neutralActionClass"
                @click="copyKey"
              >
                <span class="mr-2">
                  <Icon name="clipboard" class="h-4 w-4" />
                </span>
                {{ t('companyProfile.mcpApiKey.actions.copy') }}
              </Button>

              <Button
                :loading="isSubmitting"
                :disabled="isSubmitting"
                :custom-class="neutralActionClass"
                @click="runMutation(regenerateMcpApiKeyMutation, 'regenerateMcpApiKey', t('companyProfile.mcpApiKey.messages.regenerateSuccess'))"
              >
                {{ t('companyProfile.mcpApiKey.actions.regenerate') }}
              </Button>

              <Button
                v-if="!isActive"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                :custom-class="primaryActionClass"
                @click="runMutation(activateMcpApiKeyMutation, 'activateMcpApiKey', t('companyProfile.mcpApiKey.messages.activateSuccess'))"
              >
                {{ t('companyProfile.mcpApiKey.actions.activate') }}
              </Button>

              <Button
                v-else
                :loading="isSubmitting"
                :disabled="isSubmitting"
                :custom-class="dangerActionClass"
                @click="runMutation(deactivateMcpApiKeyMutation, 'deactivateMcpApiKey', t('companyProfile.mcpApiKey.messages.deactivateSuccess'))"
              >
                {{ t('companyProfile.mcpApiKey.actions.deactivate') }}
              </Button>
            </div>
          </div>
        </div>

        <div v-if="hasRawKey" class="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {{ t('companyProfile.mcpApiKey.help.copyNow') }}
        </div>
      </template>

      <template v-else>
        <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-2xl">
              <p class="text-sm font-semibold text-slate-900 dark:text-white-light">
                {{ t('companyProfile.mcpApiKey.empty.title') }}
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">
                {{ t('companyProfile.mcpApiKey.empty.description') }}
              </p>
            </div>

            <Button
              :loading="isSubmitting"
              :disabled="isSubmitting"
              :custom-class="primaryActionClass"
              @click="runMutation(createMcpApiKeyMutation, 'createMcpApiKey', t('companyProfile.mcpApiKey.messages.createSuccess'))"
            >
              {{ t('companyProfile.mcpApiKey.actions.create') }}
            </Button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
