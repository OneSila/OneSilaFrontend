import { gql } from 'graphql-tag';

export const leadTimeSubscription = gql`
  subscription getLeadTimeSubscription($pk: String!) {
    leadTime(pk: $pk) {
      id
      minTime
      maxTime
      unit
    }
  }
`;

export const leadTimeForShippingAddressSubscription = gql`
  subscription getLeadTimeForShippingAddressSubscription($pk: String!) {
    leadTimeForShippingAddress(pk: $pk) {
      id
      shippingaddress {
        id
        name
      }
      leadtime {
        id
        minTime
        maxTime
        unit
      }
    }
  }
`;

export const leadTimeProductOutOfStockSubscription = gql`
  subscription getLeadTimeProductOutOfStockSubscription($pk: String!) {
    leadTimeProductOutOfStock(pk: $pk) {
      id
      product {
        id
        name
      }
      leadtimeOutofstock {
        id
        minTime
        maxTime
        unit
      }
    }
  }
`;