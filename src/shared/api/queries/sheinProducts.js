import { gql } from 'graphql-tag';

export const sheinProductCategoriesQuery = gql`
  query SheinProductCategories($filter: SheinProductCategoryFilter) {
    sheinProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          salesChannel {
            id
            hostname
          }
        }
      }
    }
  }
`;

export const sheinProductCategoriesWithProductsQuery = gql`
  query SheinProductCategoriesWithProducts($filter: SheinProductCategoryFilter) {
    sheinProductCategories(filters: $filter) {
      edges {
        node {
          id
          remoteId
          product {
            id
          }
          salesChannel {
            id
          }
        }
      }
    }
  }
`;

export const sheinProductsQuery = gql`
  query SheinProducts($first: Int, $filter: SheinProductFilter) {
    sheinProducts(first: $first, filters: $filter) {
      edges {
        node {
          id
        }
      }
    }
  }
`;
