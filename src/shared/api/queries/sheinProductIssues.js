import { gql } from 'graphql-tag';

export const sheinProductIssuesQuery = gql`
  query SheinProductIssues($filter: SheinProductIssueFilter) {
    sheinProductIssues(filters: $filter) {
      edges {
        node {
          id
          createdAt
          failedReason
          remoteProduct {
            id
          }
        }
      }
    }
  }
`;

