import { gql } from 'graphql-tag';

export const productsDashboardCardsQuery = gql`
  query ProductsDashboardCards($errorCode: String!) {
    products(filters: { inspectorNotSuccefullyCodeError: $errorCode }) {
      totalCount
    }
  }
`;

export const dashboardOngoingOrders = gql`
    query OngoingOrders {
      orders(filters: {status: {inList: ["PENDING_PROCESSING", "AWAIT_INVENTORY"]}}) {
        totalCount
      }
    }
`;

export const dashboardOngoingShipments = gql`
    query OngoingShipments {
      shipments(filters: {status: {exact: "TODO"}}) {
        totalCount
      }
    }
`;

export const dashboardOngoingReturns = gql`
    query OngoingReturns {
      orderReturns(filters: {status: {exact: "PENDING_INSPECTION"}}) {
        totalCount
      }
    }
`;

export const IncompleteShippingAddress = gql`
    query IncompleteShippingAddress {
      shippingAddresses(filters: { leadtimeforshippingaddress: { id: { isNull: true } } }) {
        totalCount
      }
    }
`;
