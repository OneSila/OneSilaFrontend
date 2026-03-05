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
