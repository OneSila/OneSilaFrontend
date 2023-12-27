import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP link for queries and mutations
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_API_GRAPHQL_URL,
  credentials: 'include',
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8080/graphql/', // Your WebSocket endpoint
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

// Apollo Client
const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
});

export default apolloClient;
