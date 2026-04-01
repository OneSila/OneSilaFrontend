<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Button } from '../../atoms/button';
import { Icon } from '../../atoms/icon';
import { Loader } from '../../atoms/loader';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  url?: string | null;
  opened: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string;
};

const props = withDefaults(defineProps<{
  notifications: NotificationItem[];
  loading?: boolean;
  openingId?: string | null;
  compact?: boolean;
  maxItems?: number | null;
  showViewAll?: boolean;
}>(), {
  loading: false,
  openingId: null,
  compact: false,
  maxItems: null,
  showViewAll: false,
});

const emit = defineEmits<{
  (e: 'open', notification: NotificationItem): void;
  (e: 'view-all'): void;
}>();

const { t } = useI18n();

const visibleNotifications = computed(() => {
  if (props.maxItems === null) {
    return props.notifications;
  }

  return props.notifications.slice(0, props.maxItems);
});

const unopenedCount = computed(() => props.notifications.filter((notification) => !notification.opened).length);

const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};
</script>

<template>
  <div :class="compact ? 'space-y-3' : 'space-y-4'">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900">
          {{ t('profile.notifications.title') }}
        </h3>
        <p class="text-sm text-slate-500">
          {{ t('profile.notifications.description') }}
        </p>
      </div>
      <span
        v-if="unopenedCount"
        class="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700"
      >
        {{ t('profile.notifications.summary', { count: unopenedCount }) }}
      </span>
    </div>

    <Loader :loading="loading" />

    <div
      v-if="!loading && !visibleNotifications.length"
      class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center"
    >
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <Icon name="bell" class="h-5 w-5 text-slate-500" />
      </div>
      <p class="mt-4 text-sm font-semibold text-slate-900">{{ t('profile.notifications.empty.title') }}</p>
      <p class="mt-2 text-sm text-slate-500">{{ t('profile.notifications.empty.description') }}</p>
    </div>

    <div v-else-if="!loading" class="space-y-3">
      <button
        v-for="notification in visibleNotifications"
        :key="notification.id"
        type="button"
        class="block w-full rounded-xl border p-4 text-left transition"
        :class="notification.opened ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-sky-200 bg-sky-50 hover:border-sky-300'"
        @click="$emit('open', notification)"
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full"
            :class="notification.opened ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-sky-600'"
          >
            <Icon name="bell" class="h-4 w-4" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">{{ notification.title }}</p>
                  <span v-if="!notification.opened" class="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                </div>
                <p class="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-600">{{ notification.message }}</p>
              </div>
              <div class="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                <span v-if="openingId === notification.id">{{ t('shared.labels.processing') }}</span>
                <time>{{ formatDate(notification.createdAt) }}</time>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>

    <div v-if="showViewAll" class="pt-1">
      <Button type="button" class="btn btn-outline-primary w-full" @click="$emit('view-all')">
        {{ t('profile.notifications.actions.viewAll') }}
      </Button>
    </div>
  </div>
</template>
