import { gql } from 'graphql-tag';

export const documentTypesQuery = gql`
  query DocumentTypes($first: Int, $last: Int, $after: String, $before: String, $order: DocumentTypeOrder, $filter: DocumentTypeFilter) {
    documentTypes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          code
          description
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

export const documentTypesQuerySelector = gql`
  query DocumentTypes($first: Int, $last: Int, $after: String, $before: String, $order: DocumentTypeOrder, $filter: DocumentTypeFilter) {
    documentTypes(first: $first, last: $last, after: $after, before: $before, order: $order, filters: $filter) {
      edges {
        node {
          id
          name
          code
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

export const getDocumentTypeQuery = gql`
  query getDocumentType($id: GlobalID!) {
    documentType(id: $id) {
      id
      name
      code
      description
    }
  }
`;
