import { gql } from 'graphql-tag';

export const createAmazonExternalProductIdMutation = gql`
  mutation createAmazonExternalProductId($data: AmazonExternalProductIdInput!) {
    createAmazonExternalProductId(data: $data) {
      id
      type
      value
      createdAsin
    }
  }
`;

export const updateAmazonExternalProductIdMutation = gql`
  mutation updateAmazonExternalProductId($data: AmazonExternalProductIdPartialInput!) {
    updateAmazonExternalProductId(data: $data) {
      id
      type
      value
      createdAsin
    }
  }
`;

export const deleteAmazonExternalProductIdMutation = gql`
  mutation deleteAmazonExternalProductId($id: GlobalID!) {
    deleteAmazonExternalProductId(data: { id: $id }) {
      id
    }
  }
`;
