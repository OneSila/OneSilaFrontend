import { inject, InjectionKey } from 'vue';

export const AuthKey: InjectionKey<Auth> = Symbol('Auth');

export type User = {
  id: number | null;
  username: string;
  language: string;
  showOnboarding: boolean;
};

export type ShareLink = {
  id: number;
  productId: number;
  createdAt: string;
  expiresAfter: string;
  availability: string;
};

export interface Auth {
  user: User;
  shareLink?: ShareLink;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export function detectAuth(): Auth {
  const token = localStorage.getItem('auth_token') || '';
  const refreshToken = localStorage.getItem('auth_refresh_token') || '';
  const username = localStorage.getItem('auth_username') || '';

  const storedUserId = localStorage.getItem('auth_userId');
  const userId = storedUserId ? parseInt(storedUserId) : null;
  const userLanguage = localStorage.getItem('auth_userLanguage') || 'en';
  const expiresAt = parseInt(localStorage.getItem('auth_exp') || '0');

  const storedShareLinkId = localStorage.getItem('auth_shareLinkId');
  const storedShareLinkProductId = localStorage.getItem(
    'auth_shareLinkProductId',
  );
  const storedShareLinkCreatedAt = localStorage.getItem(
    'auth_shareLinkCreatedAt',
  );
  const storedShareLinkExpiresAfter = localStorage.getItem(
    'auth_shareLinkExpiresAfter',
  );
  const storedShareLinkAvailability = localStorage.getItem(
    'auth_shareLinkAvailability',
  );

  return {
    user: {
      id: userId,
      username,
      language: userLanguage,
      showOnboarding: false,
    },
    shareLink:
      storedShareLinkId &&
      storedShareLinkProductId &&
      storedShareLinkCreatedAt &&
      storedShareLinkExpiresAfter &&
      storedShareLinkAvailability
        ? {
            id: parseInt(storedShareLinkId),
            productId: parseInt(storedShareLinkProductId),
            createdAt: storedShareLinkCreatedAt,
            expiresAfter: storedShareLinkExpiresAfter,
            availability: storedShareLinkAvailability,
          }
        : undefined,
    token,
    refreshToken,
    expiresAt,
  };
}

export function refreshUser(auth: Auth, user: User): Auth {
  auth.user = {
    id: user.id,
    username: user.username,
    language: user.language,
    showOnboarding: user.showOnboarding,
  };

  localStorage.setItem('auth_username', auth.user.username);

  if (auth.user.id) {
    localStorage.setItem('auth_userId', `${auth.user.id}`);
  } else {
    localStorage.removeItem('auth_userId');
  }

  localStorage.setItem('auth_userLanguage', auth.user.language);

  return auth;
}

export function refreshShareLink(auth: Auth, shareLink?: ShareLink): Auth {
  auth.shareLink = shareLink;

  if (auth.shareLink) {
    localStorage.setItem('auth_shareLinkId', `${auth.shareLink.id}`);
    localStorage.setItem(
      'auth_shareLinkProductId',
      `${auth.shareLink.productId}`,
    );
    localStorage.setItem('auth_shareLinkCreatedAt', auth.shareLink.createdAt);
    localStorage.setItem(
      'auth_shareLinkExpiresAfter',
      auth.shareLink.expiresAfter,
    );
    localStorage.setItem(
      'auth_shareLinkAvailability',
      auth.shareLink.availability,
    );
  } else {
    localStorage.removeItem('auth_shareLinkId');
    localStorage.removeItem('auth_shareLinkProductId');
    localStorage.removeItem('auth_shareLinkCreatedAt');
    localStorage.removeItem('auth_shareLinkExpiresAfter');
    localStorage.removeItem('auth_shareLinkAvailability');
  }

  return auth;
}

export function replaceAuth(auth: Auth) {
  localStorage.setItem('auth_token', auth.token);
  localStorage.setItem('auth_refresh_token', auth.refreshToken);
  localStorage.setItem('auth_username', auth.user.username);
  localStorage.setItem('auth_exp', String(auth.expiresAt));
}

export function removeAuth(auth: Auth) {
  auth.user.id = null;
  auth.user.username = '';
  auth.user.language = 'en';
  auth.user.showOnboarding = false;
  auth.shareLink = undefined;
  auth.token = '';
  auth.refreshToken = '';
  auth.refreshToken = '';
  auth.expiresAt = 0;

  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_refresh_token');
  localStorage.removeItem('auth_username');
  localStorage.removeItem('auth_userId');
  localStorage.removeItem('auth_userLanguage');
  localStorage.removeItem('auth_shareLinkId');
  localStorage.removeItem('auth_shareLinkProductId');
  localStorage.removeItem('auth_shareLinkCreatedAt');
  localStorage.removeItem('auth_shareLinkExpiresAfter');
  localStorage.removeItem('auth_shareLinkAvailability');
  localStorage.removeItem('auth_exp');
}

export const isAuthenticated = (auth: Auth) => !!auth.token;
export const hasExpired = (auth: Auth) =>
  new Date().getTime() >= auth.expiresAt;

export const injectAuth = () => {
  const auth = inject<Auth>(AuthKey);

  if (!auth) {
    throw new Error('Could not get Auth.');
  }

  return auth;
};
