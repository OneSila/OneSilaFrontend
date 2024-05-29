import { gql } from 'graphql-tag';

export const createEanCodeMutation = gql`
  mutation createEanCode($data: EanCodeInput!) {
    createEanCode(data: $data) {
      id
      eanCode
      product {
        id
        ... on ProductType {
          sku
          name
        }
      }
    }
  }
`;

export const createEanCodesMutation = gql`
  mutation createEanCodes($data: [EanCodeInput!]!) {
    createEanCodes(data: $data) {
      id
      eanCode
      product {
        id
        ... on ProductType {
          sku
          name
        }
      }
    }
  }
`;

export const updateEanCodeMutation = gql`
  mutation updateEanCode($data: EanCodePartialInput!) {
    updateEanCode(data: $data) {
      id
      eanCode
      product {
        id
        ... on ProductType {
          sku
          name
        }
      }
    }
  }
`;

export const deleteEanCodeMutation = gql`
  mutation deleteEanCode($id: GlobalID!) {
    deleteEanCode(data: {id: $id}) {
      id
    }
  }
`;

export const deleteEanCodesMutation = gql`
  mutation deleteEanCodes($ids: [GlobalID!]!) {
    deleteEanCodes(data: {ids: $ids}) {
      id
    }
  }
`;
