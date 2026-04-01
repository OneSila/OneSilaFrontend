import type { FrontendNotification } from './notifications';

const desktopNotificationsStorageKey = 'desktop_notifications_enabled';

const canUseBrowserNotifications = () =>
  typeof window !== 'undefined' && 'Notification' in window;

export const askNotificationPermission = async () => {
  if (!canUseBrowserNotifications()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const areDesktopNotificationsEnabled = () => {
  if (!canUseBrowserNotifications()) {
    return false;
  }

  return Notification.permission === 'granted' && localStorage.getItem(desktopNotificationsStorageKey) === 'true';
};

export const setDesktopNotificationsEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (enabled) {
    localStorage.setItem(desktopNotificationsStorageKey, 'true');
    return;
  }

  localStorage.removeItem(desktopNotificationsStorageKey);
};

export const showBrowserNotification = (
  notification: Pick<FrontendNotification, 'id' | 'title' | 'message' | 'url'>,
  fallbackTitle: string,
  onClick?: () => void,
) => {
  if (!areDesktopNotificationsEnabled()) {
    return;
  }

  const browserNotification = new Notification(notification.title || fallbackTitle, {
    body: notification.message || '',
    tag: `notification-${notification.id}`,
  });

  browserNotification.onclick = () => {
    window.focus();
    onClick?.();
    browserNotification.close();
  };
};
