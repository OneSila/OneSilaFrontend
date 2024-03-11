import { gql } from 'graphql-tag';

export const createHsCodeMutation = gql`
  mutation createHsCode($data: HsCodeInput!) {
    createHsCode(data: $data) {
      id
      name
      code
      product {
        id
        ... on ProductType {
          sku
        }
      }
    }
  }
`;

export const createHsCodesMutation = gql`
  mutation createHsCodes($data: [HsCodeInput!]!) {
    createHsCodes(data: $data) {
      id
      name
      code
      product {
        id
        ... on ProductType {
          sku
        }
      }
    }
  }
`;

export const updateHsCodeMutation = gql`
  mutation updateHsCode($data: HsCodePartialInput!) {
    updateHsCode(data: $data) {
      id
      name
      code
    }
  }
`;

export const deleteHsCodeMutation = gql`
  mutation deleteHsCode($id: GlobalID!) {
    deleteHsCode(data: {id: $id}) {
      id
    }
  }
`;

export const deleteHsCodesMutation = gql`
  mutation deleteHsCodes($ids: [GlobalID!]!) {
    deleteHsCodes(data: {ids: $ids}) {
      id
    }
  }
`;
