import { gql } from 'graphql-tag';

export const orderSubscription = gql`
  subscription getOrderSubscription($pk: String!) {
    order(pk: $pk) {
      id
      reference
      totalValue
      customer {
        id
        name
      }
      invoiceAddress {
        id
        address1
        address2
        address3
        vatNumber
        eoriNumber
        fullAddress
      }
      shippingAddress {
        id
        address1
        address2
        address3
        vatNumber
        eoriNumber
        fullAddress
      }
      currency {
        id
        symbol
        isoCode
      }
      priceInclVat
      status
      reasonForSale
      createdAt
      updatedAt
    }
  }
`;

export const orderItemSubscription = gql`
  subscription getOrderItemSubscription($pk: String!) {
    orderItem(pk: $pk) {
      id
      order {
        id
        reference
      }
      product {
        id
        name
      }
      quantity
      price
    }
  }
`;

export const orderNoteSubscription = gql`
  subscription getOrderNoteSubscription($pk: String!) {
    orderNote(pk: $pk) {
      id
      order {
        id
        reference
      }
      note
    }
  }
`;
