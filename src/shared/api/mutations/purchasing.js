import { gql } from 'graphql-tag';

export const createSupplierProductMutation = gql`
  mutation createSupplierProduct($data: SupplierProductInput!) {
    createSupplierProduct(data: $data) {
      id
      proxyId
      sku
      name
      unitPrice
      unit {
        id
        name
      }
      quantity
      baseProducts {
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
      unit {
        id
        name
      }
      quantity
      baseProducts {
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
      proxyId
      sku
      name
      unitPrice
      unit {
        id
        name
      }
      quantity
      baseProducts {
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
      internalContact {
       id
       fullName
      }
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
      product {
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
      product {
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
      product {
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

export const createSupplierPriceMutation = gql`
  mutation createSupplierPrice($data: SupplierPriceInput!) {
    createSupplierPrice(data: $data) {
      id
      unitPrice
      quantity
      supplierProduct {
        id
        sku
        name
        baseProducts {
          id
          sku
          name
        }
        supplier {
          id
          name
        }
      }
      unit {
        id
        name
      }
    }
  }
`;

export const updateSupplierPriceMutation = gql`
  mutation updateSupplierPrice($data: SupplierPricePartialInput!) {
    updateSupplierPrice(data: $data) {
      id
      unitPrice
      quantity
      supplierProduct {
        id
        sku
        name
        baseProducts {
          id
          sku
          name
        }
        supplier {
          id
          name
        }
      }
      unit {
        id
        name
      }
    }
  }
`;

export const deleteSupplierPriceMutation = gql`
  mutation deleteSupplierPrice($id: GlobalID!) {
    deleteSupplierPrice(data: {id: $id}) {
      id
    }
  }
`;
