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
          }
          stocklocation {
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

export const getInventoryQuery = gql`
  query getInventory($id: GlobalID!) {
    inventory(id: $id) {
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

export const inventoryLocationsQuery = gql`
  query InventoryLocations($first: Int, $last: Int, $after: String, $before: String, $order: InventoryLocationOrder, $filter: InventoryLocationFilter) {
    inventoryLocations(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          description
          location {
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
      location {
          id
          fullAddress
      }
    }
  }
`;
