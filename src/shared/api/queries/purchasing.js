import { gql } from 'graphql-tag';

export const supplierProductsQuery = gql`
  query SupplierProducts($first: Int, $last: Int, $after: String, $before: String, $order: SupplierProductOrder, $filter: SupplierProductFilter) {
    supplierProducts(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          sku
          name
          proxyId
          baseProduct {
            id
            sku
            name
          }
          supplier {
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

export const getSupplierProductQuery = gql`
  query getSupplierProduct($id: GlobalID!) {
    supplierProduct(id: $id) {
      id
      sku
      name
      unitPrice
      unit {
        id
        name
      }
      quantity
      baseProduct {
        id
        sku
        name
      }
      supplier {
        id
        name
      }
    }
  }
`;

export const purchaseOrdersQuery = gql`
  query PurchaseOrders($first: Int, $last: Int, $after: String, $before: String, $order: PurchaseOrderOrder, $filter: PurchaseOrderFilter) {
    purchaseOrders(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          status
          totalValue
          supplier {
            id
            name
          }
          orderReference
          invoiceAddress {
            id
            address1
          }
          shippingAddress {
            id
            address1
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

export const getPurchaseOrderQuery = gql`
  query getPurchaseOrder($id: GlobalID!) {
    purchaseOrder(id: $id) {
      id
      status
      totalValue
      supplier {
        id
        name
      }
      orderReference
      invoiceAddress {
        id
        address1
      }
      shippingAddress {
        id
        address1
      }
      purchaseorderitemSet {
        id
        item {
          id
        }
      } 
    }
  }
`;

export const purchaseOrderItemsQuery = gql`
  query PurchaseOrderItems($first: Int, $last: Int, $after: String, $before: String, $order: PurchaseOrderItemOrder, $filter: PurchaseOrderItemFilter) {
    purchaseOrderItems(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          purchaseOrder {
            id
            orderReference
          }
          item {
            id
            proxyId
            name
          }
          quantity
          unitPrice
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

export const getPurchaseOrderItemQuery = gql`
  query getPurchaseOrderItem($id: GlobalID!) {
    purchaseOrderItem(id: $id) {
      id
      purchaseOrder {
        id
        orderReference
      }
      item {
        id
        name
      }
      quantity
      unitPrice
    }
  }
`;

export const getSupplierPriceQuery = gql`
  query getSupplierPrice($id: GlobalID!) {
    supplierPrice(id: $id) {
      id
      unitPrice
      quantity
      supplierProduct {
        id
        sku
        name
      }
      unit {
        id
        name
      }
    }
  }
`;

export const supplierPricesQuery = gql`
  query SupplierPrices($first: Int, $last: Int, $after: String, $before: String, $order: SupplierPricesOrder, $filter: SupplierPricesFilter) {
    supplierPrices(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          unitPrice
          quantity
          supplierProduct {
            id
            sku
            name
          }
          unit {
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