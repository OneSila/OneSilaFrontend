import { gql } from 'graphql-tag';

export const orderSubscription = gql`
  subscription getOrderSubscription($pk: String!) {
    order(pk: $pk) {
      id
      reference
      company {
        id
        name
      }
      invoiceAddress {
        id
        address
      }
      shippingAddress {
        id
        address
      }
      currency {
        id
        symbol
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
