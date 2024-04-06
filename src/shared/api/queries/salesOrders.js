import { gql } from 'graphql-tag';

export const ordersQuery = gql`
  query Orders($first: Int, $last: Int, $after: String, $before: String, $order: OrderOrder, $filter: OrderFilter) {
    orders(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          reference
          customer {
            id
            name
          }
          priceInclVat
          status
          reasonForSale
          createdAt
          updatedAt
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

export const orderItemsQuery = gql`
  query OrderItems($first: Int, $last: Int, $after: String, $before: String, $order: OrderItemOrder, $filter: OrderItemFilter) {
    orderItems(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
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

export const orderNotesQuery = gql`
  query OrderNotes($first: Int, $last: Int, $after: String, $before: String, $order: OrderNoteOrder, $filter: OrderNoteFilter) {
    orderNotes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          order {
            id
            reference
          }
          note
          createdAt
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

export const getOrderQuery = gql`
  query getOrder($id: GlobalID!) {
    order(id: $id) {
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
          isoCode
        }
      priceInclVat
      status
      reasonForSale
      createdAt
      updatedAt
    }
  }
`;

export const getOrderItemQuery = gql`
  query getOrderItem($id: GlobalID!) {
    orderItem(id: $id) {
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

export const getOrderNoteQuery = gql`
  query getOrderNote($id: GlobalID!) {
    orderNote(id: $id) {
      id
      order {
        id
        reference
      }
      note
      createdAt
    }
  }
`;
