import { gql } from 'graphql-tag';

export const createAmazonGtinExemptionMutation = gql`
  mutation createAmazonGtinExemption($data: AmazonGtinExemptionInput!) {
    createAmazonGtinExemption(data: $data) {
      id
      value
    }
  }
`;

export const updateAmazonGtinExemptionMutation = gql`
  mutation updateAmazonGtinExemption($data: AmazonGtinExemptionPartialInput!) {
    updateAmazonGtinExemption(data: $data) {
      id
      value
    }
  }
`;
