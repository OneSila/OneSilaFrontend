import { gql } from 'graphql-tag';

export const integrationsQuery = gql`
  query Integrations($first: Int, $last: Int, $after: String, $before: String, $order: IntegrationOrder, $filter: IntegrationFilter) {
    integrations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          proxyId
          hostname
          active
          connected
          verifySsl
          requestsPerMinute
          maxRetries
          type
          saleschannelPtr {
            id
            ... on SalesChannelType {
              id
              name
              type
              hostname
            }
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
