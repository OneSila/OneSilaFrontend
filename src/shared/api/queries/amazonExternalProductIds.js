import { gql } from 'graphql-tag';

export const amazonExternalProductIdsQuery = gql`
  query AmazonExternalProductIds(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonExternalProductIdOrder
    $filter: AmazonExternalProductIdFilter
  ) {
    amazonExternalProductIds(
      first: $first
      last: $last
      after: $after
      before: $before
      order: $order
      filters: $filter
    ) {
      edges {
        node {
          id
          type
          value
          createdAsin
          product { id }
          view { id }
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
