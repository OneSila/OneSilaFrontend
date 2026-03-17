import { gql } from 'graphql-tag';

export const miraklProductIssuesQuery = gql`
  query MiraklProductIssues($filter: MiraklProductIssueFilter) {
    miraklProductIssues(filters: $filter) {
      edges {
        node {
          id
          mainCode
          code
          message
          severity
          reasonLabel
          attributeCode
          isRejected
          views {
            id
            remoteId
            name
          }
          remoteProduct {
            id
            remoteSku
            localInstance {
              id
              name
              sku
            }
          }
        }
      }
    }
  }
`;

export const miraklProductIssuesListingQuery = gql`
  query MiraklProductIssuesListing(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: MiraklProductIssueOrder
    $filter: MiraklProductIssueFilter
  ) {
    miraklProductIssues(
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
          mainCode
          code
          message
          severity
          isRejected
          views {
            id
            name
          }
          remoteProduct {
            id
            remoteSku
            localInstance {
              id
              name
            }
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

export const miraklProductIssueShowQuery = gql`
  query MiraklProductIssueShow($id: ID!) {
    miraklProductIssue(id: $id) {
      id
      mainCode
      code
      message
      severity
      reasonLabel
      attributeCode
      isRejected
      rawData
      views {
        id
        remoteId
        name
      }
      remoteProduct {
        id
        remoteSku
        localInstance {
          id
          name
          sku
        }
      }
    }
  }
`;
