import apolloClient from '../../../apollo-client';
import { openNotificationMutation } from '../api/mutations/notifications.js';

export interface FrontendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  url: string | null;
  opened: boolean;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export const mergeNotificationOpenedState = (
  notifications: FrontendNotification[],
  overrides: Record<string, boolean>,
): FrontendNotification[] =>
  notifications.map((notification) => ({
    ...notification,
    opened: overrides[notification.id] ?? notification.opened,
  }));

export const sortNotificationsNewestFirst = (
  notifications: FrontendNotification[],
): FrontendNotification[] =>
  [...notifications].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

export const navigateToNotificationUrl = async (router: any, url: string) => {
  if (/^https?:\/\//i.test(url)) {
    window.location.href = url;
    return;
  }

  await router.push(url);
};

export const openNotificationAndNavigate = async ({
  notificationId,
  fallbackUrl,
  router,
  markOpened,
}: {
  notificationId: string;
  fallbackUrl?: string | null;
  router: any;
  markOpened: (id: string) => void;
}) => {
  const { data } = await apolloClient.mutate({
    mutation: openNotificationMutation,
    variables: { id: notificationId },
    fetchPolicy: 'network-only',
  });

  const notification = data?.openNotification;
  if (!notification?.id) {
    return;
  }

  markOpened(notification.id);

  const url = notification.url ?? fallbackUrl;
  if (url) {
    await navigateToNotificationUrl(router, url);
  }
};
