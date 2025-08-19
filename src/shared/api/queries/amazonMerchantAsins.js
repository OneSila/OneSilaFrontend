import { gql } from 'graphql-tag';

export const amazonMerchantAsinsQuery = gql`
  query AmazonMerchantAsins(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonMerchantAsinOrder
    $filter: AmazonMerchantAsinFilter
  ) {
    amazonMerchantAsins(
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
          asin
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
