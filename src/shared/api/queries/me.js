import { gql } from 'graphql-tag';

export const membersQuery = gql`
  query Users($first: Int, $last: Int, $after: String, $before: String, $order: MultiTenantUserOrder, $filter: MultiTenantUserFilter) {
    users(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
          node {
            id
            fullName
          }
      }
    }
  }
`;

export const hasDemoDataQuery = gql`
  query HasDemoDatas {
    hasDemoData {
      hasDemoData
    }
  }
`;
