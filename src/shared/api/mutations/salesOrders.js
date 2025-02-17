import { gql } from 'graphql-tag';

export const createOrderMutation = gql`
  mutation createOrder($data: OrderInput!) {
    createOrder(data: $data) {
      id
      reference
    }
  }
`;

export const createOrdersMutation = gql`
  mutation createOrders($data: [OrderInput!]!) {
    createOrders(data: $data) {
      id
      reference
    }
  }
`;

export const updateOrderMutation = gql`
  mutation updateOrder($data: OrderPartialInput!) {
    updateOrder(data: $data) {
      id
      reference
      customer {
          id
          name

        }
        invoiceAddress {
            id
            address1
        }
        shippingAddress {
            id
            address1
        }
        currency {
          id
          symbol
        }
      priceInclVat
      status
      reasonForSale
    }
  }
`;


export const createOrderItemMutation = gql`
  mutation createOrderItem($data: OrderItemInput!) {
    createOrderItem(data: $data) {
      id
      order {
        id
        reference
      }
      product {
        id
        sku
      }
      quantity
      price
    }
  }
`;

export const createOrderItemsMutation = gql`
  mutation createOrderItems($data: [OrderItemInput!]!) {
    createOrderItems(data: $data) {
      id
      order {
        id
        reference
      }
      product {
        id
        name
      }
      quantity
      price
    }
  }
`;

export const updateOrderItemMutation = gql`
  mutation updateOrderItem($data: OrderItemPartialInput!) {
    updateOrderItem(data: $data) {
      id
      order {
        id
        reference
      }
      product {
        id
        sku
        name
      }
      quantity
      price
    }
  }
`;

export const deleteOrderItemMutation = gql`
  mutation deleteOrderItem($id: GlobalID!) {
    deleteOrderItem(data: {id: $id}) {
      id
    }
  }
`;

export const deleteOrderItemsMutation = gql`
  mutation deleteOrderItems($data: [NodeInput!]!) {
    deleteOrderItems(data: $data) {
      id
    }
  }
`;


export const createOrderNoteMutation = gql`
  mutation createOrderNote($data: OrderNoteInput!) {
    createOrderNote(data: $data) {
      id
      order {
        id
        reference
      }
      note
    }
  }
`;

export const createOrderNotesMutation = gql`
  mutation createOrderNotes($data: [OrderNoteInput!]!) {
    createOrderNotes(data: $data) {
      id
      order {
        id
        reference
      }
      note
    }
  }
`;

export const updateOrderNoteMutation = gql`
  mutation updateOrderNote($data: OrderNotePartialInput!) {
    updateOrderNote(data: $data) {
      id
      order {
        id
        reference
      }
      note
    }
  }
`;

export const deleteOrderNoteMutation = gql`
  mutation deleteOrderNote($id: GlobalID!) {
    deleteOrderNote(data: {id: $id}) {
      id
    }
  }
`;

export const deleteOrderNotesMutation = gql`
  mutation deleteOrderNotes($ids: [GlobalID!]!) {
    deleteOrderNotes(data: {ids: $ids}) {
      id
    }
  }
`;
