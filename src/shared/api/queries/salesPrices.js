import { gql } from 'graphql-tag';

export const salesPricesQuery = gql`
  query SalesPrices($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceOrder, $filter: SalesPriceFilter) {
    salesPrices(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          product {
            id
            name
            // Additional Product fields
          }
          currency {
            id
            symbol
          }
          amount
          discountAmount
          // Additional fields as needed
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

export const salesPriceListsQuery = gql`
  query SalesPriceLists($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceListOrder, $filter: SalesPriceListFilter) {
    salesPriceLists(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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
            // Additional Customer fields
          }
          // Additional fields as needed
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
            // Additional SalesPriceList fields
          }
          product {
            id
            name
            // Additional Product fields
          }
          salesprice
          // Additional fields as needed
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
        name
        // Additional Product fields
      }
      currency {
        id
        symbol
      }
      amount
      discountAmount
      // Additional fields as needed
    }
  }
`;

export const getSalesPriceListQuery = gql`
  query getSalesPriceList($id: GlobalID!) {
    salesPriceList(id: $id) {
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
        // Additional Customer fields
      }
      // Additional fields as needed
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
        // Additional SalesPriceList fields
      }
      product {
        id
        name
        // Additional Product fields
      }
      salesprice
      // Additional fields as needed
    }
  }
`;
