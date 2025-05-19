import { gql } from 'graphql-tag';

export const integrationsQuery = gql`
  query Integrations($first: Int, $last: Int, $after: String, $before: String, $order: IntegrationOrder, $filter: IntegrationFilter) {
    integrations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          proxyId
          hostname
          active
          connected
          verifySsl
          requestsPerMinute
          maxRetries
          type
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
