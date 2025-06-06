import { gql } from 'graphql-tag';

// Sales Channel Queries
export const salesChannelsQuery = gql`
  query SalesChannels($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelOrder, $filter: SalesChannelFilter) {
    salesChannels(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
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
      importOrders
      hostApiUsername
      hostApiKey
      authenticationMethod
      attributeSetSkeletonId
      eanCodeAttribute
      firstImportComplete
      isImporting
      integrationPtr {
        id
      }
      saleschannelPtr {
       id
       }
    }
  }
`;

export const getShopifyChannelQuery = gql`
  query getShopifyChannel($id: GlobalID!) {
    shopifyChannel(id: $id) {
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
      importOrders
      accessToken
      firstImportComplete
      isImporting
      integrationPtr {
        id
      }
      saleschannelPtr {
        id
      }
      vendorProperty {
        id
      }
    }
  }
`;

export const getShopifyChannelsQuery = gql`
  query GetShopifyChannels(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: ShopifySalesChannelOrder
    $filters: ShopifySalesChannelFilter
  ) {
    shopifyChannels(
      first: $first
      last: $last
      after: $after
      before: $before
      order: $order
      filters: $filters
    ) {
      edges {
        node {
          id
          hostname
          active
          state
          createdAt
          integrationPtr {
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

export const getAmazonChannelQuery = gql`
  query getAmazonChannel($id: GlobalID!) {
    amazonChannel(id: $id) {
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
      importOrders
      accessToken
      refreshTokenExpiration
      region
      country
      firstImportComplete
      isImporting
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
            active
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
      active
      url
      name
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
      name
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
          name
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
          name
          localInstance {
            id
            name
            symbol
            isoCode
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

export const salesChannelImportsQuery = gql`
  query SalesChannelImports(
    $first: Int, 
    $last: Int, 
    $after: String, 
    $before: String, 
    $order: SalesChannelImportOrder, 
    $filter: SalesChannelImportFilter
  ) {
    salesChannelImports(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          status
          percentage
          createdAt
          salesChannel {
            id
          }
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


export const magentoRemoteAttributesQuery = gql`
  query MagentoRemoteAttributes($salesChannelId: ID!) {
    magentoRemoteAttributes(salesChannelId: $salesChannelId) {
      id
      attributeCode
      name
      data
    }
  }
`;

export const magentoRemoteAttributeSetsQuery = gql`
  query MagentoRemoteAttributeSets($salesChannelId: ID!) {
    magentoRemoteAttributeSets(salesChannelId: $salesChannelId) {
      id
      name
    }
  }
`;