import { ApolloClient, InMemoryCache, createHttpLink, split, ApolloCache } from '@apollo/client/core';
import { ApolloLink } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { detectAuth, removeAuth } from './src/shared/modules/auth';
import { getRouter } from './src/shared/modules/router';
import { onError } from '@apollo/client/link/error';
import { reactive } from 'vue';

const errorLink = onError(({ graphQLErrors, networkError }) => {

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      alert(message)
      if (message.includes("not authenticated")) {
          const auth = reactive(detectAuth());
          removeAuth(auth);
          getRouter().replace({ name: 'auth.login' });
      }
    });
  }

});

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_API_GRAPHQL_URL,
  credentials: 'include',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_APP_API_GRAPHQL_WEBSOCKET_URL,
  })
);

// Using split to direct subscription operations to wsLink and others to httpLink
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const combinedLink = ApolloLink.from([errorLink, splitLink]);

class NoOpCache extends ApolloCache<any> {
  public read() { return null; }
  public write() { return undefined; }
  public diff() { return { complete: false }; }
  public watch() { return () => {}; }
  public evict() { return false; }
  public restore() { return this; }
  public extract() { return {}; }
  public reset() { return Promise.resolve(); }
  public performTransaction() { }
  public removeOptimistic() {  }
}

const isDevelopment = import.meta.env.VITE_APP_SENTRY_ENV === 'development';
const cache = isDevelopment ? new NoOpCache() : new InMemoryCache();

const apolloClient = new ApolloClient({
  link: combinedLink,
  cache,
});

export default apolloClient;
