import { gql } from 'graphql-tag';

export const createSupplierProductMutation = gql`
  mutation createSupplierProduct($data: SupplierProductInput!) {
    createSupplierProduct(data: $data) {
      id
      sku
      name
      unitPrice
      currency {
        id
        symbol
      }
      unit {
        id
        name
      }
      quantity
      product {
        id
        sku
      }
      supplier {
        id
        name
      }
    }
  }
`;

export const createSupplierProductsMutation = gql`
  mutation createSupplierProducts($data: [SupplierProductInput!]!) {
    createSupplierProducts(data: $data) {
      id
      sku
      name
      currency {
        id
        symbol
      }
      unit {
        id
        name
      }
      quantity
      product {
        id
        sku
      }
      supplier {
        id
        name
      }
    }
  }
`;

export const updateSupplierProductMutation = gql`
  mutation updateSupplierProduct($data: SupplierProductPartialInput!) {
    updateSupplierProduct(data: $data) {
      id
      sku
      name
      unitPrice
      currency {
        id
        name
      }
      unit {
        id
        name
      }
      quantity
      product {
        id
        sku
      }
      supplier {
        id
        name
      }
    }
  }
`;

export const deleteSupplierProductMutation = gql`
  mutation deleteSupplierProduct($id: GlobalID!) {
    deleteSupplierProduct(data: {id: $id}) {
      id
    }
  }
`;

export const deleteSupplierProductsMutation = gql`
  mutation deleteSupplierProducts($ids: [GlobalID!]!) {
    deleteSupplierProducts(data: {ids: $ids}) {
      id
    }
  }
`;


export const createPurchaseOrderMutation = gql`
  mutation createPurchaseOrder($data: PurchaseOrderInput!) {
    createPurchaseOrder(data: $data) {
      id
      status
      totalValue
      supplier {
        id
        name
      }
      orderReference
      currency {
        id
        symbol
      }
      invoiceAddress {
        id
        address1
      }
      shippingAddress {
        id
        address1
      }
    }
  }
`;

export const createPurchaseOrdersMutation = gql`
  mutation createPurchaseOrders($data: [PurchaseOrderInput!]!) {
    createPurchaseOrders(data: $data) {
      id
      status
      totalValue
      supplier {
        id
        name
      }
      orderReference
      currency {
        id
        symbol
      }
      invoiceAddress {
        id
        address1
      }
      shippingAddress {
        id
        address1
      }
    }
  }
`;

export const updatePurchaseOrderMutation = gql`
  mutation updatePurchaseOrder($data: PurchaseOrderPartialInput!) {
    updatePurchaseOrder(data: $data) {
      id
      status
      totalValue
      supplier {
        id
        name
      }
      orderReference
      currency {
        id
        symbol
      }
      invoiceAddress {
        id
        address1
      }
      shippingAddress {
        id
        address1
      }
    }
  }
`;

export const deletePurchaseOrderMutation = gql`
  mutation deletePurchaseOrder($id: GlobalID!) {
    deletePurchaseOrder(data: {id: $id}) {
      id
    }
  }
`;

export const deletePurchaseOrdersMutation = gql`
  mutation deletePurchaseOrders($ids: [GlobalID!]!) {
    deletePurchaseOrders(data: {ids: $ids}) {
      id
    }
  }
`;

export const createPurchaseOrderItemMutation = gql`
  mutation createPurchaseOrderItem($data: PurchaseOrderItemInput!) {
    createPurchaseOrderItem(data: $data) {
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

export const createPurchaseOrderItemsMutation = gql`
  mutation createPurchaseOrderItems($data: [PurchaseOrderItemInput!]!) {
    createPurchaseOrderItems(data: $data) {
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

export const updatePurchaseOrderItemMutation = gql`
  mutation updatePurchaseOrderItem($data: PurchaseOrderItemPartialInput!) {
    updatePurchaseOrderItem(data: $data) {
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

export const deletePurchaseOrderItemMutation = gql`
  mutation deletePurchaseOrderItem($id: GlobalID!) {
    deletePurchaseOrderItem(data: {id: $id}) {
      id
    }
  }
`;

export const deletePurchaseOrderItemsMutation = gql`
  mutation deletePurchaseOrderItems($ids: [GlobalID!]!) {
    deletePurchaseOrderItems(data: {ids: $ids}) {
      id
    }
  }
`;
