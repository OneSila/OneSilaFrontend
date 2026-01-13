import { gql } from 'graphql-tag';

export const amazonProductsQuery = gql`
  query AmazonProducts($localInstance: GlobalID!) {
    amazonProducts(filters: { localInstance: { id: { exact: $localInstance } } }) {
      edges {
        node {
          id
          localInstance {
            id
            name
            sku
          }
          createdMarketplaces
          lastSyncAt
          syncingCurrentPercentage
          remoteParentProduct {
            id
            localInstance {
              id
              name
              sku
            }
          }
          issues {
            id
            createdAt
            code
            message
            severity
            isValidationIssue
            isSuppressed
            enforcementActions
            view {
              remoteId
              name
            }
          }
        }
      }
    }
  }
`;

export const amazonBrowseNodesQuery = gql`
  query AmazonBrowseNodes($filter: AmazonBrowseNodeFilter) {
    amazonBrowseNodes(filters: $filter) {
      edges {
        node {
          id
          remoteId
          name
          contextName
          hasChildren
          isRoot
          childNodeIds
          browsePathByName
          productTypeDefinitions
          pathDepth
        }
      }
    }
  }
`;

export const amazonProductBrowseNodesQuery = gql`
  query AmazonProductBrowseNodes($filter: AmazonProductBrowseNodeFilter) {
    amazonProductBrowseNodes(filters: $filter) {
      edges {
        node {
          id
          recommendedBrowseNodeId
          view {
            id
          }
        }
      }
    }
  }
`;

export const amazonProductBrowseNodesBulkQuery = gql`
  query AmazonProductBrowseNodesBulk($first: Int, $after: String, $filter: AmazonProductBrowseNodeFilter) {
    amazonProductBrowseNodes(first: $first, after: $after, filters: $filter) {
      edges {
        node {
          id
          recommendedBrowseNodeId
          product {
            id
          }
          view {
            id
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const amazonChildRemoteProductsQuery = gql`
  query AmazonChildRemoteProducts($remoteParentProductId: GlobalID!) {
    amazonProducts(
      filters: { remoteParentProduct: { id: { exact: $remoteParentProductId } } }
    ) {
      edges {
        node {
          id
          localInstance {
            id
            name
            sku
          }
        }
      }
    }
  }
`;
