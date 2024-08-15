import { gql } from 'graphql-tag';

export const createSalesPriceMutation = gql`
  mutation createSalesPrice($data: SalesPriceInput!) {
    createSalesPrice(data: $data) {
      id
      product {
        id
        sku
      }
      currency {
        id
        symbol
      }
      rrp
      price
    }
  }
`;

export const createSalesPricesMutation = gql`
  mutation createSalesPrices($data: [SalesPriceInput!]!) {
    createSalesPrices(data: $data) {
      id
      product {
        id
        sku
      }
      currency {
        id
        symbol
      }
      rrp
      price
    }
  }
`;

export const updateSalesPriceMutation = gql`
  mutation updateSalesPrice($data: SalesPricePartialInput!) {
    updateSalesPrice(data: $data) {
      id
      product {
        id
        sku
      }
      currency {
        id
        symbol
      }
      rrp
      price
    }
  }
`;

export const deleteSalesPriceMutation = gql`
  mutation deleteSalesPrice($id: GlobalID!) {
    deleteSalesPrice(data: {id: $id}) {
      id
    }
  }
`;

export const deleteSalesPricesMutation = gql`
  mutation deleteSalesPrices($ids: [GlobalID!]!) {
    deleteSalesPrices(data: {ids: $ids}) {
      id
    }
  }
`;

export const createSalesPriceListMutation = gql`
  mutation createSalesPriceList($data: SalesPriceListInput!) {
    createSalesPriceList(data: $data) {
      id
      name
      discountPcnt
      notes
      currency {
        id
        symbol
      }
      vatIncluded
      autoUpdatePrices
      startDate
      endDate
    }
  }
`;

export const createSalesPriceListsMutation = gql`
  mutation createSalesPriceLists($data: [SalesPriceListInput!]!) {
    createSalesPriceLists(data: $data) {
      id
      name
      discountPcnt
      currency {
        id
        symbol
      }
      vatIncluded
      autoUpdatePrices
    }
  }
`;

export const updateSalesPriceListMutation = gql`
  mutation updateSalesPriceList($data: SalesPriceListPartialInput!) {
    updateSalesPriceList(data: $data) {
      id
      name
      discountPcnt
      notes
      currency {
        id
        symbol
      }
      vatIncluded
      autoUpdatePrices
      startDate
      endDate
    }
  }
`;

export const deleteSalesPriceListMutation = gql`
  mutation deleteSalesPriceList($id: GlobalID!) {
    deleteSalesPriceList(data: {id: $id}) {
      id
    }
  }
`;

export const deleteSalesPriceListsMutation = gql`
  mutation deleteSalesPriceLists($ids: [GlobalID!]!) {
    deleteSalesPriceLists(data: {ids: $ids}) {
      id
    }
  }
`;

export const createSalesPriceListItemMutation = gql`
  mutation createSalesPriceListItem($data: SalesPriceListItemInput!) {
    createSalesPriceListItem(data: $data) {
      id
      salespricelist {
        id
        name
      }
      product {
        id
        sku
      }
      priceAuto
      discountAuto
      priceOverride
      discountOverride
    }
  }
`;

export const createSalesPriceListItemsMutation = gql`
  mutation createSalesPriceListItems($data: [SalesPriceListItemInput!]!) {
    createSalesPriceListItems(data: $data) {
      id
      salespricelist {
        id
        name
      }
      product {
        id
        sku
      }
      priceAuto
      discountAuto
      priceOverride
      discountOverride
    }
  }
`;

export const updateSalesPriceListItemMutation = gql`
  mutation updateSalesPriceListItem($data: SalesPriceListItemPartialInput!) {
    updateSalesPriceListItem(data: $data) {
      id
      salespricelist {
        id
        name
      }
      product {
        id
        sku
      }
      priceAuto
      discountAuto
      priceOverride
      discountOverride
    }
  }
`;

export const deleteSalesPriceListItemMutation = gql`
  mutation deleteSalesPriceListItem($id: GlobalID!) {
    deleteSalesPriceListItem(data: {id: $id}) {
      id
    }
  }
`;

export const deleteSalesPriceListItemsMutation = gql`
  mutation deleteSalesPriceListItems($ids: [GlobalID!]!) {
    deleteSalesPriceListItems(data: {ids: $ids}) {
      id
    }
  }
`;
