import { gql } from 'graphql-tag';

export const createEbayProductCategoryMutation = gql`
  mutation createEbayProductCategory($data: EbayProductCategoryInput!) {
    createEbayProductCategory(data: $data) {
      id
      remoteId
      secondaryCategoryId
    }
  }
`;

export const updateEbayProductCategoryMutation = gql`
  mutation updateEbayProductCategory($data: EbayProductCategoryPartialInput!) {
    updateEbayProductCategory(data: $data) {
      id
      remoteId
      secondaryCategoryId
    }
  }
`;

export const deleteEbayProductCategoryMutation = gql`
  mutation deleteEbayProductCategory($data: NodeInput!) {
    deleteEbayProductCategory(data: $data) {
      id
    }
  }
`;

export const createEbayProductStoreCategoryMutation = gql`
  mutation createEbayProductStoreCategory($data: EbayProductStoreCategoryInput!) {
    createEbayProductStoreCategory(data: $data) {
      id
      primaryStoreCategory {
        id
        remoteId
        fullPath
      }
      secondaryStoreCategory {
        id
        remoteId
        fullPath
      }
    }
  }
`;

export const updateEbayProductStoreCategoryMutation = gql`
  mutation updateEbayProductStoreCategory($data: EbayProductStoreCategoryPartialInput!) {
    updateEbayProductStoreCategory(data: $data) {
      id
      primaryStoreCategory {
        id
        remoteId
        fullPath
      }
      secondaryStoreCategory {
        id
        remoteId
        fullPath
      }
    }
  }
`;

export const deleteEbayProductStoreCategoryMutation = gql`
  mutation deleteEbayProductStoreCategory($data: NodeInput!) {
    deleteEbayProductStoreCategory(data: $data) {
      id
    }
  }
`;

export const pullEbayStoreCategoriesMutation = gql`
  mutation pullEbayStoreCategories($instance: EbaySalesChannelPartialInput!) {
    pullEbayStoreCategories(instance: $instance) {
      id
    }
  }
`;
