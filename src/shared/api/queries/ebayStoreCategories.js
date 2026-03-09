import { gql } from 'graphql-tag';

export const ebayStoreCategoriesQuery = gql`
  query EbayStoreCategories(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayStoreCategoryOrder
    $filter: EbayStoreCategoryFilter
  ) {
    ebayStoreCategories(
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
          fullPath
          order
          level
          isLeaf
          parent {
            id
            remoteId
            name
          }
          salesChannel {
            id
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
