import { Plugin } from 'vue';
import { reactive } from 'vue';
import urql, {
  dedupExchange,
  cacheExchange,
  errorExchange,
  makeOperation,
  CombinedError,
} from '@urql/vue';
import { authExchange } from '@urql/exchange-auth';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

import { AuthKey, detectAuth, removeAuth, replaceAuth } from '../modules/auth';
import { getRouter } from '../modules/router';
import { NetworkKey } from '../modules/network';
import { Toast } from '../modules/toast';

const refreshMutation = `
mutation($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    payload,
    refreshExpiresIn,
    refreshToken,
    token
  }
}
`;

export default {
  install(app) {
    const auth = reactive(detectAuth());

    const network = reactive({
      connected: true,
    });

    let needsRefresh = false;

    app.provide(AuthKey, auth);
    app.provide(NetworkKey, network);

    app.use(urql, {
      url: import.meta.env.VITE_APP_API_GRAPHQL_URL,
      requestPolicy: 'cache-and-network',
      exchanges: [
        dedupExchange,
        cacheExchange,
        authExchange({
          getAuth: async ({ authState, mutate }) => {
            if (!authState) {
              if (auth.token) {
                return {
                  token: auth.token,
                  refreshToken: auth.refreshToken,
                  expiresAt: auth.expiresAt,
                };
              }

              return null;
            }

            needsRefresh = true;

            const { data } = await mutate(refreshMutation, {
              refreshToken: auth.refreshToken,
            });

            needsRefresh = false;

            if (data?.refreshToken) {
              const token = data.refreshToken.token;
              const refreshToken = data.refreshToken.refreshToken;
              const email = data.refreshToken.payload.email;
              const expiresAt = data.refreshToken.payload.exp * 1000;

              auth.token = token;
              auth.refreshToken = refreshToken;
              auth.user.email = email;
              auth.expiresAt = expiresAt;

              replaceAuth(auth);

              return {
                token: auth.token,
                refreshToken: auth.refreshToken,
                expiresAt: auth.expiresAt,
              };
            }

            removeAuth(auth);
            getRouter().replace({ name: 'auth.login' });

            return null;
          },
          addAuthToOperation: ({ authState, operation }: any) => {
            // network.connected = true;

            if ((!authState || !authState.token) && !auth.token) {
              return operation;
            }

            const fetchOptions =
              typeof operation.context.fetchOptions === 'function'
                ? operation.context.fetchOptions()
                : operation.context.fetchOptions || {};

            return makeOperation(operation.kind, operation, {
              ...operation.context,
              fetchOptions: {
                ...fetchOptions,
                headers: {
                  ...fetchOptions.headers,
                  ...(!needsRefresh && { Authorization: `JWT ${auth.token}` }),
                },
              },
            });
          },
          didAuthError: ({ error }) =>
            error.graphQLErrors.some(
              (e) => e.message === 'Signature has expired',
            ),
        }),
        errorExchange({
          onError: (error: CombinedError) => {
            if (error.networkError) {
              network.connected = false;
              Toast.dismissAll();
            }

            return error;
          },
        }),
        multipartFetchExchange,
      ],
    });
  },
} as Plugin;
