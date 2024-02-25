import { gql } from 'graphql-tag';

export const taxesQuery = gql`
  query Taxes($first: Int, $last: Int, $after: String, $before: String, $order: TaxOrder, $filter: TaxFilter) {
    taxes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          rate
          name
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

export const getTaxQuery = gql`
  query getTax($id: GlobalID!) {
    tax(id: $id) {
      id
      rate
      name
    }
  }
`;
