import { gql } from 'graphql-tag';

export const publicIssuesQuery = gql`
  query PublicIssues(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: PublicIssueOrder
    $filter: PublicIssueFilter
  ) {
    publicIssues(
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
          integrationType {
            id
            key
            type
            subtype
            name
          }
          issue
          cause
          recommendedFix
          createdAt
          updatedAt
          categories {
            id
            name
            code
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

export const publicIssueQuery = gql`
  query PublicIssue($id: ID!) {
    publicIssue(id: $id) {
      id
      code
      integrationType {
        id
        key
        type
        subtype
        name
      }
      issue
      cause
      recommendedFix
      createdAt
      updatedAt
      categories {
        id
        name
        code
      }
      images {
        id
        imageUrl
      }
    }
  }
`;

export const publicIssueCategoriesQuery = gql`
  query PublicIssueCategories(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $filter: PublicIssueCategoryFilter
  ) {
    publicIssueCategories(
      first: $first
      last: $last
      after: $after
      before: $before
      filters: $filter
    ) {
      edges {
        node {
          id
          name
          code
        }
        cursor
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
