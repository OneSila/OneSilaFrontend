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

export const createInventoryMovementMutation = gql`
    mutation createInventoryMovement($data: InventoryMovementInput!){
      createInventoryMovement(data: $data){
        quantity
        notes
        product {
          id
        }
        movementFrom {
            ... on InventoryLocationType {
                id
            }
            ... on PurchaseOrderType {
                id
            }
        }
        movementTo {
            ... on InventoryLocationType {
                id
            }
            ... on PackageType {
                id
          }
        }
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

export const createShipmentMutation = gql`
  mutation createShipment($data: ShipmentInput!) {
    createShipment(data: $data) {
      id
      status
      fromAddress {
        id
        fullAddress
      }
      toAddress {
        id
        fullAddress
      }
      order {
        id
        reference
      }
    }
  }
`;

export const updateShipmentMutation = gql`
  mutation updateShipment($data: ShipmentPartialInput!) {
    updateShipment(data: $data) {
      id
      status
      fromAddress {
        id
        fullAddress
      }
      toAddress {
        id
        fullAddress
      }
      order {
        id
        reference
      }
    }
  }
`;

export const deleteShipmentMutation = gql`
  mutation deleteShipment($id: GlobalID!) {
    deleteShipment(data: { id: $id }) {
      id
    }
  }
`;

export const deleteShipmentsMutation = gql`
  mutation deleteShipments($ids: [GlobalID!]!) {
    deleteShipments(data: { ids: $ids }) {
      id
    }
  }
`;

export const createPackageMutation = gql`
  mutation createPackage($data: PackageInput!) {
    createPackage(data: $data) {
      id
      type
      status
      trackingCode
      trackingLink
      shipment {
        id
        status
      }
    }
  }
`;

export const updatePackageMutation = gql`
  mutation updatePackage($data: PackagePartialInput!) {
    updatePackage(data: $data) {
      id
      type
      status
      trackingCode
      trackingLink
      shipment {
        id
        status
      }
    }
  }
`;

export const deletePackageMutation = gql`
  mutation deletePackage($id: GlobalID!) {
    deletePackage(data: { id: $id }) {
      id
    }
  }
`;

export const deletePackagesMutation = gql`
  mutation deletePackages($ids: [GlobalID!]!) {
    deletePackages(data: { ids: $ids }) {
      id
    }
  }
`;

