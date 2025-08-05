import { gql } from 'graphql-tag';

export const amazonProductsQuery = gql`
  query AmazonProducts($localInstance: GlobalID!) {
    amazonProducts(filters: { localInstance: { id: { exact: $localInstance } } }) {
      edges {
        node {
          id
          createdMarketplaces
          issues {
            edges {
              node {
                id
                code
                message
                severity
                isValidationIssue
                view {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

