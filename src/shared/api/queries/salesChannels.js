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
      apiKey
      apiSecret
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

export const getWoocommerceChannelQuery = gql`
  query getWoocommerceChannel($id: GlobalID!) {
    woocommerceChannel(id: $id) {
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
      apiKey
      apiSecret
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
      expirationDate
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

export const amazonChannelsQuery = gql`
  query amazonChannelsQuery(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonSalesChannelOrder
    $filters: AmazonSalesChannelFilter
  ) {
    amazonChannels(
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
          region
          country
          createdAt
          integrationPtr {
            id
          }
          saleschannelPtr {
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

export const amazonChannelsQuerySelector = gql`
  query AmazonChannels(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonSalesChannelOrder
    $filters: AmazonSalesChannelFilter
  ) {
    amazonChannels(
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

export const getEbayChannelQuery = gql`
  query getEbayChannel($id: GlobalID!) {
    ebayChannel(id: $id) {
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
      firstImportComplete
      isImporting
      accessToken
      integrationPtr {
        id
      }
      saleschannelPtr {
        id
      }
    }
  }
`;

export const ebayChannelsQuery = gql`
  query ebayChannelsQuery(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbaySalesChannelOrder
    $filters: EbaySalesChannelFilter
  ) {
    ebayChannels(
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
          region
          country
          createdAt
          integrationPtr {
            id
          }
          saleschannelPtr {
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

export const ebayChannelsQuerySelector = gql`
  query EbayChannels(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbaySalesChannelOrder
    $filters: EbaySalesChannelFilter
  ) {
    ebayChannels(
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



// Sales Channel Integration Pricelist Queries
export const salesChannelIntegrationPricelistsQuery = gql`
  query SalesChannelIntegrationPricelists($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelIntegrationPricelistOrder, $filter: SalesChannelIntegrationPricelistFilter) {
    salesChannelIntegrationPricelists(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          salesChannel {
            id
          }
          priceList {
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
      salesChannel {
        id
      }
      priceList {
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
          integrationType
          product {
            id
            name
            sku
            active
            type
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

export const amazonRemoteLogsQuery = gql`
  query AmazonRemoteLogs(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $order: AmazonRemoteLogOrder,
    $filter: AmazonRemoteLogFilter
  ) {
    amazonRemoteLogs(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          type
          action
          status
          frontendName
          frontendError
          createdAt
          submissionId
          processingStatus
          formattedIssues {
            message
            severity
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

export const getSalesChannelViewAssignQuery = gql`
  query getSalesChannelViewAssign($id: GlobalID!) {
    salesChannelViewAssign(id: $id) {
      id
      integrationType
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

export const salesChannelViewsQuerySelector = gql`
  query SalesChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelViewOrder, $filter: SalesChannelViewFilter) {
    salesChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
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

export const amazonChannelViewsQuery = gql`
  query AmazonChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: AmazonSalesChannelViewOrder, $filter: AmazonSalesChannelViewFilter) {
    amazonChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          remoteId
          name
          active
          isDefault
          salesChannel {
            id
            hostname
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

export const getAmazonChannelViewQuery = gql`
  query getAmazonChannelView($id: GlobalID!) {
    amazonChannelView(id: $id) {
      id
      active
      url
      name
      isDefault
      salesChannel {
        id
        hostname
      }
    }
  }
`;

export const getEbaySalesChannelViewQuery = gql`
  query getEbaySalesChannelView($id: GlobalID!) {
    ebaySalesChannelView(id: $id) {
      id
      name
      url
      fulfillmentPolicyId
      fulfillmentPolicyChoices
      paymentPolicyId
      paymentPolicyChoices
      returnPolicyId
      returnPolicyChoices
      merchantLocationKey
      merchantLocationChoices
      lengthUnit
      weightUnit
      isDefault
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

export const getSalesChannelImportQuery = gql`
  query getSalesChannelImport($id: GlobalID!) {
    salesChannelImport(id: $id) {
      id
      status
      percentage
      createdAt
      name
      createOnly
      updateOnly
      skipBrokenRecords
      totalRecords
      processedRecords
      errorTraceback
      salesChannel {
        id
      }
    }
  }
`;

export const amazonImportBrokenRecordsQuery = gql`
  query AmazonImportBrokenRecords(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $filter: AmazonImportBrokenRecordFilter
  ) {
    amazonImportBrokenRecords(
      first: $first
      last: $last
      after: $after
      before: $before
      filters: $filter
    ) {
      edges {
        node {
          id
          createdAt
          record
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

// Amazon Property Queries
export const amazonPropertiesQuery = gql`
  query AmazonProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonPropertyOrder
    $filter: AmazonPropertyFilter
  ) {
    amazonProperties(
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
          mappedLocally
          mappedRemotely
          code
          name
          type
          allowsUnmappedValues
          localInstance {
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

export const getAmazonPropertyQuery = gql`
  query getAmazonProperty($id: GlobalID!) {
    amazonProperty(id: $id) {
      id
      mappedLocally
      mappedRemotely
      code
      name
      type
      allowsUnmappedValues
      localInstance {
        id
        name
      }
    }
  }
`;

// Amazon Property Select Value Queries
export const amazonPropertySelectValuesQuery = gql`
  query AmazonPropertySelectValues(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonPropertySelectValueOrder
    $filter: AmazonPropertySelectValueFilter
  ) {
    amazonPropertySelectValues(
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
          mappedLocally
          mappedRemotely
          amazonProperty {
            id
            name
            mappedLocally
            mappedRemotely
          }
          marketplace {
            id
            name
          }
          remoteValue
          remoteName
          localInstance {
            id
            value
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

export const getAmazonPropertySelectValueQuery = gql`
  query getAmazonPropertySelectValue($id: GlobalID!) {
    amazonPropertySelectValue(id: $id) {
      id
      mappedLocally
      mappedRemotely
      amazonProperty {
        id
        name
      }
      marketplace {
        id
        name
      }
      remoteValue
      remoteName
      translatedRemoteName
      localInstance {
        id
        value
      }
    }
  }
`;

// Amazon Product Type Queries
export const amazonProductTypesQuery = gql`
  query AmazonProductTypes(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonProductTypeOrder
    $filter: AmazonProductTypeFilter
  ) {
    amazonProductTypes(
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
          mappedLocally
          mappedRemotely
          productTypeCode
          name
          localInstance {
            id
            value
            productType {
              id
              value
            }
          }
          variationThemes
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

export const getAmazonProductTypeQuery = gql`
  query getAmazonProductType($id: GlobalID!) {
    amazonProductType(id: $id) {
      id
      mappedLocally
      mappedRemotely
      imported
      productTypeCode
      name
      localInstance {
        id
        value
        productType {
          id
          value
        }
      }
      amazonproducttypeitemSet {
        id
        remoteProperty {
          id
          name
          code
          mappedLocally
          allowsUnmappedValues
          type
        }
        remoteType
      }
      variationThemes
    }
  }
`;
export const amazonImportProcessesQuery = gql`
  query AmazonImportProcesses(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $order: AmazonSalesChannelImportOrder,
    $filter: AmazonSalesChannelImportFilter
  ) {
    amazonImportProcesses(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          type
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

// Amazon Default Unit Configurator Queries
export const amazonDefaultUnitConfiguratorsQuery = gql`
  query AmazonDefaultUnitConfigurators(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonDefaultUnitConfiguratorOrder
    $filter: AmazonDefaultUnitConfiguratorFilter
  ) {
    amazonDefaultUnitConfigurators(
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
          name
          code
          marketplace {
            id
            name
          }
          selectedUnit
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

export const getAmazonDefaultUnitConfiguratorQuery = gql`
  query getAmazonDefaultUnitConfigurator($id: GlobalID!) {
    amazonDefaultUnitConfigurator(id: $id) {
      id
      name
      code
      marketplace {
        id
        name
      }
      selectedUnit
      choices
    }
  }
`;
