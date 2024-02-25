import { gql } from 'graphql-tag';

export const createTaxMutation = gql`
  mutation createTax($data: TaxInput!) {
    createTax(data: $data) {
      id
      rate
      name
    }
  }
`;

export const createTaxesMutation = gql`
  mutation createTaxes($data: [TaxInput!]!) {
    createTaxes(data: $data) {
      id
      rate
      name
    }
  }
`;

export const updateTaxMutation = gql`
  mutation updateTax($data: TaxPartialInput!) {
    updateTax(data: $data) {
      id
      rate
      name
    }
  }
`;

export const deleteTaxMutation = gql`
  mutation deleteTax($id: GlobalID!) {
    deleteTax(data: {id: $id}) {
      id
    }
  }
`;

export const deleteTaxesMutation = gql`
  mutation deleteTaxes($ids: [GlobalID!]!) {
    deleteTaxes(data: {ids: $ids}) {
      id
    }
  }
`;
