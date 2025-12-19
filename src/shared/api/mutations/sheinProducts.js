import { gql } from 'graphql-tag';

export const createSheinProductCategoryMutation = gql`
  mutation createSheinProductCategory($data: SheinProductCategoryInput!) {
    createSheinProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const updateSheinProductCategoryMutation = gql`
  mutation updateSheinProductCategory($data: SheinProductCategoryPartialInput!) {
    updateSheinProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const deleteSheinProductCategoryMutation = gql`
  mutation deleteSheinProductCategory($data: NodeInput!) {
    deleteSheinProductCategory(data: $data) {
      id
    }
  }
`;

