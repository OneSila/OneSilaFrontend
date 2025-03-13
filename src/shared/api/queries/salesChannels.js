import { gql } from 'graphql-tag';

// Sales Channel Queries
export const salesChannelsQuery = gql`
  query SalesChannels($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelOrder, $filter: SalesChannelFilter) {
    salesChannels(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          multiTenantCompany {
            id
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

export const getSalesChannelQuery = gql`
  query getSalesChannel($id: GlobalID!) {
    salesChannel(id: $id) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

export const getMagentoChannelQuery = gql`
  query getMagentoChannel($id: GlobalID!) {
    magentoChannel(id: $id) {
      id
      hostname
      active
      verifySsl
      requestsPerMinute
      maxRetries
      useConfigurableName
      syncContents
      syncEanCodes
      syncPrices
      hostApiUsername
      hostApiKey
      authenticationMethod
      attributeSetSkeletonId
      eanCodeAttribute
      firstImportComplete
      integrationPtr {
        id
      }
      saleschannelPtr {
       id
       }
    }
  }
`;


// Sales Channel Integration Pricelist Queries
export const salesChannelIntegrationPricelistsQuery = gql`
  query SalesChannelIntegrationPricelists($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelIntegrationPricelistOrder, $filter: SalesChannelIntegrationPricelistFilter) {
    salesChannelIntegrationPricelists(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          multiTenantCompany {
            id
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

export const getSalesChannelIntegrationPricelistQuery = gql`
  query getSalesChannelIntegrationPricelist($id: GlobalID!) {
    salesChannelIntegrationPricelist(id: $id) {
      id
      name
      active
      multiTenantCompany {
        id
        name
      }
    }
  }
`;

// Sales Channel View Assign Queries
export const salesChannelViewAssignsQuery = gql`
  query SalesChannelViewAssigns($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelViewAssignOrder, $filter: SalesChannelViewAssignFilter) {
    salesChannelViewAssigns(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          remoteUrl
          remoteProductPercentage
          product {
            id
            name
          }
          remoteProduct {
            id
            hasErrors
          }
          salesChannelView {
            id
            name
            active
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

export const remoteLogsQuery = gql`
  query RemoteLogs(
    $first: Int, 
    $last: Int, 
    $after: String, 
    $before: String, 
    $order: RemoteLogOrder, 
    $filter: RemoteLogFilter
  ) {
    remoteLogs(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          type
          action
          status
          frontendName
          frontendError
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


export const getSalesChannelViewAssignQuery = gql`
  query getSalesChannelViewAssign($id: GlobalID!) {
    salesChannelViewAssign(id: $id) {
      id
      product {
        id
        name
      }
      salesChannelView {
        id
        name
      }
    }
  }
`;

// Sales Channel View Queries
export const salesChannelViewsQuery = gql`
  query SalesChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelViewOrder, $filter: SalesChannelViewFilter) {
    salesChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          salesChannel {
            id
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

export const getSalesChannelViewQuery = gql`
  query getSalesChannelView($id: GlobalID!) {
    salesChannelView(id: $id) {
      id
      name
      active
      url
      salesChannel {
        id
      }
    }
  }
`;

export const getRemoteLanguageQuery = gql`
  query getRemoteLanguageQueryQuery($id: GlobalID!) {
    remoteLanguage(id: $id) {
      id
      localInstance
      remoteCode
    }
  }
`;

export const getRemoteCurrencyQuery = gql`
  query getrRmoteLanguageQueryQuery($id: GlobalID!) {
    remoteCurrency(id: $id) {
      id
      localInstance {
        id
        symbol
        isoCode
      }
      remoteCode
    }
  }
`;

export const remoteLanguagesQuery = gql`
  query RemoteLanguages(
    $first: Int, 
    $last: Int, 
    $after: String, 
    $before: String, 
    $order: RemoteLanguageOrder, 
    $filter: RemoteLanguageFilter
  ) {
    remoteLanguages(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          localInstance
          remoteCode
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

export const remoteCurrenciesQuery = gql`
  query RemoteCurrencies(
    $first: Int, 
    $last: Int, 
    $after: String, 
    $before: String, 
    $order: RemoteCurrencyOrder, 
    $filter: RemoteCurrencyFilter
  ) {
    remoteCurrencies(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          remoteCode
          localInstance {
            id
            name
            symbol
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

export const importProcessesQuery = gql`
  query ImportProcesses(
    $first: Int, 
    $last: Int, 
    $after: String, 
    $before: String, 
    $order: ImportProcessOrder, 
    $filter: ImportProcessFilter
  ) {
    importProcesses(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          status
          percentage
          createdAt
        }
        cursor
      }
      totalCount
      pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
