import { gql } from 'graphql-tag';

export const amazonGtinExemptionsQuery = gql`
  query AmazonGtinExemptions($productId: GlobalID!, $viewId: GlobalID!) {
    amazonGtinExemptions(
      filters: { product: { id: { exact: $productId } }, view: { id: { exact: $viewId } } }
    ) {
      edges {
        node {
          id
          value
        }
      }
    }
  }
`;
