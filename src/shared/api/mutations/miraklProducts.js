import { gql } from 'graphql-tag';

export const createMiraklProductCategoryMutation = gql`
  mutation CreateMiraklProductCategory($data: MiraklProductCategoryInput!) {
    createMiraklProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const updateMiraklProductCategoryMutation = gql`
  mutation UpdateMiraklProductCategory($data: MiraklProductCategoryPartialInput!) {
    updateMiraklProductCategory(data: $data) {
      id
      remoteId
    }
  }
`;

export const deleteMiraklProductCategoryMutation = gql`
  mutation DeleteMiraklProductCategory($data: NodeInput!) {
    deleteMiraklProductCategory(data: $data) {
      id
    }
  }
`;
