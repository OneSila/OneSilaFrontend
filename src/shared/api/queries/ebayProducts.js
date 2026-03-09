import { gql } from 'graphql-tag';

export const ebayProductCategoriesQuery = gql`
  query EbayProductCategories($filter: EbayProductCategoryFilter) {
    ebayProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          secondaryCategoryId
          salesChannel {
            id
            hostname
          }
          view {
            id
            __typename
            ... on EbaySalesChannelViewType {
              defaultCategoryTreeId
            }
          }
        }
      }
    }
  }
`;

export const ebayProductCategoriesWithProductsQuery = gql`
  query EbayProductCategoriesWithProducts($filter: EbayProductCategoryFilter) {
    ebayProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          secondaryCategoryId
          product {
            id
          }
          view {
            id
          }
        }
      }
    }
  }
`;

export const ebayProductStoreCategoriesQuery = gql`
  query EbayProductStoreCategories($filter: EbayProductStoreCategoryFilter) {
    ebayProductStoreCategories(filters: $filter) {
      edges {
        node {
          id
          product {
            id
          }
          primaryStoreCategory {
            id
            remoteId
            name
            fullPath
            order
            level
            isLeaf
            salesChannel {
              id
            }
          }
          secondaryStoreCategory {
            id
            remoteId
            name
            fullPath
            order
            level
            isLeaf
            salesChannel {
              id
            }
          }
        }
      }
    }
  }
`;

export const ebayProductStoreCategoriesWithProductsQuery = gql`
  query EbayProductStoreCategoriesWithProducts($filter: EbayProductStoreCategoryFilter) {
    ebayProductStoreCategories(filters: $filter) {
      edges {
        node {
          id
          product {
            id
          }
          primaryStoreCategory {
            id
            remoteId
            name
            fullPath
            order
            level
            isLeaf
            salesChannel {
              id
            }
          }
          secondaryStoreCategory {
            id
            remoteId
            name
            fullPath
            order
            level
            isLeaf
            salesChannel {
              id
            }
          }
        }
      }
    }
  }
`;
