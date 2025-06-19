import { inject, InjectionKey, reactive } from 'vue';
import apolloClient from '../../../../apollo-client';
import gql from 'graphql-tag';
import {OnboardingStatus} from "../../utils/constants";
export const AuthKey: InjectionKey<Auth> = Symbol('Auth');

export type UserPreferences = {
  sidebarToggle: boolean;
  pageLoader: boolean;
};

export type User = {
  username: string;
  language: string;
  firstName: string;
  lastName: string;
  onboardingStatus: string | null;
  company: Company | null;
  companyOwner: boolean;
  active: boolean;
  preferences?: UserPreferences;
};

export interface Auth {
  user: User;
  isAuthenticated: boolean;
  changingState: boolean;
}

export const defaultUserPreferences: UserPreferences = {
  sidebarToggle: false,
  pageLoader: false,
};

export type Company = {
  id: string;
  name: string;
  hasAmazonIntegration?: boolean;
};


export const defaultUser: User = {
  username: '',
  language: '',
  firstName: '',
  lastName: '',
  onboardingStatus: null,
  company: null,
  companyOwner: false,
  active: false,
  preferences: { ...defaultUserPreferences },
};


export const detectAuth = (): Auth => {
  const storedUser = localStorage.getItem('auth_user');
  const user = storedUser ? JSON.parse(storedUser) : null;


  const isAuthenticated = !!storedUser;

  return {
    user: user ? user : { ...defaultUser },
    isAuthenticated: isAuthenticated,
    changingState: false,
  };
};

export const createAuth = (): Auth => {
  return reactive(detectAuth());
};

export const refreshUser = (auth: Auth, user: User): void => {
  auth.changingState = true;

  const updatedUser: User = {
    ...user,
    preferences: {
      ...defaultUserPreferences,
    },
  };

  localStorage.setItem('auth_user', JSON.stringify(updatedUser));

  auth.user = { ...updatedUser };
  auth.isAuthenticated = true;
};

export const setAuthChangingState = (auth: Auth, state: boolean): void => {
  auth.changingState = state;
};

export const resetLoadingStates = (auth: Auth): void => {
  auth.changingState = false;
  if (auth.user && auth.user.preferences) {
    auth.user.preferences.pageLoader = false;
  }
};

export const isUserPageLoading = (auth: Auth): boolean => {
  return auth.user?.preferences?.pageLoader ?? false;
};

export const setPageLoader = (auth: Auth, state: boolean): void => {
  if (auth.user && auth.user.preferences) {
    auth.user.preferences.pageLoader = state;
    localStorage.setItem('auth_user', JSON.stringify(auth.user));
  }
};


export const setCompanyToUser = (auth: Auth, company: Company): void => {
  const updatedUser = {
    ...auth.user,
    company: company,
  };

  localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  auth.user = updatedUser;
};

export const setLanguageToUser = (auth: Auth, language: string ): void => {
  const updatedUser = {
    ...auth.user,
    language: language,
  };

  localStorage.setItem('auth_user', JSON.stringify(updatedUser));
  auth.user = updatedUser;
};

export const replaceAuth = (auth: Auth, newUser: User): void => {
  refreshUser(auth, newUser);
};

export const removeAuth = async (auth) => {
  auth.changingState = true;
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
    auth.user = { ...defaultUser };
    auth.isAuthenticated = false;
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const  isAuthenticated = (auth: Auth): boolean => auth.isAuthenticated;

export const  isChangingAuthState = (auth: Auth): boolean => auth.changingState;


export const hasCompany = (auth) => auth.user && auth.user.company != null;
export const isCompanyOwner = (auth: Auth): boolean => auth.user.companyOwner;
export const isActive = (auth: Auth): boolean => auth.user.active;

export const isFinishedOnboarding = (auth: Auth): boolean => {
  const status = auth.user.onboardingStatus;
  return status === OnboardingStatus.DONE || status === OnboardingStatus.COMPLETE_DASHBOARD_CARDS || status === OnboardingStatus.DASHBOARD_CARDS_PRESENTATION;
};

export const getOnboardingStatus = (auth: Auth): string | null => auth.user.onboardingStatus;

export const injectAuth = (): Auth => {
  const auth = inject(AuthKey);
  if (!auth) {
    throw new Error('Could not inject Auth.');
  }
  return auth;
};

export const authState = createAuth();