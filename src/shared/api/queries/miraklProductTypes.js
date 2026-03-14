import { gql } from 'graphql-tag';

export const miraklProductTypesForCategoryMappingQuery = gql`
  query MiraklProductTypesForCategoryMapping(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklProductTypeOrder
    $filter: MiraklProductTypeFilter
  ) {
    miraklProductTypes(
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
          remoteId
          name
          category {
            id
            remoteId
            name
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
