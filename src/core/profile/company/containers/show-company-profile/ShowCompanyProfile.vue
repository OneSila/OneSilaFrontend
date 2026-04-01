<script lang="ts" setup>
import { computed, ref } from 'vue';
import { MeCompanyData } from '../../meCompanyData';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { useI18n } from 'vue-i18n';
import { languagesQuery } from "../../../../../shared/api/queries/languages.js";
import apolloClient from "../../../../../../apollo-client";

const { t } = useI18n();
const props = defineProps<{ companyData: MeCompanyData }>();

const companyInitials = computed(() =>
  (props.companyData.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CO',
);

const languageNames = ref<Record<string, string>>({});

void apolloClient.query({ query: languagesQuery, fetchPolicy: 'cache-first' }).then(({ data }) => {
  const entries = data?.languages || [];
  languageNames.value = entries.reduce((acc, language) => {
    acc[language.code] = language.name;
    return acc;
  }, {} as Record<string, string>);
}).catch(() => {
  languageNames.value = {};
});

const languageSummary = computed(() => {
  if (!props.companyData.languages?.length) {
    return '-';
  }

  const defaultLanguageCode = props.companyData.languageDetail?.code || props.companyData.language;

  return props.companyData.languages
    .map((languageCode) => {
      if (languageCode === defaultLanguageCode && props.companyData.languageDetail?.name) {
        return props.companyData.languageDetail.name;
      }

      return languageNames.value[languageCode] || languageCode.toUpperCase();
    })
    .join(', ');
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between dark:border-slate-700/60 dark:bg-slate-900/40">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
          {{ companyInitials }}
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-2xl font-semibold text-slate-900 dark:text-white-light">
            {{ props.companyData.name || '-' }}
          </h3>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:min-w-[520px]">
        <div class="rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {{ t('companyProfile.labels.defaultLanguage') }}
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-white-light">
            {{ props.companyData.languageDetail?.name || '-' }}
          </p>
        </div>
        <div class="rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {{ t('companyProfile.labels.companyLanguages') }}
          </p>
          <p class="mt-1 text-sm font-semibold leading-6 text-slate-900 dark:text-white-light">
            {{ languageSummary }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="map-marker"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('companyProfile.labels.address') }}
            </p>
            <p class="mt-1 text-sm font-medium leading-6 text-slate-700 dark:text-slate-200">
              {{ props.companyData.fullAddress || '-' }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="envelope"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('companyProfile.labels.email') }}
            </p>
            <a
              v-if="props.companyData.email"
              :href="`mailto:${props.companyData.email}`"
              class="mt-1 block break-all text-sm font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200"
            >
              {{ props.companyData.email }}
            </a>
            <p v-else class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">-</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="phone"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('companyProfile.labels.phoneNumber') }}
            </p>
            <a
              v-if="props.companyData.phoneNumber"
              :href="`tel:${props.companyData.phoneNumber}`"
              class="mt-1 block text-sm font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200"
            >
              {{ props.companyData.phoneNumber }}
            </a>
            <p v-else class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">-</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="globe"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('companyProfile.labels.website') }}
            </p>
            <a
              v-if="props.companyData.website"
              :href="props.companyData.website"
              target="_blank"
              rel="noreferrer"
              class="mt-1 block break-all text-sm font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200"
            >
              {{ props.companyData.website }}
            </a>
            <p v-else class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">-</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="receipt"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('companyProfile.labels.vatNumber') }}
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {{ props.companyData.vatNumber || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
