import { gql } from 'graphql-tag';

export const salesPricesQuery = gql`
  query SalesPrices($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceOrder, $filter: SalesPriceFilter) {
    salesPrices(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          product {
            id
            sku
          }
          currency {
            id
            symbol
            isoCode
            isDefaultCurrency
            followOfficialRate
          }
          amount
          discountAmount
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

export const getSalesPriceByProductAndCurrencyQuery = gql`
  query getSalesPriceByProductAndCurrency($currencyId: GlobalID!, $productId: GlobalID!) {
    salesPrices(filters:  {currency: {id:{exact: $currencyId}}, product: {id: {exact: $productId}}}) {
      edges {
        node {
          id
          product {
            id
            sku
          }
          currency {
            id
            symbol
            isoCode
          }
          amount
          discountAmount
        }
      }
    }
  }
`;


export const salesPriceListsQuery = gql`
  query SalesPriceLists($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceListOrder, $filter: SalesPriceListFilter) {
    salesPriceLists(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          discount
          notes
          currency {
            id
            symbol
            isoCode
          }
          vatIncluded
          autoUpdate
          customers {
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

export const salesPriceListItemsQuery = gql`
  query SalesPriceListItems($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceListItemOrder, $filter: SalesPriceListItemFilter) {
    salesPriceListItems(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          salespricelist {
            id
            name
          }
          product {
            id
            sku
            name
          }
          salesprice
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

export const getSalesPriceQuery = gql`
  query getSalesPrice($id: GlobalID!) {
    salesPrice(id: $id) {
      id
      product {
        id
        sku
      }
      currency {
        id
        symbol
        isoCode
      }
      amount
      discountAmount
    }
  }
`;

export const getSalesPriceListQuery = gql`
  query getSalesPriceList($id: GlobalID!) {
    salesPriceList(id: $id) {
      id
      name
      discount
      notes
      currency {
        id
        symbol
        isoCode
      }
      vatIncluded
      autoUpdate
      startDate
      endDate
      customers {
        id
        name
      }
      salespricelistitemSet {
        id
        product {
          id
        }
      }
    }
  }
`;

export const getSalesPriceListItemQuery = gql`
  query getSalesPriceListItem($id: GlobalID!) {
    salesPriceListItem(id: $id) {
      id
      salespricelist {
        id
        name
      }
      product {
        id
        sku
        name
      }
      salesprice
    }
  }
`;
