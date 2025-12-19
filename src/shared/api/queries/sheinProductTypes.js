import { gql } from 'graphql-tag';

export const sheinProductTypesForCategoryMappingQuery = gql`
  query SheinProductTypesForCategoryMapping(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinProductTypeOrder
    $filter: SheinProductTypeFilter
  ) {
    sheinProductTypes(
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
          name
          translatedName
          remoteId
          categoryId
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

