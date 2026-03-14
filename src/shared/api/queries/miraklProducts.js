import { gql } from 'graphql-tag';

export const miraklProductCategoriesQuery = gql`
  query MiraklProductCategories($filter: MiraklProductCategoryFilter) {
    miraklProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          product {
            id
          }
          salesChannel {
            id
            hostname
          }
        }
      }
    }
  }
`;

export const miraklCategoriesQuery = gql`
  query MiraklCategories(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklCategoryOrder
    $filter: MiraklCategoryFilter
  ) {
    miraklCategories(
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
          parentCode
          level
          isLeaf
          parent {
            id
            remoteId
            name
          }
          productTypes {
            id
            remoteId
            name
            readyToPush
            templateUrl
            items {
              id
              required
              variant
              remoteProperty {
                id
                code
                name
                mappedLocally
                localInstance {
                  id
                  name
                  type
                }
              }
              localInstance {
                id
                type
                sortOrder
                property {
                  id
                  name
                }
              }
            }
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
