import { gql } from 'graphql-tag';

export const sheinCategoriesQuery = gql`
  query SheinCategories(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinCategoryOrder
    $filter: SheinCategoryFilter
  ) {
    sheinCategories(
      first: $first
      last: $last
      after: $after
      before: $before
      order: $order
      filters: $filter
    ) {
      edges {
        node {
          remoteId
          name
          siteRemoteId
          parentRemoteId
          isLeaf
          productTypeRemoteId
          parent {
            remoteId
            name
          }
          children {
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
