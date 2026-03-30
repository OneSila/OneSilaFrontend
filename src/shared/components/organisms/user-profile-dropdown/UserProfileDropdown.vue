<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import notificationSound from '../../../../assets/audio/notification.mp3';
import { Icon } from '../../atoms/icon';
import { Link } from '../../atoms/link';
import { Badge } from '../../atoms/badge';
import { ApolloSubscription } from '../../molecules/apollo-subscription';
import { injectAuth, removeAuth } from '../../../modules/auth';
import { aiPointsSubscriptions, meSubscription } from '../../../api/subscriptions/me';
import { Toast } from '../../../modules/toast';
import {
  FrontendNotification,
  mergeNotificationOpenedState,
  openNotificationAndNavigate,
  sortNotificationsNewestFirst,
} from '../../../modules/notifications';

const { t } = useI18n();
const auth = injectAuth();
const router = useRouter();

const user = ref(auth.user);
const notifications = ref<FrontendNotification[]>((auth.user.notifications || []) as FrontendNotification[]);
const openedOverrides = ref<Record<string, boolean>>({});
const openingId = ref<string | null>(null);
const hasHydratedNotifications = ref(false);
const knownNotificationIds = ref<string[]>(
  ((auth.user.notifications || []) as FrontendNotification[]).map((notification) => notification.id),
);
const notificationAudio = ref<HTMLAudioElement | null>(null);

const normalizedNotifications = computed(() =>
  sortNotificationsNewestFirst(
    mergeNotificationOpenedState(notifications.value, openedOverrides.value),
  ),
);

const unreadCount = computed(() =>
  normalizedNotifications.value.filter((notification) => !notification.opened).length,
);

const recentNotifications = computed(() => normalizedNotifications.value.slice(0, 5));
const userFullName = computed(() =>
  [user.value.firstName, user.value.lastName].filter(Boolean).join(' ').trim() || user.value.username,
);
const userInitials = computed(() =>
  userFullName.value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U',
);

const logout = async () => {
  await removeAuth(auth);
  router.replace({ name: 'auth.login' });
};

const persistUser = () => {
  localStorage.setItem('auth_user', JSON.stringify(auth.user));
  user.value = auth.user;
};

const playNotificationSound = async () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!notificationAudio.value) {
    notificationAudio.value = new Audio(notificationSound);
    notificationAudio.value.preload = 'auto';
  }

  try {
    notificationAudio.value.currentTime = 0;
    await notificationAudio.value.play();
  } catch (error) {
    console.debug('Notification sound playback skipped', error);
  }
};

const handleCompanySubscriptionResult = (data: any) => {
  const company = data?.myMultiTenantCompany;
  if (!auth.user.company || !company) {
    return;
  }

  auth.user.company.hasAmazonIntegration = company.hasAmazonIntegration ?? false;
  auth.user.company.hasEbayIntegration = company.hasEbayIntegration ?? false;
  auth.user.company.hasSheinIntegration = company.hasSheinIntegration ?? false;
  auth.user.company.hasMiraklIntegration = company.hasMiraklIntegration ?? false;
  persistUser();
};

const handleMeSubscriptionResult = (data: any) => {
  if (!data?.me) {
    return;
  }

  const nextNotifications = (data.me.notifications || []) as FrontendNotification[];
  const nextNotificationIds = nextNotifications.map((notification) => notification.id);

  if (hasHydratedNotifications.value) {
    const hasNewNotification = nextNotificationIds.some(
      (notificationId) => !knownNotificationIds.value.includes(notificationId),
    );

    if (hasNewNotification) {
      void playNotificationSound();
    }
  } else {
    hasHydratedNotifications.value = true;
  }

  knownNotificationIds.value = nextNotificationIds;
  notifications.value = nextNotifications;
  auth.user = {
    ...auth.user,
    ...data.me,
    notifications: nextNotifications,
  };
  persistUser();
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

const openNotification = async (notification: FrontendNotification, close: () => void) => {
  if (openingId.value === notification.id) {
    return;
  }

  try {
    openingId.value = notification.id;
    await openNotificationAndNavigate({
      notificationId: notification.id,
      fallbackUrl: notification.url,
      router,
      markOpened: (id) => {
        openedOverrides.value = {
          ...openedOverrides.value,
          [id]: true,
        };
      },
    });
    close();
  } catch (error) {
    console.error('Failed to open notification', error);
    Toast.error(t('profile.notifications.messages.openFailed'));
  } finally {
    openingId.value = null;
  }
};
</script>

<template>
  <div class="dropdown shrink-0">
    <ApolloSubscription
      :subscription="meSubscription"
      @result-updated="handleMeSubscriptionResult"
    >
      <template #default>
        <div class="hidden"></div>
      </template>
    </ApolloSubscription>

    <Popper :placement="'bottom-start'" offsetDistance="8" class="!block">
      <button type="button" class="relative block rounded-full transition focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2">
        <Icon
          name="user"
          class="h-8 w-8 rounded-full object-cover text-gray-600 saturate-50 transition hover:text-indigo-600"
        />
        <span
          v-if="unreadCount"
          class="absolute -right-1.5 -top-1.5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white ring-2 ring-white"
        >
          {{ unreadCount }}
        </span>
      </button>

      <template #content="{ close }">
        <div class="w-[420px] overflow-hidden rounded-[28px] border border-slate-200 bg-white text-dark shadow-2xl dark:text-white-dark dark:text-white-light/90">
          <div class="border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50/70 px-5 py-5">
            <div class="flex items-start gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm">
                <img
                  v-if="user.avatarResizedFullUrl"
                  :src="user.avatarResizedFullUrl"
                  :alt="userFullName"
                  class="h-full w-full object-cover"
                />
                <span v-else>{{ userInitials }}</span>
              </div>

              <div class="min-w-0 flex-1">
                <h4 class="truncate text-base font-semibold text-slate-900">
                  {{ userFullName }}
                </h4>
                <p
                  v-if="user.company?.name"
                  class="mt-0.5 truncate text-sm text-slate-500"
                >
                  {{ user.company?.name }}
                </p>
                <span class="mt-0.5 block truncate text-sm text-slate-500">
                  {{ user.username }}
                </span>
              </div>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-2xl border border-indigo-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                      <Icon name="gem" />
                    </div>
                    <div>
                      <p class="text-xs font-medium uppercase tracking-wide text-slate-400">
                        SilAI Credits
                      </p>
                      <ApolloSubscription
                        :subscription="aiPointsSubscriptions"
                        @result-updated="handleCompanySubscriptionResult"
                      >
                        <template #default="{ loading, result }">
                          <span
                            v-if="!loading && result"
                            class="text-sm font-semibold text-slate-900"
                            :class="{ 'text-red-600': (result as any).myMultiTenantCompany.aiPoints < 0 }"
                          >
                            {{ (result as any).myMultiTenantCompany.aiPoints }}
                          </span>
                          <span v-else class="text-sm font-semibold text-slate-400">...</span>
                        </template>
                      </ApolloSubscription>
                    </div>
                  </div>

                  <Icon
                    name="info-circle"
                    class="h-4.5 w-4.5 shrink-0 text-slate-400"
                    :title="t('auth.register.company.aiPointsMessage')"
                  />
                </div>
              </div>

              <button
                type="button"
                class="flex items-center justify-between rounded-2xl border border-rose-200 bg-white/80 px-4 py-3 text-left shadow-sm backdrop-blur transition hover:border-rose-300 hover:bg-white"
                @click="logout()"
              >
                <span class="text-sm font-semibold text-rose-600">
                  {{ t('profile.dropdown.signOut') }}
                </span>
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <Icon name="sign-out" />
                </div>
              </button>
            </div>
          </div>

          <div class="space-y-4 p-4">
            <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h5 class="text-sm font-semibold text-slate-900">
                  {{ t('profile.notifications.title') }}
                </h5>
                <p class="text-xs text-slate-500">
                  {{ t('profile.notifications.dropdown.description') }}
                </p>
              </div>
              <Badge
                :text="t('profile.notifications.dropdown.badge', { count: unreadCount })"
                color="indigo"
              />
            </div>

            <div v-if="recentNotifications.length" class="max-h-[320px] overflow-y-auto">
              <button
                v-for="notification in recentNotifications"
                :key="notification.id"
                type="button"
                class="w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                :class="notification.opened ? 'bg-white' : 'bg-indigo-50/50'"
                @click="openNotification(notification, close)"
              >
                <div class="flex items-start gap-3">
                  <span
                    class="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                    :class="notification.opened ? 'bg-slate-300' : 'bg-indigo-500'"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-3">
                      <p class="truncate text-sm font-semibold text-slate-900">
                        {{ notification.title }}
                      </p>
                      <span class="shrink-0 text-[11px] text-slate-500">
                        {{ formatDate(notification.createdAt) }}
                      </span>
                    </div>
                    <p class="mt-1 text-xs leading-5 text-slate-600">
                      {{ notification.message }}
                    </p>
                  </div>
                  <Icon
                    v-if="openingId === notification.id"
                    name="circle-notch"
                    spin
                    class="shrink-0 text-slate-400"
                  />
                </div>
              </button>
            </div>

            <div
              v-else
              class="px-4 py-10 text-center"
            >
              <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name="bell" />
              </div>
              <p class="mt-3 text-sm font-medium text-slate-700">
                {{ t('profile.notifications.empty.title') }}
              </p>
              <p class="mt-1 text-xs text-slate-500">
                {{ t('profile.notifications.empty.description') }}
              </p>
            </div>

            <div class="border-t border-slate-200 px-4 py-3">
              <Link
                :path="{ name: 'profile.notifications' }"
                block
                @click="close()"
              >
                <div class="flex items-center justify-between rounded-xl px-2 py-1.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50">
                  <span>{{ t('profile.notifications.actions.viewAll') }}</span>
                  <Icon name="arrow-right" />
                </div>
              </Link>
            </div>
          </div>

            <ul class="space-y-2 rounded-2xl bg-slate-50 p-2">
            <li>
              <Link :path="{ name: 'profile.user' }" @click="close()" block>
                <div class="flex items-center rounded-xl px-4 py-3 text-slate-700 transition hover:bg-white hover:shadow-sm">
                  <Icon name="user" class="mr-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  {{ t('profile.dropdown.profile') }}
                </div>
              </Link>
            </li>
            <li>
              <Link :path="{ name: 'profile.company' }" @click="close()" block>
                <div class="flex items-center rounded-xl px-4 py-3 text-slate-700 transition hover:bg-white hover:shadow-sm">
                  <Icon name="building" class="mr-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  {{ t('profile.dropdown.company') }}
                </div>
              </Link>
            </li>
            <li>
              <Link :path="{ name: 'settings.currencies.list' }" @click="close()" block>
                <div class="flex items-center rounded-xl px-4 py-3 text-slate-700 transition hover:bg-white hover:shadow-sm">
                  <Icon name="cog" class="mr-3 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  {{ t('settings.title') }}
                </div>
              </Link>
            </li>
            </ul>
          </div>
        </div>
      </template>
    </Popper>
  </div>
</template>
