import { gql } from 'graphql-tag';

export const ebayCategoriesQuery = gql`
  query EbayCategories(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayCategoryOrder
    $filter: EbayCategoryFilter
  ) {
    ebayCategories(
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
          fullName
          marketplaceDefaultTreeId
          hasChildren
          isRoot
          configuratorProperties
          parentNode {
            remoteId
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
