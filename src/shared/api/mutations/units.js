import { gql } from 'graphql-tag';

export const createUnitMutation = gql`
  mutation createUnit($data: UnitInput!) {
    createUnit(data: $data) {
      id
      name
      unit
    }
  }
`;

export const createUnitsMutation = gql`
  mutation createUnits($data: [UnitInput!]!) {
    createUnits(data: $data) {
      id
      name
      unit
    }
  }
`;

export const updateUnitMutation = gql`
  mutation updateUnit($data: UnitPartialInput!) {
    updateUnit(data: $data) {
      id
      name
      unit
    }
  }
`;

export const deleteUnitMutation = gql`
  mutation deleteUnit($id: ID!) {
    deleteUnit(data: {id: $id}) {
      id
    }
  }
`;

export const deleteUnitsMutation = gql`
  mutation deleteUnits($ids: [ID!]!) {
    deleteUnits(data: {ids: $ids}) {
      id
    }
  }
`;
