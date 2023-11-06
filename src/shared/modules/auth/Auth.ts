import { inject, InjectionKey, reactive } from 'vue';

export const AuthKey: InjectionKey<Auth> = Symbol('Auth');

export type User = {
  id: number | null;
  username: string;
  language: string;
};

export interface Auth {
  user: User;
  isAuthenticated: boolean;
}

const hasSessionCookie = (): boolean => {
  alert('COOKIE')
  console.log(document.cookie)
  return true;
};

export const detectAuth = (): Auth => {
  const storedUser = localStorage.getItem('auth_user');
  const user = storedUser ? JSON.parse(storedUser) : { id: null, username: '', language: 'en' };

  const auth = createAuth();
  auth.user = user;
  auth.isAuthenticated = hasSessionCookie();

  return auth;
};
export const createAuth = (): Auth => {
  const storedUser = localStorage.getItem('auth_user');
  const user = storedUser ? JSON.parse(storedUser) : { id: null, username: '', language: 'en' };

  return reactive({
    user: user,
    isAuthenticated: hasSessionCookie(),
  });
};

export const refreshUser = (auth: Auth, user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
  auth.user = { ...user };
  auth.isAuthenticated = hasSessionCookie(); // Update isAuthenticated based on session cookie
};

export const replaceAuth = (auth: Auth, newUser: User): void => {
  refreshUser(auth, newUser);
};

export const removeAuth = (auth: Auth): void => {
  localStorage.removeItem('auth_user');
  auth.user = {
    id: null,
    username: '',
    language: 'en',
  };
  auth.isAuthenticated = false;
};

export const isAuthenticated = (auth: Auth): boolean => auth.isAuthenticated;

export const injectAuth = (): Auth => {
  const auth = inject(AuthKey);
  if (!auth) {
    throw new Error('Could not inject Auth.');
  }
  return auth;
};

export const authState = createAuth();
