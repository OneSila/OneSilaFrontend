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
          country
          priceInclVat
          status
          reasonForSale
          totalValue
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
            name
          }
          quantity
          price
          priceWithCurrency
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
            fullAddress
        }
        shippingAddress {
            id
            fullAddress
        }
        currency {
          id
          symbol
          isoCode
        }
        orderitemSet {
          id
          product {
            id
          }
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
        name
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
