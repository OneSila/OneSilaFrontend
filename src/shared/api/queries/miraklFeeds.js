import { gql } from 'graphql-tag';

export const miraklFeedsQuery = gql`
  query MiraklFeeds(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklSalesChannelFeedOrder
    $filter: MiraklSalesChannelFeedFilter
  ) {
    miraklFeeds(
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
          type
          stage
          status
          remoteId
          errorMessage
          itemsCount
          rowsCount
          lastSyncedAt
          lastSubmittedAt
          lastPolledAt
          createdAt
          importStatus
          reasonStatus
          remoteDateCreated
          hasErrorReport
          hasNewProductReport
          hasTransformationErrorReport
          hasTransformedFile
          errorReportFileUrl
          newProductReportFileUrl
          transformedFileUrl
          transformationErrorReportFileUrl
          productType {
            id
            name
            remoteId
            templateUrl
          }
          salesChannelView {
            id
            name
            remoteId
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

export const miraklFeedShowQuery = gql`
  query MiraklFeedShow($id: GlobalID!) {
    miraklFeed(id: $id) {
      id
      type
      stage
      status
      importStatus
      reasonStatus
      remoteId
      productRemoteId
      offerRemoteId
      errorMessage
      payloadData
      rawData
      itemsCount
      rowsCount
      lastSyncedAt
      lastSubmittedAt
      lastPolledAt
      createdAt
      updatedAt
      remoteDateCreated
      remoteShopId
      conversionType
      conversionOptionsAiEnrichmentEnabled
      conversionOptionsAiRewriteEnabled
      integrationDetailsInvalidProducts
      integrationDetailsProductsNotAcceptedInTime
      integrationDetailsProductsNotSynchronizedInTime
      integrationDetailsProductsReimported
      integrationDetailsProductsSuccessfullySynchronized
      integrationDetailsProductsWithSynchronizationIssues
      integrationDetailsProductsWithWrongIdentifiers
      integrationDetailsRejectedProducts
      hasErrorReport
      hasNewProductReport
      hasTransformationErrorReport
      hasTransformedFile
      transformLinesRead
      transformLinesInSuccess
      transformLinesInError
      transformLinesWithWarning
      fileUrl
      errorReportFileUrl
      newProductReportFileUrl
      transformedFileUrl
      transformationErrorReportFileUrl
      productType {
        id
        name
        remoteId
        templateUrl
      }
      salesChannel {
        id
        hostname
      }
      salesChannelView {
        id
        name
        remoteId
      }
      products {
        id
        sku
        name
      }
    }
  }
`;
