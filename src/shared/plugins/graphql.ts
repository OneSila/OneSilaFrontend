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


export default {
  install(app) {
    const auth = reactive(detectAuth());

    const network = reactive({
      connected: true,
    });

    app.provide(AuthKey, auth);
    app.provide(NetworkKey, network);

    // @ts-ignore
    app.use(urql, {
      // @ts-ignore
      url: import.meta.env.VITE_APP_API_GRAPHQL_URL,
      requestPolicy: 'cache-and-network',
      exchanges: [
        dedupExchange,
        cacheExchange,
        errorExchange({
          onError: (error: CombinedError) => {
            if (error.networkError) {
              network.connected = false;
              Toast.dismissAll();
            }
            if (error.graphQLErrors) {
              error.graphQLErrors.forEach((graphQLError) => {
                if (graphQLError.message === "Not authenticated") {
                  removeAuth(auth);
                  getRouter().replace({ name: 'auth.login' });
                }
              });
            }
          },
        }),
        multipartFetchExchange,
      ],
    });
  },
} as Plugin;
