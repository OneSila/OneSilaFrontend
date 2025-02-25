import { gql } from 'graphql-tag';

export const getInventorySubscription = gql`
  subscription getInventorySubscription($pk: String!) {
    inventory(pk: $pk) {
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

export const shipmentSubscription = gql`
  subscription getShipmentSubscription($pk: String!) {
    shipment(pk: $pk) {
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

export const packageSubscription = gql`
  subscription getPackageSubscription($pk: String!) {
    package(pk: $pk) {
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
    }
  }
`;