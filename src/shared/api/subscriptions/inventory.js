import { gql } from 'graphql-tag';

export const getInventorySubscription = gql`
  subscription getInventorySubscription($pk: String!) {
    inventory(pk: $pk) {
      id
      product {
        id
        sku
        // other product fields as needed
      }
      stocklocation {
        id
        name
        // other stocklocation fields as needed
      }
      quantity
    }
  }
`;

export const getInventoryLocationSubscription = gql`
  subscription getInventoryLocationSubscription($pk: String!) {
    inventoryLocation(pk: $pk) {
      id
      name
      description
      parentLocation {
        id
        name
      }
    }
  }
`;
