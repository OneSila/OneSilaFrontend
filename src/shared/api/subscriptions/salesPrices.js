import { gql } from 'graphql-tag';

export const salesPriceSubscription = gql`
  subscription getSalesPriceSubscription($pk: String!) {
    salesPrice(pk: $pk) {
      id
      product {
        id
        sku
      }
      currency {
        id
        symbol
      }
      amount
      discountAmount
    }
  }
`;

export const salesPriceListSubscription = gql`
  subscription getSalesPriceListSubscription($pk: String!) {
    salesPriceList(pk: $pk) {
      id
      name
      discount
      currency {
        id
        symbol
      }
      vatIncluded
      autoUpdate
      customers {
        id
        name
      }
    }
  }
`;

export const salesPriceListItemSubscription = gql`
  subscription getSalesPriceListItemSubscription($pk: String!) {
    salesPriceListItem(pk: $pk) {
      id
      salespricelist {
        id
        name
      }
      product {
        id
        sku
      }
      salesprice
    }
  }
`;
