import { inject, InjectionKey, reactive } from 'vue';
import { useMutation, provideApolloClient } from '@vue/apollo-composable';
import apolloClient from '../../../../apollo-client';
import gql from 'graphql-tag';
import { useSafeRequest } from '../network';
import { Ref} from "vue/dist/vue";
import { ref } from 'vue';
export const AuthKey: InjectionKey<Auth> = Symbol('Auth');

export type User = {
  id: number | null;
  username: string;
  language: string;
  firstName: string;
  lastName: string;
};

export interface Auth {
  user: User;
  isAuthenticated: boolean;
}

export const detectAuth = (): Auth => {
  const storedUser = localStorage.getItem('auth_user');
  const user = storedUser ? JSON.parse(storedUser) : { id: null, username: '', language: 'en', firstName: '', lastName: '' };

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

export const replaceAuth = (auth: Auth, newUser: User): void => {
  refreshUser(auth, newUser);
};

export const removeAuth = (auth: Auth): void => {

  provideApolloClient(apolloClient);
  const errors: Ref<any[]> = ref([]);
  const safeRequest = useSafeRequest(errors);
  const LOGOUT_MUTATION = gql`
        mutation Logout {
          logout
        }`;

  const {mutate, loading} = useMutation(LOGOUT_MUTATION);
  const response = safeRequest(() => mutate());

  // console.log(apolloClient.cache)
  // apolloClient.resetStore();

  localStorage.removeItem('auth_user');
  auth.user = {
    id: null,
    username: '',
    language: 'en',
    firstName: '',
    lastName: '',
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