import { gql } from 'graphql-tag';

export const createVatRateMutation = gql`
  mutation createVatRate($data: VatRateInput!) {
    createVatRate(data: $data) {
      id
      rate
      name
    }
  }
`;

export const createVatRatesMutation = gql`
  mutation createVatRates($data: [VatRateInput!]!) {
    createVatRates(data: $data) {
      id
      rate
      name
    }
  }
`;

export const updateVatRateMutation = gql`
  mutation updateVatRate($data: VatRatePartialInput!) {
    updateVatRate(data: $data) {
      id
      rate
      name
    }
  }
`;

export const deleteVatRateMutation = gql`
  mutation deleteVatRate($id: GlobalID!) {
    deleteVatRate(data: {id: $id}) {
      id
    }
  }
`;

export const deleteVatRatesMutation = gql`
  mutation deleteVatRates($ids: [GlobalID!]!) {
    deleteVatRates(data: {ids: $ids}) {
      id
    }
  }
`;
