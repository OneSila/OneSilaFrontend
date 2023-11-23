import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_APP_API_GRAPHQL_URL,
  credentials: 'include',
});

const cache = new InMemoryCache();

const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

export default apolloClient;
