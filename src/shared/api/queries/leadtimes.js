import { gql } from 'graphql-tag';

export const leadTimesQuery = gql`
  query LeadTimes($first: Int, $last: Int, $after: String, $before: String, $order: LeadTimeOrder, $filter: LeadTimeFilter) {
    leadTimes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          minTime
          maxTime
          unit
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

export const getLeadTimeQuery = gql`
  query getLeadTime($id: GlobalID!) {
    leadTime(id: $id) {
      id
      minTime
      maxTime
      unit
      name
    }
  }
`;

export const leadTimesForShippingAddressesQuery = gql`
  query LeadTimesForShippingAddresses($first: Int, $last: Int, $after: String, $before: String, $order: LeadTimeForShippingAddressOrder, $filter: LeadTimeForShippingAddressFilter) {
    leadTimeForShippingaddresses(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          shippingaddress {
            id
            fullAddress
          }
          leadtime {
            id
            minTime
            maxTime
            unit
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

export const getLeadTimeForShippingAddressQuery = gql`
  query getLeadTimeForShippingaddress($id: GlobalID!) {
    leadTimeForShippingaddress(id: $id) {
      id
      shippingaddress {
        id
        fullAddress
      }
      leadtime {
        id
        minTime
        maxTime
        unit
        name
      }
    }
  }
`;

export const leadTimeProductsOutOfStockQuery = gql`
  query LeadTimeProductsOutOfStock($first: Int, $last: Int, $after: String, $before: String, $order: LeadTimeProductOutOfStockOrder, $filter: LeadTimeProductOutOfStockFilter) {
    leadTimeProductsOutOfStock(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          product {
            id
            name
          }
          leadtimeOutofstock {
            id
            minTime
            maxTime
            unit
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

export const getLeadTimeProductOutOfStockQuery = gql`
  query getLeadTimeProductOutOfStock($id: GlobalID!) {
    leadTimeProductOutOfStock(id: $id) {
      id
      product {
        id
        name
      }
      leadtimeOutofstock {
        id
        minTime
        maxTime
        unit
      }
    }
  }
`;