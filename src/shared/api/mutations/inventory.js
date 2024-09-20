import { gql } from 'graphql-tag';

export const createInventoryMutation = gql`
  mutation createInventory($data: InventoryInput!) {
    createInventory(data: $data) {
      id
      product {
        id
        ... on ProductType {
          sku
        }
      }
      inventorylocation {
        id
        ... on InventoryLocationType {
          name
        }
      }
      quantity
    }
  }
`;

export const createInventoriesMutation = gql`
  mutation createInventories($data: [InventoryInput!]!) {
    createInventories(data: $data) {
      id
      product {
        id
        sku
      }
      inventorylocation {
        id
        name
      }
      quantity
    }
  }
`;

export const updateInventoryMutation = gql`
  mutation updateInventory($data: InventoryPartialInput!) {
    updateInventory(data: $data) {
      id
      product {
        id
        ... on ProductType {
          sku
        }
      }
      inventorylocation {
        id
        name
      }
      quantity
    }
  }
`;

export const deleteInventoryMutation = gql`
  mutation deleteInventory($id: GlobalID!) {
    deleteInventory(data: {id: $id}) {
      id
    }
  }
`;

export const deleteInventoriesMutation = gql`
  mutation deleteInventories($ids: [GlobalID!]!) {
    deleteInventories(data: {ids: $ids}) {
      id
    }
  }
`;

export const createInventoryLocationMutation = gql`
  mutation createInventoryLocation($data: InventoryLocationInput!) {
    createInventoryLocation(data: $data) {
      id
      name
      description
      precise
    }
  }
`;

export const createInventoryLocationsMutation = gql`
  mutation createInventoryLocations($data: [InventoryLocationInput!]!) {
    createInventoryLocations(data: $data) {
      id
      name
      description
    }
  }
`;

export const updateInventoryLocationMutation = gql`
  mutation updateInventoryLocation($data: InventoryLocationPartialInput!) {
    updateInventoryLocation(data: $data) {
      id
      name
      description
      precise
    }
  }
`;

export const deleteInventoryLocationMutation = gql`
  mutation deleteInventoryLocation($id: GlobalID!) {
    deleteInventoryLocation(data: {id: $id}) {
      id
    }
  }
`;

export const deleteInventoryLocationsMutation = gql`
  mutation deleteInventoryLocations($ids: [GlobalID!]!) {
    deleteInventoryLocations(data: {ids: $ids}) {
      id
    }
  }
`;
