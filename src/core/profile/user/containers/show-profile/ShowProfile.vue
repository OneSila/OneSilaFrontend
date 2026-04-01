<script lang="ts" setup>
import { computed } from 'vue';
import { Icon } from "../../../../../shared/components/atoms/icon";
import { Image } from "../../../../../shared/components/atoms/image";
import { MeData } from '../../meData'
import IconWhatsApp from '../../../../../shared/components/atoms/icons/icon-whatsapp.vue';
import IconTelegram from '../../../../../shared/components/atoms/icons/icon-telegram.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ meData: MeData }>();

const fullName = computed(() =>
  [props.meData.firstName, props.meData.lastName].filter(Boolean).join(' ').trim() || props.meData.username,
);

const initials = computed(() =>
  fullName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U',
);

</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between dark:border-slate-700/60 dark:bg-slate-900/40">
      <div class="flex items-center gap-4">
        <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-lg font-semibold text-white shadow-sm">
          <Image v-if="meData.avatarResizedFullUrl != null" :source="meData.avatarResizedFullUrl" class="h-full w-full object-cover"/>
          <span v-else>{{ initials }}</span>
        </div>
        <div class="min-w-0">
          <h3 class="truncate text-2xl font-semibold text-slate-900 dark:text-white-light">
            {{ fullName }}
          </h3>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {{ meData.username }}
          </p>
        </div>
      </div>

      <div class="rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {{ t('profile.labels.joined') }}
        </p>
        <p class="mt-1 text-sm font-semibold text-slate-900 dark:text-white-light">
          {{ new Date(meData.dateJoined).toLocaleDateString() }}
        </p>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="phone"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('profile.labels.phone') }}
            </p>
            <a v-if="meData.mobileNumber" :href="`tel:${meData.mobileNumber}`" class="mt-1 block text-sm font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200">
              {{ meData.mobileNumber }}
            </a>
            <p v-else class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">-</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <IconWhatsApp/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('profile.labels.whatsApp') }}
            </p>
            <a v-if="meData.whatsappNumber" :href="`https://wa.me/${meData.whatsappNumber.replace('+', '')}`" class="mt-1 block text-sm font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-200">
              {{ meData.whatsappNumber }}
            </a>
            <p v-else class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">-</p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <IconTelegram/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('profile.labels.telegram') }}
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {{ meData.telegramNumber || '-' }}
            </p>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:col-span-2 xl:col-span-3">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Icon name="map-pin"/>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {{ t('profile.labels.timezone') }}
            </p>
            <p class="mt-1 text-sm font-medium text-slate-700 dark:text-slate-200">
              {{ meData.timezone || '-' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
