import { gql } from 'graphql-tag';

export const getInventorySubscription = gql`
  subscription getInventorySubscription($pk: String!) {
    inventory(pk: $pk) {
      id
      product {
        id
        sku
        name
        supplier {
          id
          name
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

export const getInventoryLocationSubscription = gql`
  subscription getInventoryLocationSubscription($pk: String!) {
    inventoryLocation(pk: $pk) {
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
