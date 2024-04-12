import { gql } from 'graphql-tag';

export const supplierProductSubscription = gql`
  subscription getSupplierProductSubscription($pk: String!) {
    supplierProduct(pk: $pk) {
      id
      sku
      name
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
        name
      }
      supplier {
        id
        name
      }
    }
  }
`;

export const purchaseOrderSubscription = gql`
  subscription getPurchaseOrderSubscription($pk: String!) {
    purchaseOrder(pk: $pk) {
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
        address2
        address3
        fullAddress
        vatNumber
        eoriNumber
      }
      shippingAddress {
        id
        address1
        address2
        address3
        fullAddress
        vatNumber
        eoriNumber
      }
    }
  }
`;

export const purchaseOrderItemSubscription = gql`
  subscription getPurchaseOrderItemSubscription($pk: String!) {
    purchaseOrderItem(pk: $pk) {
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
      price
    }
  }
`;
