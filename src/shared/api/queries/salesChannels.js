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

export const salesChannelsQuerySelector = gql`
  query SalesChannels($first: Int, $last: Int, $after: String, $before: String, $order: SalesChannelOrder, $filter: SalesChannelFilter) {
    salesChannels(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          hostname
          type
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

export const salesChannelsLimitsQuery = gql`
  query SalesChannelsLimits($first: Int, $filter: SalesChannelFilter) {
    salesChannels(first: $first, filters: $filter) {
      edges {
        node {
          id
          minNameLength
          minDescriptionLength
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
      startingStock
      minNameLength
      minDescriptionLength
      hostApiUsername
      hostApiKey
      authenticationMethod
      attributeSetSkeletonId
      eanCodeAttribute
      gptEnable
      gptEnableCheckout
      gptSellerName
      gptSellerUrl
      gptSellerPrivacyPolicy
      gptSellerTos
      gptReturnPolicy
      gptReturnWindow
      firstImportComplete
      isImporting
      integrationPtr {
        id
      }
      saleschannelPtr {
        id
        ... on SalesChannelType {
          gptFeed {
            id
            fileUrl
            lastSyncedAt
            file {
              url
            }
          }
        }
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
      minNameLength
      minDescriptionLength
      gptEnable
      gptEnableCheckout
      gptSellerName
      gptSellerUrl
      gptSellerPrivacyPolicy
      gptSellerTos
      gptReturnPolicy
      gptReturnWindow
      firstImportComplete
      isImporting
      integrationPtr {
        id
      }
      saleschannelPtr {
        id
        ... on SalesChannelType {
          gptFeed {
            id
            fileUrl
            lastSyncedAt
            file {
              url
            }
          }
        }
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
      startingStock
      minNameLength
      minDescriptionLength
      gptEnable
      gptEnableCheckout
      gptSellerName
      gptSellerUrl
      gptSellerPrivacyPolicy
      gptSellerTos
      gptReturnPolicy
      gptReturnWindow
      apiKey
      apiSecret
      firstImportComplete
      isImporting
      integrationPtr {
        id
      }
      saleschannelPtr {
        id
        ... on SalesChannelType {
          gptFeed {
            id
            fileUrl
            lastSyncedAt
            file {
              url
            }
          }
        }
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
      startingStock
      minNameLength
      minDescriptionLength
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
            proxyId
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

export const sheinChannelsQuerySelector = gql`
  query SheinChannels(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinSalesChannelOrder
    $filters: SheinSalesChannelFilter
  ) {
    sheinChannels(
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
      startingStock
      minNameLength
      minDescriptionLength
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

export const getSheinChannelQuery = gql`
  query getSheinChannel($id: GlobalID!) {
    sheinChannel(id: $id) {
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
      startingStock
      minNameLength
      minDescriptionLength
      firstImportComplete
      isImporting
      openKeyId
      integrationPtr {
        id
      }
      saleschannelPtr {
        id
      }
    }
  }
`;

export const getMiraklChannelQuery = gql`
  query getMiraklChannel($id: GlobalID!) {
    miraklChannel(id: $id) {
      id
      hostname
      active
      lastDifferentialIssuesFetch
      lastFullIssuesFetch
      lastProductImportsRequestDate
      requestsPerMinute
      maxRetries
      useConfigurableName
      syncContents
      syncEanCodes
      syncPrices
      importOrders
      startingStock
      minNameLength
      minDescriptionLength
      shopId
      apiKey
      connected
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
          createdAt
          integrationPtr {
            id
          }
          saleschannelPtr {
            id
            proxyId
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

export const sheinChannelsQuery = gql`
  query sheinChannelsQuery(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinSalesChannelOrder
    $filters: SheinSalesChannelFilter
  ) {
    sheinChannels(
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

export const miraklChannelsQuery = gql`
  query miraklChannelsQuery(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklSalesChannelOrder
    $filters: MiraklSalesChannelFilter
  ) {
    miraklChannels(
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
          shopId
          connected
          lastDifferentialIssuesFetch
          lastFullIssuesFetch
          lastProductImportsRequestDate
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
          status
          remoteUrl
          remoteProductPercentage
          integrationType
          createdAt
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
            status
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
          includeInTodo
          todoSortOrder
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
          active
          includeInTodo
          todoSortOrder
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
      includeInTodo
      todoSortOrder
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
          proxyId
          remoteId
          name
          url
          active
          isDefault
          includeInTodo
          todoSortOrder
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

export const ebayChannelViewsQuery = gql`
  query EbayChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: EbaySalesChannelViewOrder, $filter: EbaySalesChannelViewFilter) {
    ebaySalesChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          active
          isDefault
          includeInTodo
          todoSortOrder
          defaultCategoryTreeId
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

export const sheinChannelViewsQuery = gql`
  query SheinChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: SheinSalesChannelViewOrder, $filter: SheinSalesChannelViewFilter) {
    sheinSalesChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          url
          active
          isDefault
          includeInTodo
          todoSortOrder
          siteStatus
          storeType
          merchantLocationKey
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

export const miraklChannelViewsQuery = gql`
  query MiraklChannelViews($first: Int, $last: Int, $after: String, $before: String, $order: MiraklSalesChannelViewOrder, $filter: MiraklSalesChannelViewFilter) {
    miraklSalesChannelViews(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          description
          active
          includeInTodo
          todoSortOrder
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

export const getAmazonChannelViewQuery = gql`
  query getAmazonChannelView($id: GlobalID!) {
    amazonChannelView(id: $id) {
      id
      active
      includeInTodo
      todoSortOrder
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
      includeInTodo
      todoSortOrder
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

export const getSheinSalesChannelViewQuery = gql`
  query getSheinSalesChannelView($id: GlobalID!) {
    sheinSalesChannelViews(first: 1, filters: { id: { exact: $id } }) {
      edges {
        node {
          id
          name
          url
          includeInTodo
          todoSortOrder
          siteStatus
          storeType
          isDefault
          merchantLocationKey
          merchantLocationChoices
        }
      }
    }
  }
`;

export const getMiraklSalesChannelViewQuery = gql`
  query getMiraklSalesChannelView($id: GlobalID!) {
    miraklSalesChannelView(id: $id) {
      id
      name
      description
      active
      includeInTodo
      todoSortOrder
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

export const miraklRemoteLanguagesQuery = gql`
  query MiraklRemoteLanguages(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklRemoteLanguageOrder
    $filter: MiraklRemoteLanguageFilter
  ) {
    miraklRemoteLanguages(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          remoteCode
          name: label
          label
          isDefault
          localInstance
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

export const miraklRemoteCurrenciesQuery = gql`
  query MiraklRemoteCurrencies(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklRemoteCurrencyOrder
    $filter: MiraklRemoteCurrencyFilter
  ) {
    miraklRemoteCurrencies(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          remoteCode
          name: label
          label
          isDefault
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

export const getMiraklRemoteLanguageQuery = gql`
  query getMiraklRemoteLanguage($id: GlobalID!) {
    miraklRemoteLanguage(id: $id) {
      id
      remoteCode
      label
      isDefault
      localInstance
    }
  }
`;

export const getMiraklRemoteCurrencyQuery = gql`
  query getMiraklRemoteCurrency($id: GlobalID!) {
    miraklRemoteCurrency(id: $id) {
      id
      remoteCode
      label
      isDefault
      localInstance {
        id
        symbol
        isoCode
      }
    }
  }
`;

export const ebayRemoteCurrenciesQuery = gql`
  query EbayRemoteCurrencies(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $order: EbayCurrencyOrder,
    $filter: EbayCurrencyFilter
  ) {
    ebayCurrencies(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          proxyId
          remoteCode
          salesChannelView {
            id
            name
          }
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
          name
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

export const getMiraklImportProcessQuery = gql`
  query getMiraklImportProcess($id: GlobalID!) {
    miraklImportProcess(id: $id) {
      id
      proxyId
      type
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
      exportFiles {
        id
        fileUrl
        file {
          name
          url
        }
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
          originalType
          allowsUnmappedValues
          localInstance {
            id
            name
            type
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

// eBay Property Queries
export const ebayPropertiesQuery = gql`
  query EbayProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayPropertyOrder
    $filter: EbayPropertyFilter
  ) {
    ebayProperties(
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
          localizedName
          type
          originalType
          allowsUnmappedValues
          marketplace {
            id
            name
          }
          localInstance {
            id
            name
            type
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

export const sheinPropertiesQuery = gql`
  query SheinProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinPropertyOrder
    $filter: SheinPropertyFilter
  ) {
    sheinProperties(
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
          nameEn
          mappedLocally
          type
          originalType
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

export const miraklPropertiesQuery = gql`
  query MiraklProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklPropertyOrder
    $filter: MiraklPropertyFilter
  ) {
    miraklProperties(
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
          code
          name
          representationType
          representationTypeDecided
          mappedLocally
          mappedRemotely
          type
          originalType
          allowsUnmappedValues
          defaultValue
          localInstance {
            id
            name
            type
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

export const sheinPropertiesByRemoteIdsQuery = gql`
  query SheinPropertiesByRemoteIds($first: Int, $filter: SheinPropertyFilter) {
    sheinProperties(first: $first, filters: $filter) {
      edges {
        node {
          id
          remoteId
          name
          nameEn
          localInstance {
            id
            name
          }
        }
      }
    }
  }
`;

export const getSheinPropertyQuery = gql`
  query getSheinProperty($id: GlobalID!) {
    sheinProperty(id: $id) {
      id
      mappedLocally
      mappedRemotely
      remoteId
      name
      nameEn
      type
      originalType
      allowsUnmappedValues
      yesTextValue
      noTextValue
      localInstance {
        id
        name
        type
      }
    }
  }
`;

export const getMiraklPropertyQuery = gql`
  query getMiraklProperty($id: GlobalID!) {
    miraklProperty(id: $id) {
      id
      code
      name
      language
      representationType
      representationTypeDecided
      description
      example
      mappedLocally
      mappedRemotely
      type
      originalType
      allowsUnmappedValues
      defaultValue
      yesTextValue
      noTextValue
      descriptionTranslations
      labelTranslations
      typeParameters
      validations
      transformations
      rawData
      localInstance {
        id
        name
        type
      }
    }
  }
`;

export const ebayInternalPropertiesQuery = gql`
  query EbayInternalProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayInternalPropertyOrder
    $filter: EbayInternalPropertyFilter
  ) {
    ebayInternalProperties(
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
          code
          name
          type
          isRoot
          mappedLocally
          mappedRemotely
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

export const ebayInternalPropertyOptionsQuery = gql`
  query EbayInternalPropertyOptions(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayInternalPropertyOptionOrder
    $filter: EbayInternalPropertyOptionFilter
  ) {
    ebayInternalPropertyOptions(
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
          value
          label
          description
          sortOrder
          isActive
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

export const getEbayInternalPropertyQuery = gql`
  query getEbayInternalProperty($id: GlobalID!) {
    ebayInternalProperty(id: $id) {
      id
      code
      name
      type
      allowedTypes
      isRoot
      mappedLocally
      mappedRemotely
      localInstance {
        id
        name
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
      originalType
      allowsUnmappedValues
      yesTextValue
      noTextValue
      localInstance {
        id
        name
        type
      }
    }
  }
`;

export const getEbayPropertyQuery = gql`
  query getEbayProperty($id: GlobalID!) {
    ebayProperty(id: $id) {
      id
      mappedLocally
      mappedRemotely
      localizedName
      translatedName
      type
      originalType
      allowsUnmappedValues
      yesTextValue
      noTextValue
      marketplace {
        id
        name
      }
      localInstance {
        id
        name
        type
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
            code
            type
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
      boolValue
      amazonProperty {
        id
        name
        code
        type
        originalType
        localInstance {
          id
          name
          type
        }
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

export const ebayPropertySelectValuesQuery = gql`
  query EbayPropertySelectValues(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayPropertySelectValueOrder
    $filter: EbayPropertySelectValueFilter
  ) {
    ebayPropertySelectValues(
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
          ebayProperty {
            id
            localizedName
            mappedLocally
            mappedRemotely
          }
          marketplace {
            id
            name
          }
          localizedValue
          translatedValue
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

export const sheinInternalPropertiesQuery = gql`
  query SheinInternalProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinInternalPropertyOrder
    $filter: SheinInternalPropertyFilter
  ) {
    sheinInternalProperties(
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
          code
          name
          type
          mappedLocally
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

export const miraklInternalPropertiesQuery = gql`
  query MiraklInternalProperties(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklInternalPropertyOrder
    $filter: MiraklInternalPropertyFilter
  ) {
    miraklInternalProperties(
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
          type
          isCondition
          mappedLocally
          mappedRemotely
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

export const getSheinInternalPropertyQuery = gql`
  query getSheinInternalProperty($id: GlobalID!) {
    sheinInternalProperty(id: $id) {
      id
      code
      name
      type
      allowedTypes
      mappedLocally
      mappedRemotely
      localInstance {
        id
        name
      }
    }
  }
`;

export const getMiraklInternalPropertyQuery = gql`
  query getMiraklInternalProperty($id: GlobalID!) {
    miraklInternalProperty(id: $id) {
      id
      name
      type
      isCondition
      mappedLocally
      mappedRemotely
      localInstance {
        id
        name
      }
    }
  }
`;

export const sheinInternalPropertyOptionsQuery = gql`
  query SheinInternalPropertyOptions(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinInternalPropertyOptionOrder
    $filter: SheinInternalPropertyOptionFilter
  ) {
    sheinInternalPropertyOptions(
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
          value
          label
          description
          sortOrder
          isActive
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

export const sheinPropertySelectValuesQuery = gql`
  query SheinPropertySelectValues(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinPropertySelectValueOrder
    $filter: SheinPropertySelectValueFilter
  ) {
    sheinPropertySelectValues(
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
          value
          valueEn
          remoteProperty {
            id
            name
            localInstance {
              id
              name
            }
          }
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

export const miraklPropertySelectValuesQuery = gql`
  query MiraklPropertySelectValues(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklPropertySelectValueOrder
    $filter: MiraklPropertySelectValueFilter
  ) {
    miraklPropertySelectValues(
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
          label
          mappedLocally
          mappedRemotely
          remoteProperty {
            id
            name
            representationType
            localInstance {
              id
              name
            }
          }
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

export const miraklPropertySelectValuesQuerySelector = gql`
  query MiraklPropertySelectValuesSelector(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklPropertySelectValueOrder
    $filter: MiraklPropertySelectValueFilter
  ) {
    miraklPropertySelectValues(
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
          code
          value
          label
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

export const getEbayPropertySelectValueQuery = gql`
  query getEbayPropertySelectValue($id: GlobalID!) {
    ebayPropertySelectValue(id: $id) {
      id
      mappedLocally
      mappedRemotely
      boolValue
      ebayProperty {
        id
        localizedName
        type
        originalType
        localInstance {
          id
          name
          type
        }
      }
      marketplace {
        id
        name
      }
      localizedValue
      translatedValue
      localInstance {
        id
        value
      }
    }
  }
`;

export const getSheinPropertySelectValueQuery = gql`
  query getSheinPropertySelectValue($id: GlobalID!) {
    sheinPropertySelectValue(id: $id) {
      id
      mappedLocally
      mappedRemotely
      remoteId
      boolValue
      value
      valueEn
      remoteProperty {
        id
        name
        type
        originalType
        mappedLocally
        localInstance {
          id
          name
          type
        }
      }
      localInstance {
        id
        value
      }
    }
  }
`;

export const getMiraklPropertySelectValueQuery = gql`
  query getMiraklPropertySelectValue($id: GlobalID!) {
    miraklPropertySelectValue(id: $id) {
      id
      proxyId
      salesChannel {
        id
      }
      code
      value
      label
      boolValue
      mappedLocally
      mappedRemotely
      labelTranslations
      valueLabelTranslations
      rawData
      remoteProperty {
        id
        name
        representationType
        type
        originalType
        localInstance {
          id
          name
          type
        }
      }
      localInstance {
        id
        value
      }
    }
  }
`;

export const miraklProductTypesQuery = gql`
  query MiraklProductTypes(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklProductTypeOrder
    $filter: MiraklProductTypeFilter
  ) {
    miraklProductTypes(
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
          remoteId
          name
          imported
          mappedLocally
          readyToPush
          localInstance {
            id
            value
            productType {
              id
              value
            }
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

export const getMiraklProductTypeQuery = gql`
  query getMiraklProductType($id: GlobalID!) {
    miraklProductType(id: $id) {
      id
      remoteId
      name
      salesChannel {
        id
      }
      template {
        name
        url
      }
      imported
      mappedLocally
      mappedRemotely
      localInstance {
        id
        value
        productType {
          id
          value
        }
      }
      items {
        id
        required
        variant
        requirementLevel
        remoteProperty {
          id
          code
          name
          mappedLocally
        }
        localInstance {
          id
          type
          sortOrder
          property {
            id
            name
          }
        }
      }
    }
  }
`;

export const miraklImportProcessesQuery = gql`
  query MiraklImportProcesses(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklImportProcessOrder
    $filter: MiraklImportProcessFilter
  ) {
    miraklImportProcesses(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          proxyId
          type
          status
          percentage
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

export const remoteDocumentTypesQuery = gql`
  query RemoteDocumentTypes(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: RemoteDocumentTypeOrder
    $filter: RemoteDocumentTypeFilter
  ) {
    remoteDocumentTypes(
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
          effectiveName
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

export const getRemoteDocumentTypeQuery = gql`
  query getRemoteDocumentType($id: GlobalID!) {
    remoteDocumentType(id: $id) {
      id
      name
      translatedName
      remoteId
      description
      requiredCategories
      optionalCategories
      localInstance {
        id
        name
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

export const ebayProductTypesQuery = gql`
  query EbayProductTypes(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: EbayProductTypeOrder
    $filter: EbayProductTypeFilter
  ) {
    ebayProductTypes(
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
          remoteId
          mappedLocally
          mappedRemotely
          name
          translatedName
          marketplace {
            id
            name
          }
          localInstance {
            id
            value
            productType {
              id
              value
            }
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

export const getEbayProductTypeQuery = gql`
  query getEbayProductType($id: GlobalID!) {
    ebayProductType(id: $id) {
      id
      mappedLocally
      mappedRemotely
      imported
      name
      translatedName
      remoteId
      marketplace {
        id
        name
        defaultCategoryTreeId
      }
      localInstance {
        id
        value
        productType {
          id
          value
        }
      }
      items {
        id
        remoteType
        ebayProperty {
          id
          localizedName
          mappedLocally
          allowsUnmappedValues
          type
        }
      }
    }
  }
`;

export const getSheinProductTypeQuery = gql`
  query getSheinProductType($id: GlobalID!) {
    sheinProductType(id: $id) {
      id
      mappedLocally
      mappedRemotely
      imported
      name
      translatedName
      remoteId
      categoryId
      localInstance {
        id
        value
        productType {
          id
          value
        }
      }
      items {
        id
        visibility
        attributeType
        requirement
        isMainAttribute
        allowsUnmappedValues
        remarks
        property {
          id
          name
        }
        localInstance {
          id
        }
      }
    }
  }
`;

export const sheinProductTypesQuery = gql`
  query SheinProductTypes(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: SheinProductTypeOrder
    $filter: SheinProductTypeFilter
  ) {
    sheinProductTypes(
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
          mappedLocally
          mappedRemotely
          localInstance {
            id
            value
            productType {
              id
              value
            }
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

export const ebayImportProcessesQuery = gql`
  query EbayImportProcesses(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $order: EbaySalesChannelImportOrder,
    $filter: EbaySalesChannelImportFilter
  ) {
    ebayImportProcesses(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
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

export const sheinImportProcessesQuery = gql`
  query SheinImportProcesses(
    $first: Int,
    $last: Int,
    $after: String,
    $before: String,
    $order: SheinSalesChannelImportOrder,
    $filter: SheinSalesChannelImportFilter
  ) {
    sheinImportProcesses(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
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
