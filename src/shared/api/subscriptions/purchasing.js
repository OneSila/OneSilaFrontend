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
      supplier {
        id
        name
      }
      orderReference
      currency {
        id
        name
      }
      invoiceAddress {
        id
        name
      }
      deliveryAddress {
        id
        name
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
