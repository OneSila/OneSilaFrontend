import { gql } from 'graphql-tag';

export const getInventorySubscription = gql`
  subscription getInventorySubscription($pk: String!) {
    inventory(pk: $pk) {
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

export const getInventoryLocationSubscription = gql`
  subscription getInventoryLocationSubscription($pk: String!) {
    inventoryLocation(pk: $pk) {
      id
      name
      description
      precise
      location {
        id
        fullAddress
      }
    }
  }
`;
