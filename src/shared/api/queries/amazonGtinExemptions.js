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

export const amazonGtinExemptionsBulkQuery = gql`
  query AmazonGtinExemptionsBulk($first: Int, $after: String, $filter: AmazonGtinExemptionFilter) {
    amazonGtinExemptions(first: $first, after: $after, filters: $filter) {
      edges {
        node {
          id
          value
          product { id }
          view { id }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
