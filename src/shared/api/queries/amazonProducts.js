import { gql } from 'graphql-tag';

export const amazonProductsQuery = gql`
  query AmazonProducts($localInstance: GlobalID!) {
    amazonProducts(filters: { localInstance: { id: { exact: $localInstance } } }) {
      edges {
        node {
          id
          createdMarketplaces
          issues {
            id
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

