import { gql } from 'graphql-tag';

export const amazonProductsQuery = gql`
  query AmazonProducts($localInstance: GlobalID!) {
    amazonProducts(filters: { localInstance: { id: { exact: $localInstance } } }) {
      edges {
        node {
          id
          createdMarketplaces
          lastSyncAt
          syncingCurrentPercentage
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

