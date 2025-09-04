import { ApolloClient, InMemoryCache, split } from '@apollo/client/core';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { ApolloLink } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { detectAuth, removeAuth } from './src/shared/modules/auth';
import { getRouter } from './src/shared/modules/router';
import { onError } from '@apollo/client/link/error';
import { reactive } from 'vue';
import { Toast } from "./src/shared/modules/toast";
import { i18n } from "./src/shared/plugins/i18n";

const errorLink = onError(({ graphQLErrors, networkError }) => {

  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {

      if (message.includes("not authenticated")) {
          const auth = reactive(detectAuth());
          removeAuth(auth);
          getRouter().push({ name: 'auth.login' });
      }

    });
  }

  if (networkError) {
    if (networkError.message.includes('Failed to fetch')) {
        // @ts-ignore global is working fine and is documented but we get and error like it's missing
        const message = i18n.global.t('network.error');
        Toast.error(message);
    }
  }

});

// HTTP link for queries and mutations
const httpLink = createUploadLink({
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

const mergeEdgesById = (
  existing: { edges: any[] } = { edges: [] },
  incoming: { edges: any[] },
  { readField }: any,
) => {
  const merged = existing.edges ? [...existing.edges] : [];
  incoming.edges.forEach((edge) => {
    const id = readField('id', edge.node);
    const index = merged.findIndex((e) => readField('id', e.node) === id);
    if (index > -1) {
      merged[index] = edge;
    } else {
      merged.push(edge);
    }
  });
  return {
    ...incoming,
    edges: merged,
  };
};

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        propertySelectValues: {
          keyArgs: false,
          merge: mergeEdgesById,
        },
        properties: {
          keyArgs: false,
          merge: mergeEdgesById,
        },
        products: {
          keyArgs: false,
          merge: mergeEdgesById,
        },
        medias: {
          keyArgs: false,
          merge: mergeEdgesById,
        },
      },
    },
    PropertySelectValue: {
      keyFields: ['id'],
    },
    Property: {
      keyFields: ['id'],
    },
    Product: {
      keyFields: ['id'],
    },
    Media: {
      keyFields: ['id'],
    },
  },
});

const apolloClient = new ApolloClient({
  link: combinedLink,
  cache,
});

export default apolloClient;
