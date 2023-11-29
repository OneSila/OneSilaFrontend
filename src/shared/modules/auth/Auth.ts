import { inject, InjectionKey, reactive } from 'vue';
import apolloClient from '../../../../apollo-client';
import gql from 'graphql-tag';
export const AuthKey: InjectionKey<Auth> = Symbol('Auth');


export type User = {
  username: string;
  language: string;
  firstName: string;
  lastName: string;
  company: object | null;
};

export interface Auth {
  user: User;
  isAuthenticated: boolean;
}

export const detectAuth = (): Auth => {
  const storedUser = localStorage.getItem('auth_user');
  const user = storedUser ? JSON.parse(storedUser) : { username: '', language: 'en-gb', firstName: '', lastName: '', company: null };

  const isAuthenticated = !!storedUser;

  return {
    user: user,
    isAuthenticated: isAuthenticated,
  };
};

export const createAuth = (): Auth => {
  return reactive(detectAuth());
};

export const refreshUser = (auth: Auth, user: User): void => {
  localStorage.setItem('auth_user', JSON.stringify(user));
  auth.user = { ...user };
  auth.isAuthenticated = true;
};

export const setCompanyToUser = (auth: Auth, company: { id: string; name: string }): void => {
  const updatedUser = {
    ...auth.user,
    company: company,
  };

  localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  auth.user = updatedUser;
};

export const replaceAuth = (auth: Auth, newUser: User): void => {
  refreshUser(auth, newUser);
};

export const removeAuth = async (auth) => {
  const LOGOUT_MUTATION = gql`
    mutation Logout {
      logout
    }
  `;

  try {
    await apolloClient.mutate({
      mutation: LOGOUT_MUTATION,
    });
    await apolloClient.clearStore();
    localStorage.removeItem('auth_user');
    auth.user = {
      username: '',
      language: 'en-gb',
      firstName: '',
      lastName: '',
      company: null
    };
    auth.isAuthenticated = false;
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const isAuthenticated = (auth: Auth): boolean => auth.isAuthenticated;

export const hasCompany = (auth) => auth.user && auth.user.company != null;

export const injectAuth = (): Auth => {
  const auth = inject(AuthKey);
  if (!auth) {
    throw new Error('Could not inject Auth.');
  }
  return auth;
};

export const authState = createAuth();