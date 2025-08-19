import { gql } from 'graphql-tag';

export const createAmazonMerchantAsinMutation = gql`
  mutation createAmazonMerchantAsin($data: AmazonMerchantAsinInput!) {
    createAmazonMerchantAsin(data: $data) {
      id
      asin
    }
  }
`;

export const updateAmazonMerchantAsinMutation = gql`
  mutation updateAmazonMerchantAsin($data: AmazonMerchantAsinPartialInput!) {
    updateAmazonMerchantAsin(data: $data) {
      id
      asin
    }
  }
`;

export const deleteAmazonMerchantAsinMutation = gql`
  mutation deleteAmazonMerchantAsin($id: GlobalID!) {
    deleteAmazonMerchantAsin(data: { id: $id }) {
      id
    }
  }
`;
