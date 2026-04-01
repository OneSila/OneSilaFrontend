<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import apolloClient from '../../../../apollo-client';
import GeneralTemplate from '../../../shared/templates/GeneralTemplate.vue';
import { Breadcrumbs } from '../../../shared/components/molecules/breadcrumbs';
import { Pagination } from '../../../shared/components/molecules/pagination';
import { Button } from '../../../shared/components/atoms/button';
import { Card } from '../../../shared/components/atoms/card';
import { Badge } from '../../../shared/components/atoms/badge';
import { Icon } from '../../../shared/components/atoms/icon';
import { Loader } from '../../../shared/components/atoms/loader';
import { markAllNotificationsAsViewMutation } from '../../../shared/api/mutations/notifications.js';
import { notificationsQuery } from '../../../shared/api/queries/notifications.js';
import { Toast } from '../../../shared/modules/toast';
import {
  FrontendNotification,
  mergeNotificationOpenedState,
  openNotificationAndNavigate,
  sortNotificationsNewestFirst,
} from '../../../shared/modules/notifications';
import {
  areDesktopNotificationsEnabled,
  askNotificationPermission,
  setDesktopNotificationsEnabled,
} from '../../../shared/modules/browser-notifications';

const { t } = useI18n();
const router = useRouter();
const PAGE_SIZE = 10;

interface NotificationPageInfo {
  endCursor: string;
  startCursor: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const notifications = ref<FrontendNotification[]>([]);
const localOpenedState = ref<Record<string, boolean>>({});
const openingIds = ref<string[]>([]);
const markingAllAsRead = ref(false);
const loading = ref(true);
const pageInfo = ref<NotificationPageInfo | null>(null);
const totalCount = ref(0);
const desktopNotificationsSupported = ref(false);
const desktopNotificationsEnabled = ref(false);
const desktopNotificationsLoading = ref(false);

const sortedNotifications = computed(() =>
  sortNotificationsNewestFirst(
    mergeNotificationOpenedState(notifications.value, localOpenedState.value),
  ),
);

const unreadCount = computed(() =>
  sortedNotifications.value.filter((notification) => !notification.opened).length,
);

const hasNotifications = computed(() => totalCount.value > 0);

const loadNotifications = async (variables: {
  first?: number;
  last?: number;
  after?: string | null;
  before?: string | null;
} = { first: PAGE_SIZE }) => {
  try {
    loading.value = true;

    const { data } = await apolloClient.query({
      query: notificationsQuery,
      variables,
      fetchPolicy: 'network-only',
    });

    const connection = data?.notifications;
    const edges = connection?.edges ?? [];
    notifications.value = edges
      .map((edge: any) => edge?.node)
      .filter(Boolean) as FrontendNotification[];
    pageInfo.value = connection?.pageInfo ?? null;
    totalCount.value = connection?.totalCount ?? notifications.value.length;
  } catch (error) {
    console.error('Failed to load notifications', error);
  } finally {
    loading.value = false;
  }
};

const syncDesktopNotificationsState = () => {
  desktopNotificationsSupported.value = typeof window !== 'undefined' && 'Notification' in window;
  desktopNotificationsEnabled.value = areDesktopNotificationsEnabled();
};

const toggleDesktopNotifications = async () => {
  if (!desktopNotificationsSupported.value || desktopNotificationsLoading.value) {
    return;
  }

  try {
    desktopNotificationsLoading.value = true;

    if (desktopNotificationsEnabled.value) {
      setDesktopNotificationsEnabled(false);
      desktopNotificationsEnabled.value = false;
      Toast.success(t('profile.notifications.messages.desktopNotificationsDisabled'));
      return;
    }

    const permissionGranted = await askNotificationPermission();

    if (!permissionGranted) {
      setDesktopNotificationsEnabled(false);
      desktopNotificationsEnabled.value = false;
      Toast.error(t('profile.notifications.messages.desktopNotificationsDenied'));
      return;
    }

    setDesktopNotificationsEnabled(true);
    desktopNotificationsEnabled.value = true;
    Toast.success(t('profile.notifications.messages.desktopNotificationsEnabled'));
  } catch (error) {
    console.error('Failed to update desktop notifications preference', error);
    Toast.error(t('profile.notifications.messages.desktopNotificationsFailed'));
  } finally {
    desktopNotificationsLoading.value = false;
  }
};

const handleQueryChanged = (nQ: { query?: Record<string, string> }) => {
  if (loading.value) {
    return;
  }

  const query = nQ?.query || {};

  if (query.before) {
    void loadNotifications({ last: PAGE_SIZE, before: query.before });
    return;
  }

  if (query.after) {
    void loadNotifications({ first: PAGE_SIZE, after: query.after });
    return;
  }

  if (query.last === 'true') {
    void loadNotifications({ last: PAGE_SIZE });
    return;
  }

  void loadNotifications({ first: PAGE_SIZE });
};

const markAllAsRead = async () => {
  if (markingAllAsRead.value || !hasNotifications.value) {
    return;
  }

  try {
    markingAllAsRead.value = true;

    const { data } = await apolloClient.mutate({
      mutation: markAllNotificationsAsViewMutation,
      fetchPolicy: 'network-only',
    });

    if (!data?.markAllNotificationsAsView) {
      throw new Error('markAllNotificationsAsView returned false');
    }

    localOpenedState.value = Object.fromEntries(
      notifications.value.map((notification) => [notification.id, true]),
    );
  } catch (error) {
    console.error('Failed to mark all notifications as read', error);
    Toast.error(t('profile.notifications.messages.markAllFailed'));
  } finally {
    markingAllAsRead.value = false;
  }
};

const formatDate = (value: string) => {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const openNotification = async (notification: FrontendNotification) => {
  if (openingIds.value.includes(notification.id)) {
    return;
  }

  try {
    openingIds.value = [...openingIds.value, notification.id];
    await openNotificationAndNavigate({
      notificationId: notification.id,
      fallbackUrl: notification.url,
      router,
      markOpened: (id) => {
        localOpenedState.value = {
          ...localOpenedState.value,
          [id]: true,
        };
      },
    });
  } catch (error) {
    console.error('Failed to open notification', error);
    Toast.error(t('profile.notifications.messages.openFailed'));
  } finally {
    openingIds.value = openingIds.value.filter((id) => id !== notification.id);
  }
};

onMounted(() => {
  syncDesktopNotificationsState();
  void loadNotifications();
});
</script>

<template>
  <GeneralTemplate>
    <template #breadcrumbs>
      <Breadcrumbs
        :links="[
          { path: { name: 'profile.user' }, name: t('profile.dropdown.profile') },
          { path: { name: 'profile.notifications' }, name: t('profile.notifications.title') }
        ]"
      />
    </template>

    <template #content>
      <Card>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl font-semibold text-slate-900">
                {{ t('profile.notifications.title') }}
              </h1>
              <p class="mt-2 text-sm text-slate-500">
                {{ t('profile.notifications.description') }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-3 self-start sm:self-center">
              <span
                v-if="desktopNotificationsSupported && desktopNotificationsEnabled"
                class="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200"
              >
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                {{ t('profile.notifications.browser.enabledBadge') }}
              </span>
              <Badge
                :text="t('profile.notifications.summary', { count: unreadCount })"
                color="blue"
              />
              <Button
                class="btn btn-outline-primary"
                :disabled="!hasNotifications || markingAllAsRead"
                :loading="markingAllAsRead"
                @click="markAllAsRead"
              >
                {{ t('profile.notifications.actions.markAllAsRead') }}
              </Button>
              <Button
                class="btn btn-outline-dark"
                :disabled="desktopNotificationsLoading || (!desktopNotificationsSupported && !desktopNotificationsEnabled)"
                :loading="desktopNotificationsLoading"
                @click="toggleDesktopNotifications"
              >
                {{
                  desktopNotificationsEnabled
                    ? t('profile.notifications.actions.disableDesktopNotifications')
                    : t('profile.notifications.actions.enableDesktopNotifications')
                }}
              </Button>
            </div>
          </div>

          <Loader :loading="loading" />

          <div
            v-if="!loading && sortedNotifications.length === 0"
            class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"
          >
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
              <Icon name="bell" />
            </div>
            <h2 class="mt-4 text-lg font-semibold text-slate-900">
              {{ t('profile.notifications.empty.title') }}
            </h2>
            <p class="mt-2 text-sm text-slate-500">
              {{ t('profile.notifications.empty.description') }}
            </p>
          </div>

          <div v-else-if="!loading" class="space-y-3">
            <button
              v-for="notification in sortedNotifications"
              :key="notification.id"
              type="button"
              class="w-full rounded-2xl border px-5 py-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40"
              :class="notification.opened ? 'border-slate-200 bg-white' : 'border-indigo-200 bg-indigo-50/60'"
              @click="openNotification(notification)"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-flex h-2.5 w-2.5 rounded-full"
                      :class="notification.opened ? 'bg-slate-300' : 'bg-indigo-500'"
                    />
                    <p class="truncate text-base font-semibold text-slate-900">
                      {{ notification.title }}
                    </p>
                  </div>
                  <p class="mt-2 text-sm text-slate-600">
                    {{ notification.message }}
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <span class="text-xs text-slate-500">
                    {{ formatDate(notification.createdAt) }}
                  </span>
                  <span
                    class="inline-flex items-center rounded-md border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600"
                  >
                    {{ notification.url ? t('profile.notifications.actions.open') : t('profile.notifications.actions.markAsOpened') }}
                  </span>
                </div>
              </div>
            </button>

            <Pagination
              v-if="pageInfo"
              class="mt-2"
              :page-info="pageInfo"
              :change-query-params="false"
              @query-changed="handleQueryChanged"
            />
          </div>
        </div>
      </Card>
    </template>
  </GeneralTemplate>
</template>
