import { gql } from 'graphql-tag';

export const amazonProductIssuesQuery = gql`
  query AmazonProductIssues($filter: AmazonProductIssueFilter) {
    amazonProductIssues(filters: $filter) {
      edges {
        node {
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
          remoteProduct {
            id
          localInstance {
            id
          }
          }
        }
      }
    }
  }
`;

export const amazonProductIssuesListingQuery = gql`
  query AmazonProductIssuesListing(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $order: AmazonProductIssueOrder
    $filter: AmazonProductIssueFilter
  ) {
    amazonProductIssues(
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
          severity
          isValidationIssue
          isSuppressed
          enforcementActions
          view {
            apiRegionCode
          }
          remoteProduct {
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

export const amazonProductIssueShowQuery = gql`
  query AmazonProductIssueShow($id: GlobalID!) {
    amazonProductIssues(first: 1, filters: { id: { exact: $id } }) {
      edges {
        node {
          id
          code
          message
          severity
          categories
          enforcementActions
          enforcementExemptionStatus
          enforcementExemptionExpiryDate
          enforcementAttributeNames
          isSuppressed
          isValidationIssue
          rawData
          view {
            apiRegionCode
          }
          remoteProduct {
            localInstance {
              id
              name
            }
          }
        }
      }
    }
  }
`;
