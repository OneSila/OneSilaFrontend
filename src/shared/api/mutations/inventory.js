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
      stocklocation {
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
      stocklocation {
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
      stocklocation {
        id
        ... on InventoryLocationType {
          name
        }
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
    createInventoryLocationType(data: $data) {
      id
      name
      description
      precise
    }
  }
`;

export const createInventoryLocationsMutation = gql`
  mutation createInventoryLocations($data: [InventoryLocationInput!]!) {
    createInventoryLocationTypes(data: $data) {
      id
      name
      description
    }
  }
`;

export const updateInventoryLocationMutation = gql`
  mutation updateInventoryLocation($data: InventoryLocationPartialInput!) {
    updateInventoryLocationType(data: $data) {
      id
      name
      description
      precise
    }
  }
`;

export const deleteInventoryLocationMutation = gql`
  mutation deleteInventoryLocation($id: GlobalID!) {
    deleteInventoryLocationType(data: {id: $id}) {
      id
    }
  }
`;

export const deleteInventoryLocationsMutation = gql`
  mutation deleteInventoryLocations($ids: [GlobalID!]!) {
    deleteInventoryLocationTypes(data: {ids: $ids}) {
      id
    }
  }
`;
