import { gql } from 'graphql-tag';

export const salesPricesQuery = gql`
  query SalesPrices($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceOrder, $filter: SalesPriceFilter) {
    salesPrices(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          realId
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
            inheritsFrom {
              id
            }
          }
          price
          rrp
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
          price
          rrp
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
          discountPcnt
          priceChangePcnt
          notes
          currency {
            id
            symbol
            isoCode
          }
          vatIncluded
          autoUpdatePrices
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

export const salesPriceListsQuerySelector = gql`
  query SalesPriceLists($first: Int, $last: Int, $after: String, $before: String, $order: SalesPriceListOrder, $filter: SalesPriceListFilter) {
    salesPriceLists(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
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
            discountPcnt
            currency {
              id
              isoCode
              symbol
            }
          }
          product {
            id
            sku
            name
          }
          price
          discount
          priceAuto
          discountAuto
          priceOverride
          discountOverride
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

export const salesPriceListItemsProductIdsQuery = gql`
  query SalesPriceListItemProductIds($filter: SalesPriceListItemFilter, $first: Int) {
    salesPriceListItems(first: $first, filters: $filter) {
      edges {
        node {
          id
          product {
            id
          }
        }
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
      price
      rrp
    }
  }
`;

export const getSalesPriceListQuery = gql`
  query getSalesPriceList($id: GlobalID!) {
    salesPriceList(id: $id) {
      id
      name
      priceChangePcnt
      discountPcnt
      autoAddProducts
      notes
      currency {
        id
        symbol
        isoCode
      }
      vatIncluded
      autoUpdatePrices
      startDate
      endDate
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
      price
      discount
      priceAuto
      discountAuto
      priceOverride
      discountOverride
    }
  }
`;
