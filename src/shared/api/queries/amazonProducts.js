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

