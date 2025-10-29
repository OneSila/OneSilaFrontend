import { gql } from 'graphql-tag';

export const createEbayProductCategoryMutation = gql`
  mutation createEbayProductCategory($data: EbayProductCategoryInput!) {
    createEbayProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const updateEbayProductCategoryMutation = gql`
  mutation updateEbayProductCategory($data: EbayProductCategoryPartialInput!) {
    updateEbayProductCategory(data: $data) {
      id
      remoteId
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
