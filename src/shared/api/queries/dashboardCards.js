import { gql } from 'graphql-tag';

export const productsDashboardCardsQuery = gql`
  query ProductsDashboardCards($errorCode: String!) {
    products(filters: { inspectorNotSuccessfullyCodeError: $errorCode }) {
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

export const dashboardIncompleteShippingAddress = gql`
    query IncompleteShippingAddress {
      shippingAddresses(filters: {company: { isSupplier: { exact: true }}, OR: {company: {isInternalCompany: {exact: true }}}, leadtimeforshippingaddress: { id: { isNull: true } } }) {
        totalCount
      }
    }
`;

export const dashboardNotMatchingSalesPricesList = gql`
    query NotMatchingSalesPricesList {
      salesPriceLists (filters: {currencyMatchWithCustomers: false}) {
        totalCount
      }
    }
`;