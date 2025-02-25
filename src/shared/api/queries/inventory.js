import { gql } from 'graphql-tag';

export const inventoriesQuery = gql`
query Inventories($first: Int, $last: Int, $after: String, $before: String, $order: InventoryOrder, $filter: InventoryFilter) {
    inventories(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          product {
            id
            sku
            name
          }
          inventorylocation {
            id
            name
          }
          quantity
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
}
`;

export const inventoryMovementsQuery = gql`
  query InventoryMovements($first: Int, $last: Int, $after: String, $before: String, $filter: InventoryMovementFilter) {
    inventoryMovements(first: $first, last: $last, after: $after, before: $before, filters: $filter) {
      edges {
        node {
          id
          name
          createdAt
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getInventoryQuery = gql`
  query getInventory($id: GlobalID!) {
    inventory(id: $id) {
      id
      product {
        id
        sku
        name
      }
      inventorylocation {
        id
         name
      }
      quantity
    }
  }
`;

export const inventoryLocationsQuery = gql`
  query InventoryLocations($first: Int, $last: Int, $after: String, $before: String, $order: InventoryLocationOrder, $filter: InventoryLocationFilter) {
    inventoryLocations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          description
          precise
          isInternalLocation
          shippingaddress {
              id
              fullAddress
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getInventoryLocationQuery = gql`
  query getInventoryLocation($id: GlobalID!) {
    inventoryLocation(id: $id) {
      id
      name
      description
      precise
      shippingaddress {
          id
          fullAddress
      }
    }
  }
`;

export const shipmentsQuery = gql`
  query Shipments($first: Int, $last: Int, $after: String, $before: String, $order: ShipmentOrder, $filter: ShipmentFilter) {
    shipments(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          status
          reference
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
            createdAt
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getShipmentQuery = gql`
  query GetShipment($id: GlobalID!) {
    shipment(id: $id) {
      id
      status
      reference
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

// Package queries
export const packagesQuery = gql`
  query Packages($first: Int, $last: Int, $after: String, $before: String, $order: PackageOrder, $filter: PackageFilter) {
    packages(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getPackageQuery = gql`
  query GetPackage($id: GlobalID!) {
    package(id: $id) {
      id
      type
      status
      trackingCode
      trackingLink
      shippingLabel {
        name
        size
        url
      }
      customsDocument {
        name
        size
        url
      }
      shipment {
        id
        status
      }
    }
  }
`;

export const packageItemsQuery = gql`
  query PackageItems($first: Int, $last: Int, $after: String, $before: String, $order: PackageItemOrder, $filter: PackageItemFilter) {
    packageitems(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          quantity
          package {
            id
            type
          }
          product {
            id
            name
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getPackageItemQuery = gql`
  query GetPackageItem($id: GlobalID!) {
    packageItem(id: $id) {
      id
      quantity
      package {
        id
        type
      }
      product {
        id
        name
      }
    }
  }
`;

// ShipmentItemToShip queries
export const shipmentItemsToShipQuery = gql`
  query ShipmentItemsToShip($first: Int, $last: Int, $after: String, $before: String, $order: ShipmentItemToShipOrder, $filter: ShipmentItemToShipFilter) {
    shipmentitemstoship(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          quantity
          product {
            id
            name
          }
          inventorylocation {
            id
            name
          }
        }
        cursor
      }
      totalCount
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getShipmentItemToShipQuery = gql`
  query GetShipmentItemToShip($id: GlobalID!) {
    shipmentItemToShip(id: $id) {
      id
      quantity
      shipment {
        id
        status
      }
      product {
        id
        name
      }
      orderItem {
        id
        quantity
      }
    }
  }
`;


export const getItemPickingLocation = gql`
 query ItemPickingLocation($itemToShipId: ID!) {
   pickingLocations(itemToShipId: $itemToShipId) {
     location {
       id
       name
       shippingaddress {
         id
       }
       isInternalLocation
     }
     quantity
   }
 }
`;