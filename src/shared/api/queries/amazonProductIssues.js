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
