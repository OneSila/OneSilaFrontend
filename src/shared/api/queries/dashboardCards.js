import { gql } from 'graphql-tag';

export const productsDashboardCardsQuery = gql`
  query ProductsDashboardCards($errorCode: String!) {
    products(filters: { inspectorNotSuccessfullyCodeError: $errorCode, active: { exact: true } }) {
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

export const dashboardAmazonProductsWithIssues = gql`
  query DashboardAmazonProductsWithIssues($salesChannelId: String) {
    products(filters: { amazonProductsWithIssuesForSalesChannel: $salesChannelId, active: { exact: true } }) {
      totalCount
    }
  }
`;

export const dashboardPropertiesMissingMainTranslations = gql`
  query DashboardPropertiesMissingMainTranslations {
    properties(filters: { missingMainTranslation: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertiesMissingTranslations = gql`
  query DashboardPropertiesMissingTranslations {
    properties(filters: { missingTranslations: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertySelectValuesMissingMainTranslations = gql`
  query DashboardPropertySelectValuesMissingMainTranslations {
    propertySelectValues(filters: { missingMainTranslation: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertySelectValuesMissingTranslations = gql`
  query DashboardPropertySelectValuesMissingTranslations {
    propertySelectValues(filters: { missingTranslations: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertiesUsedInProductsMissingMainTranslations = gql`
  query DashboardPropertiesUsedInProductsMissingMainTranslations {
    properties(filters: { missingMainTranslation: true, usedInProducts: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertiesUsedInProductsMissingTranslations = gql`
  query DashboardPropertiesUsedInProductsMissingTranslations {
    properties(filters: { missingTranslations: true, usedInProducts: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertySelectValuesUsedInProductsMissingMainTranslations = gql`
  query DashboardPropertySelectValuesUsedInProductsMissingMainTranslations {
    propertySelectValues(filters: { missingMainTranslation: true, usedInProducts: true }) {
      totalCount
    }
  }
`;

export const dashboardPropertySelectValuesUsedInProductsMissingTranslations = gql`
  query DashboardPropertySelectValuesUsedInProductsMissingTranslations {
    propertySelectValues(filters: { missingTranslations: true, usedInProducts: true }) {
      totalCount
    }
  }
`;

export const dashboardSectionsQuery = gql`
  query DashboardSections(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: DashboardSectionOrder
    $filter: DashboardSectionFilter
  ) {
    dashboardSections(
      first: $first
      last: $last
      after: $after
      before: $before
      order: $order
      filters: $filter
    ) {
      edges {
        node {
          id
          title
          description
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
      totalCount
    }
  }
`;

export const dashboardSectionsWithCardsQuery = gql`
  query DashboardSectionsWithCards {
    dashboardSections(filters: { currentUser: true }) {
      edges {
        node {
          id
          title
          description
          sortOrder
          cards {
            id
            title
            description
            color
            query
            variables
            queryKey
            url
            sortOrder
          }
        }
      }
    }
  }
`;
